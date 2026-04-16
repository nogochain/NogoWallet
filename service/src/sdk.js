/**
 * NogoChain SDK Integration Service
 * Reuses existing JavaScript SDK with enhancements for wallet operations
 */

import axios from 'axios';

class NogoChainRPC {
  constructor(baseURL = 'http://localhost:8080') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async getChainInfo() {
    const { data } = await this.client.get('/chain/info');
    return data;
  }

  async getBalance(address) {
    const { data } = await this.client.get(`/balance/${address}`);
    return {
      balance: data.balance || 0,
      nonce: data.nonce || 0
    };
  }

  async getBlock(heightOrHash) {
    const endpoint = typeof heightOrHash === 'number' 
      ? `/block/height/${heightOrHash}` 
      : `/block/hash/${heightOrHash}`;
    const { data } = await this.client.get(endpoint);
    return data;
  }

  async getTransaction(txId) {
    const { data } = await this.client.get(`/tx/${txId}`);
    return data;
  }

  async getMempool() {
    const { data } = await this.client.get('/mempool');
    return data;
  }

  async getAddressTransactions(address, limit = 50, offset = 0) {
    const { data } = await this.client.get(`/address/${address}/txs?limit=${limit}&offset=${offset}`);
    return {
      txs: data.txs || [],
      total: data.total || 0
    };
  }

  async estimateFee(speed = 'average', size = 350) {
    try {
      const { data } = await this.client.get(`/tx/estimate_fee?speed=${speed}&size=${size}`);
      return data.estimatedFee || 45000;
    } catch (e) {
      console.warn('Fee estimation failed, using default:', e);
      return 45000;
    }
  }

  async sendTransaction(tx) {
    const { data } = await this.client.post('/tx', tx);
    return {
      accepted: data.accepted || data.Accepted || false,
      txId: data.txId || data.TxID || data.txid,
      message: data.message || data.Message || data.error
    };
  }

  async getTxProof(txId) {
    const { data } = await this.client.get(`/tx/proof/${txId}`);
    return data;
  }

  subscribeToMempool(callback) {
    const wsUrl = this.baseURL.replace('http', 'ws') + '/ws';
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'mempool') {
        callback(msg.data);
      }
    };
    
    return ws;
  }

  subscribeToBlocks(callback) {
    const wsUrl = this.baseURL.replace('http', 'ws') + '/ws';
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'block') {
        callback(msg.data);
      }
    };
    
    return ws;
  }
}

export class TransactionBuilder {
  constructor(rpcClient) {
    this.rpc = rpcClient || new NogoChainRPC();
  }

  async computeFromAddress(publicKeyBytes) {
    const { sha256 } = await import('@noble/hashes/sha256');
    
    const pubKeyHash = sha256(publicKeyBytes);
    
    const addressData = new Uint8Array(1 + 32);
    addressData[0] = 0x00;
    addressData.set(pubKeyHash, 1);
    
    const checksumHash = sha256(addressData);
    const checksumBytes = checksumHash.slice(0, 4);
    
    const fullAddress = new Uint8Array(1 + 32 + 4);
    fullAddress.set(addressData, 0);
    fullAddress.set(checksumBytes, 1 + 32);
    
    return 'NOGO' + Array.from(fullAddress).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async buildTransfer(fromPubKey, toAddress, amount, fee, nonce, data = '') {
    const fromAddr = await this.computeFromAddress(fromPubKey);
    
    const tx = {
      type: 'transfer',
      chainId: 1,
      fromPubKey: uint8ArrayToBase64(fromPubKey),
      toAddress,
      amount,
      fee,
      nonce
    };
    
    if (data && data.length > 0) {
      tx.data = data;
    }
    
    return tx;
  }

  async createSigningHash(tx) {
    const { sha256 } = await import('@noble/hashes/sha256');
    
    const signingObj = {
      type: tx.type,
      chainId: tx.chainId,
      fromAddr: tx.fromAddr,
      toAddress: tx.toAddress,
      amount: tx.amount,
      fee: tx.fee,
      nonce: tx.nonce
    };
    
    if (tx.data && tx.data.length > 0) {
      signingObj.data = tx.data;
    }
    
    const jsonStr = JSON.stringify(signingObj);
    const encoder = new TextEncoder();
    const preimage = encoder.encode(jsonStr);
    const hash = sha256(preimage);
    
    return hash;
  }

  async signTransaction(tx, privateKey) {
    const { ed25519 } = await import('@noble/ed25519');
    
    const pubKeyBytes = base64ToUint8Array(tx.fromPubKey);
    tx.fromAddr = await this.computeFromAddress(pubKeyBytes);
    
    const msgHash = await this.createSigningHash(tx);
    
    const signature = await ed25519.sign(msgHash, privateKey);
    
    tx.signature = uint8ArrayToBase64(signature);
    
    return tx;
  }

  async createAndSendTransaction(privateKey, publicKey, toAddress, amountNOGO) {
    const { sha256 } = await import('@noble/hashes/sha256');
    const { ed25519 } = await import('@noble/ed25519');
    
    const { address } = await this.computeAddressFromPubKey(publicKey);
    const { balance, nonce: chainNonce } = await this.rpc.getBalance(address);
    
    let fee = await this.rpc.estimateFee('average', 350);
    
    let nonce = chainNonce + 1;
    try {
      const mempool = await this.rpc.getMempool();
      const pendingTxs = (mempool.txs || []).filter(tx => tx.fromAddr === address);
      
      if (pendingTxs.length > 0) {
        const maxPendingNonce = Math.max(...pendingTxs.map(tx => tx.nonce));
        nonce = maxPendingNonce + 1;
        
        const pendingTx = pendingTxs.find(tx => tx.nonce === nonce - 1);
        if (pendingTx) {
          fee = Math.floor(pendingTx.fee * 1.1) + 1;
        }
      }
    } catch (e) {
      console.warn('Failed to check mempool:', e);
    }
    
    const amount = Math.floor(amountNOGO * 1e8);
    
    if (balance < amount + fee) {
      throw new Error('Insufficient balance');
    }
    
    const tx = await this.buildTransfer(publicKey, toAddress, amount, fee, nonce);
    
    const signedTx = await this.signTransaction(tx, privateKey);
    
    const result = await this.rpc.sendTransaction(signedTx);
    
    if (!result.accepted) {
      throw new Error(result.message || 'Transaction rejected');
    }
    
    return result;
  }

  async computeAddressFromPubKey(publicKeyBytes) {
    const { sha256 } = await import('@noble/hashes/sha256');
    
    const pubKeyHash = sha256(publicKeyBytes);
    const addressData = new Uint8Array(1 + 32);
    addressData[0] = 0x00;
    addressData.set(pubKeyHash, 1);
    
    const checksumHash = sha256(addressData);
    const checksumBytes = checksumHash.slice(0, 4);
    
    const fullAddress = new Uint8Array(1 + 32 + 4);
    fullAddress.set(addressData, 0);
    fullAddress.set(checksumBytes, 1 + 32);
    
    const address = 'NOGO' + Array.from(fullAddress).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return { address, publicKey: publicKeyBytes };
  }
}

export class WalletService {
  constructor(rpcClient) {
    this.rpc = rpcClient || new NogoChainRPC();
    this.txBuilder = new TransactionBuilder(this.rpc);
  }

  async getBalance(address) {
    return await this.rpc.getBalance(address);
  }

  async getTransactions(address, limit = 50, offset = 0) {
    return await this.rpc.getAddressTransactions(address, limit, offset);
  }

  async send(privateKey, publicKey, toAddress, amountNOGO) {
    return await this.txBuilder.createAndSendTransaction(
      privateKey,
      publicKey,
      toAddress,
      amountNOGO
    );
  }

  async getTransaction(txId) {
    return await this.rpc.getTransaction(txId);
  }
}

function uint8ArrayToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof window !== 'undefined' ? window.btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
}

function base64ToUint8Array(base64) {
  const binary = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export default NogoChainRPC;

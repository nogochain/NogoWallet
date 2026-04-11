#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use pbkdf2::pbkdf2_hmac;
use sha2::Sha256;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use thiserror::Error;
use rand::Rng;

type Result<T> = std::result::Result<T, WalletError>;

#[derive(Error, Debug)]
pub enum WalletError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("Encryption error: {0}")]
    Encryption(String),
    #[error("Decryption error: {0}")]
    Decryption(String),
    #[error("Wallet not found: {0}")]
    NotFound(String),
    #[error("Invalid data: {0}")]
    InvalidData(String),
}

// Implement Into<InvokeError> for WalletError
impl From<WalletError> for tauri::InvokeError {
    fn from(error: WalletError) -> Self {
        tauri::InvokeError::from(error.to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedWallet {
    pub encrypted: String,
    pub salt: String,
    pub iv: String,
    pub version: u32,
    pub address: String,
    pub public_key: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WalletMetadata {
    pub address: String,
    pub created_at: u64,
}

// Secure storage manager
pub struct WalletStorage {
    data_dir: PathBuf,
}

impl WalletStorage {
    pub fn new() -> Result<Self> {
        let data_dir = dirs::data_dir()
            .ok_or_else(|| WalletError::Io(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                "Could not determine data directory"
            )))?
            .join("NogoWallet");
        
        fs::create_dir_all(&data_dir)?;
        
        Ok(Self { data_dir })
    }
    
    fn get_wallet_path(&self, address: &str) -> PathBuf {
        self.data_dir.join(format!("{}.json", address))
    }
    
    fn get_metadata_path(&self) -> PathBuf {
        self.data_dir.join("metadata.json")
    }
    
    pub fn save_wallet(&self, address: &str, data: &str) -> Result<()> {
        let path = self.get_wallet_path(address);
        fs::write(path, data)?;
        
        // Update metadata
        self.update_metadata(address)?;
        
        Ok(())
    }
    
    pub fn load_wallet(&self, address: &str) -> Result<String> {
        let path = self.get_wallet_path(address);
        
        if !path.exists() {
            return Err(WalletError::NotFound(address.to_string()));
        }
        
        let data = fs::read_to_string(path)?;
        Ok(data)
    }
    
    pub fn list_wallets(&self) -> Result<Vec<WalletMetadata>> {
        let metadata_path = self.get_metadata_path();
        
        if !metadata_path.exists() {
            return Ok(Vec::new());
        }
        
        let data = fs::read_to_string(metadata_path)?;
        let metadata: Vec<WalletMetadata> = serde_json::from_str(&data)?;
        
        Ok(metadata)
    }
    
    pub fn delete_wallet(&self, address: &str) -> Result<()> {
        let path = self.get_wallet_path(address);
        
        if path.exists() {
            fs::remove_file(path)?;
        }
        
        // Remove from metadata
        self.update_metadata_after_delete(address)?;
        
        Ok(())
    }
    
    fn update_metadata(&self, address: &str) -> Result<()> {
        let mut metadata = self.list_wallets()?;
        
        // Check if already exists
        if !metadata.iter().any(|m| m.address == address) {
            metadata.push(WalletMetadata {
                address: address.to_string(),
                created_at: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs(),
            });
            
            let data = serde_json::to_string_pretty(&metadata)?;
            fs::write(self.get_metadata_path(), data)?;
        }
        
        Ok(())
    }
    
    fn update_metadata_after_delete(&self, address: &str) -> Result<()> {
        let mut metadata = self.list_wallets()?;
        metadata.retain(|m| m.address != address);
        
        let data = serde_json::to_string_pretty(&metadata)?;
        fs::write(self.get_metadata_path(), data)?;
        
        Ok(())
    }
}

// Encryption functions
fn derive_key(password: &str, salt: &[u8]) -> Vec<u8> {
    let mut key = [0u8; 32];
    pbkdf2_hmac::<Sha256>(
        password.as_bytes(),
        salt,
        100_000, // 100,000 iterations for production security
        &mut key,
    );
    key.to_vec()
}

fn encrypt_data(data: &[u8], password: &str) -> Result<(String, String, String)> {
    let mut salt = [0u8; 16];
    OsRng.fill(&mut salt);
    
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill(&mut nonce_bytes);
    
    let key = derive_key(password, &salt);
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| WalletError::Encryption(e.to_string()))?;
    
    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, data)
        .map_err(|e| WalletError::Encryption(e.to_string()))?;
    
    Ok((
        base64_encode(&ciphertext),
        base64_encode(&salt),
        base64_encode(nonce.as_slice()),
    ))
}

fn decrypt_data(encrypted: &str, salt: &str, iv: &str, password: &str) -> Result<Vec<u8>> {
    let encrypted_bytes = base64_decode(encrypted)
        .ok_or_else(|| WalletError::Decryption("Invalid encrypted data".to_string()))?;
    let salt_bytes = base64_decode(salt)
        .ok_or_else(|| WalletError::Decryption("Invalid salt".to_string()))?;
    let iv_bytes = base64_decode(iv)
        .ok_or_else(|| WalletError::Decryption("Invalid IV".to_string()))?;
    
    let key = derive_key(password, &salt_bytes);
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| WalletError::Decryption(e.to_string()))?;
    
    let nonce = Nonce::from_slice(&iv_bytes);
    let plaintext = cipher
        .decrypt(nonce, encrypted_bytes.as_slice())
        .map_err(|e| WalletError::Decryption("Wrong password or corrupted data".to_string()))?;
    
    Ok(plaintext)
}

fn base64_encode(data: &[u8]) -> String {
    use base64::{engine::general_purpose, Engine as _};
    general_purpose::STANDARD.encode(data)
}

fn base64_decode(data: &str) -> Option<Vec<u8>> {
    use base64::{engine::general_purpose, Engine as _};
    general_purpose::STANDARD.decode(data).ok()
}

// Tauri commands
#[tauri::command]
fn save_wallet(storage: tauri::State<WalletStorage>, address: String, data: String) -> Result<()> {
    storage.save_wallet(&address, &data)
}

#[tauri::command]
fn load_wallet(storage: tauri::State<WalletStorage>, address: String) -> Result<String> {
    storage.load_wallet(&address)
}

#[tauri::command]
fn list_wallets(storage: tauri::State<WalletStorage>) -> Result<Vec<WalletMetadata>> {
    storage.list_wallets()
}

#[tauri::command]
fn delete_wallet(storage: tauri::State<WalletStorage>, address: String) -> Result<()> {
    storage.delete_wallet(&address)
}

#[tauri::command]
fn encrypt_wallet_data(
    private_key: String,
    mnemonic: String,
    password: String,
) -> Result<EncryptedWallet> {
    let sensitive_data = serde_json::json!({
        "privateKey": private_key,
        "mnemonic": mnemonic
    });
    
    let data_bytes = serde_json::to_vec(&sensitive_data)?;
    let (encrypted, salt, iv) = encrypt_data(&data_bytes, &password)?;
    
    Ok(EncryptedWallet {
        encrypted,
        salt,
        iv,
        version: 1,
        address: String::new(), // Will be set by caller
        public_key: String::new(), // Will be set by caller
    })
}

#[tauri::command]
fn decrypt_wallet_data(
    encrypted_data: EncryptedWallet,
    password: String,
) -> Result<serde_json::Value> {
    let plaintext = decrypt_data(
        &encrypted_data.encrypted,
        &encrypted_data.salt,
        &encrypted_data.iv,
        &password,
    )?;
    
    let sensitive_data: serde_json::Value = serde_json::from_slice(&plaintext)?;
    
    Ok(serde_json::json!({
        "address": encrypted_data.address,
        "publicKey": encrypted_data.public_key,
        "privateKey": sensitive_data["privateKey"],
        "mnemonic": sensitive_data["mnemonic"],
        "encrypted": true
    }))
}

fn main() {
    tauri::Builder::default()
        .manage(WalletStorage::new().expect("Failed to initialize wallet storage"))
        .invoke_handler(tauri::generate_handler![
            save_wallet,
            load_wallet,
            list_wallets,
            delete_wallet,
            encrypt_wallet_data,
            decrypt_wallet_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

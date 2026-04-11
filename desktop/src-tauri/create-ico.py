from PIL import Image
import os

# Load PNG
png_path = r"d:\NogoChain\NogoWallet\AppAssets\Web\android-chrome-512x512.png"
output_path = r"d:\NogoChain\NogoWallet\desktop\src-tauri\icons\icon.ico"

# Open and convert
img = Image.open(png_path)
img.save(output_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])

print(f"ICO file created: {output_path}")

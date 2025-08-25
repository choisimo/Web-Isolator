"""
Encryption manager for Web Isolator 2.0
Handles encryption/decryption of sensitive environment variables.
"""
import os
import base64
from pathlib import Path
from typing import Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


class SecretManager:
    """Manages encryption and decryption of secret values"""
    
    def __init__(self, master_key_path: Optional[str] = None):
        if master_key_path is None:
            isolator_dir = Path.home() / ".isolator"
            isolator_dir.mkdir(exist_ok=True)
            master_key_path = str(isolator_dir / "master.key")
        
        self.master_key_path = master_key_path
        self.cipher = self._get_or_create_cipher()
    
    def _get_or_create_cipher(self) -> Fernet:
        """Get or create the encryption cipher"""
        if os.path.exists(self.master_key_path):
            # Load existing key
            with open(self.master_key_path, 'rb') as f:
                key = f.read()
        else:
            # Generate new key
            key = Fernet.generate_key()
            os.makedirs(os.path.dirname(self.master_key_path), exist_ok=True)
            with open(self.master_key_path, 'wb') as f:
                f.write(key)
            # Secure the key file (readable only by owner)
            os.chmod(self.master_key_path, 0o600)
        
        return Fernet(key)
    
    def encrypt(self, value: str) -> str:
        """Encrypt a string value"""
        if not value:
            return value
        
        encrypted_bytes = self.cipher.encrypt(value.encode('utf-8'))
        # Return base64 encoded string for database storage
        return base64.b64encode(encrypted_bytes).decode('utf-8')
    
    def decrypt(self, encrypted_value: str) -> str:
        """Decrypt an encrypted string value"""
        if not encrypted_value:
            return encrypted_value
        
        try:
            # Decode from base64
            encrypted_bytes = base64.b64decode(encrypted_value.encode('utf-8'))
            decrypted_bytes = self.cipher.decrypt(encrypted_bytes)
            return decrypted_bytes.decode('utf-8')
        except Exception as e:
            raise ValueError(f"Failed to decrypt value: {e}")
    
    def is_encrypted(self, value: str) -> bool:
        """Check if a value appears to be encrypted"""
        try:
            # Try to decode as base64 and decrypt
            encrypted_bytes = base64.b64decode(value.encode('utf-8'))
            self.cipher.decrypt(encrypted_bytes)
            return True
        except Exception:
            return False
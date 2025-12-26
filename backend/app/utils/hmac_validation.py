import hmac
import hashlib
import os

async def is_valid_hmac_signature(domain: str, signature: str) -> bool:
    """
    Validates an HMAC-SHA256 signature against a given domain and the expected secret.
    """
    expected_secret = os.getenv("EXPECTED_HMAC_SECRET")
    if not expected_secret:
        return False

    # The key for HMAC should be bytes
    key = expected_secret.encode('utf-8')
    message = domain.encode('utf-8')
    
    # Calculate the HMAC signature
    hmac_calculator = hmac.new(key, message, hashlib.sha256)
    generated_signature = hmac_calculator.hexdigest()

    # Compare the generated signature with the received signature
    return hmac.compare_digest(generated_signature, signature)
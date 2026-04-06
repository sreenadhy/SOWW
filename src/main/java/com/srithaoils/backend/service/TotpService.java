package com.srithaoils.backend.service;

import org.apache.commons.codec.binary.Base32;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

@Service
public class TotpService {

    private static final String TOTP_ALGORITHM = "HmacSHA1";
    private static final int TOTP_TIME_STEP = 30; // 30 seconds
    private static final int TOTP_DIGITS = 6;
    private static final Base32 base32 = new Base32();

    /**
     * Generate a new TOTP secret
     */
    public String generateSecret() {
        byte[] buffer = new byte[20];
        SecureRandom secureRandom = new SecureRandom();
        secureRandom.nextBytes(buffer);
        return base32.encodeToString(buffer);
    }

    /**
     * Generate QR code provisioning URI for Google Authenticator
     */
    public String generateProvisioningUri(String secret, String email, String issuer) {
        try {
            String encodedEmail = java.net.URLEncoder.encode(email, "UTF-8");
            String encodedIssuer = java.net.URLEncoder.encode(issuer, "UTF-8");
            return String.format(
                "otpauth://totp/%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d",
                encodedEmail,
                secret,
                encodedIssuer,
                TOTP_DIGITS,
                TOTP_TIME_STEP
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate provisioning URI", e);
        }
    }

    /**
     * Verify a TOTP code
     * Allows for time drift of ±1 time step (±30 seconds)
     */
    public boolean verifyCode(String secret, String code) {
        if (secret == null || secret.isBlank() || code == null || code.isBlank()) {
            return false;
        }

        try {
            long currentTime = System.currentTimeMillis() / 1000;
            long timeCounter = currentTime / TOTP_TIME_STEP;

            // Check current time and ±1 time step for drift tolerance
            for (long i = -1; i <= 1; i++) {
                String expectedCode = generateCode(secret, timeCounter + i);
                if (expectedCode.equals(code)) {
                    return true;
                }
            }

            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Generate TOTP code for a specific time counter
     */
    private String generateCode(String secret, long timeCounter) throws NoSuchAlgorithmException, InvalidKeyException {
        // Decode the secret
        byte[] decodedSecret = base32.decode(secret);

        // Convert time counter to byte array (big-endian)
        byte[] timeBytes = new byte[8];
        for (int i = 7; i >= 0; i--) {
            timeBytes[i] = (byte) (timeCounter & 0xff);
            timeCounter >>= 8;
        }

        // Generate HMAC
        Mac mac = Mac.getInstance(TOTP_ALGORITHM);
        mac.init(new SecretKeySpec(decodedSecret, 0, decodedSecret.length, TOTP_ALGORITHM));
        byte[] hash = mac.doFinal(timeBytes);

        // Extract dynamic binary code
        int offset = hash[hash.length - 1] & 0xf;
        long code = ((hash[offset] & 0x7f) << 24)
                | ((hash[offset + 1] & 0xff) << 16)
                | ((hash[offset + 2] & 0xff) << 8)
                | (hash[offset + 3] & 0xff);

        // Modulo to get 6-digit code
        code %= 1_000_000;

        return String.format("%06d", code);
    }
}


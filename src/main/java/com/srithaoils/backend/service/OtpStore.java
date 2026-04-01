package com.srithaoils.backend.service;

import com.srithaoils.backend.exception.InvalidOtpException;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OtpStore {

    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, OtpDetails> otpByPhoneNumber = new ConcurrentHashMap<>();

    public OtpDetails issueOtp(String phoneNumber, Duration ttl) {
        clearExpiredEntries();
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        Instant expiresAt = Instant.now().plus(ttl);
        OtpDetails details = new OtpDetails(otp, expiresAt);
        otpByPhoneNumber.put(phoneNumber, details);
        return details;
    }

    public void verifyOtp(String phoneNumber, String providedOtp) {
        clearExpiredEntries();
        OtpDetails details = otpByPhoneNumber.get(phoneNumber);
        if (details == null) {
            throw new InvalidOtpException("OTP not found or expired for this phone number");
        }

        if (Instant.now().isAfter(details.expiresAt())) {
            otpByPhoneNumber.remove(phoneNumber);
            throw new InvalidOtpException("OTP has expired");
        }

        if (!details.otp().equals(providedOtp)) {
            throw new InvalidOtpException("Invalid OTP");
        }

        otpByPhoneNumber.remove(phoneNumber);
    }

    private void clearExpiredEntries() {
        Instant now = Instant.now();
        otpByPhoneNumber.entrySet()
                .removeIf(entry -> now.isAfter(entry.getValue().expiresAt()));
    }

    public record OtpDetails(String otp, Instant expiresAt) {
    }
}

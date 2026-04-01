package com.srithaoils.backend.dto.auth;

import java.time.Instant;

public record OtpRequestResponse(
        String message,
        Instant expiresAt,
        String otp
) {
}

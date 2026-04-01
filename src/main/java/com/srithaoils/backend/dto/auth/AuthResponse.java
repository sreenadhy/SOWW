package com.srithaoils.backend.dto.auth;

import java.time.Instant;

public record AuthResponse(
        String accessToken,
        String tokenType,
        Instant expiresAt,
        Long userId,
        String phoneNumber
) {
}

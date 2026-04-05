package com.srithaoils.backend.dto.auth;

import java.time.LocalDateTime;

public record RegisterResponse(
        Long id,
        String primaryPhoneNumber,
        String secondaryPhoneNumber,
        String name,
        String email,
        LocalDateTime createdAt
) {
}

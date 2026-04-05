package com.srithaoils.backend.dto.auth;

import java.time.LocalDateTime;

public record UserProfileResponse(
        Long id,
        String name,
        String phone,
        String email,
        LocalDateTime createdAt
) {
}

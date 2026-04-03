package com.srithaoils.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Primary phone number is required")
        @Pattern(regexp = "^[0-9]{10}$", message = "Primary phone number must be 10 digits")
        String primaryPhoneNumber,
        @Pattern(regexp = "^[0-9]{10}$", message = "Secondary phone number must be 10 digits")
        String secondaryPhoneNumber,
        @NotBlank(message = "Name is required")
        @Size(max = 120, message = "Name can be at most 120 characters")
        String name
) {
}

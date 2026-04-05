package com.srithaoils.backend.dto.profile;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 120, message = "Name can be at most 120 characters")
        String name,
        @Email(message = "Email must be valid")
        @Size(max = 160, message = "Email can be at most 160 characters")
        String email,
        @Pattern(regexp = "^$|^[0-9]{10}$", message = "Secondary phone number must be 10 digits")
        String secondaryPhoneNumber
) {
}

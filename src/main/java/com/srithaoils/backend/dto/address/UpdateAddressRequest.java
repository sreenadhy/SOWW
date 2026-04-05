package com.srithaoils.backend.dto.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateAddressRequest(
        @NotBlank(message = "Full address is required")
        @Size(max = 300, message = "Full address can be at most 300 characters")
        String fullAddress,
        @NotBlank(message = "City is required")
        @Size(max = 120, message = "City can be at most 120 characters")
        String city,
        @NotBlank(message = "State is required")
        @Size(max = 120, message = "State can be at most 120 characters")
        String state,
        @NotBlank(message = "Pincode is required")
        @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be 6 digits")
        String pincode,
        Boolean isDefault
) {
}

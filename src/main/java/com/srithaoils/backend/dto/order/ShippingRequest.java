package com.srithaoils.backend.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ShippingRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 120, message = "Full name can be at most 120 characters")
        String fullName,
        @NotBlank(message = "Shipping phone number is required")
        @Pattern(regexp = "^[0-9]{10}$", message = "Shipping phone number must be 10 digits")
        String phoneNumber,
        @NotBlank(message = "Address line 1 is required")
        @Size(max = 200, message = "Address line 1 can be at most 200 characters")
        String addressLine1,
        @Size(max = 200, message = "Address line 2 can be at most 200 characters")
        String addressLine2,
        @NotBlank(message = "City is required")
        @Size(max = 120, message = "City can be at most 120 characters")
        String city,
        @NotBlank(message = "State is required")
        @Size(max = 120, message = "State can be at most 120 characters")
        String state,
        @NotBlank(message = "Postal code is required")
        @Pattern(regexp = "^[0-9]{6}$", message = "Postal code must be 6 digits")
        String postalCode
) {
}

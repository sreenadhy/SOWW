package com.srithaoils.backend.dto.address;

import java.time.LocalDateTime;

public record AddressResponse(
        Long id,
        Long userId,
        String fullAddress,
        String city,
        String state,
        String pincode,
        boolean isDefault,
        LocalDateTime createdAt
) {
}

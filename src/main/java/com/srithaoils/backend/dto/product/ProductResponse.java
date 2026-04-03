package com.srithaoils.backend.dto.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        Integer availableStock,
        String unit,
        LocalDateTime createdAt
) {
}

package com.srithaoils.backend.dto.product;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer availableStock,
        String unit
) {
}

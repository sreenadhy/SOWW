package com.srithaoils.backend.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateOrderRequest(
        @NotNull(message = "Address ID is required")
        Long addressId,
        @NotEmpty(message = "At least one cart item is required")
        List<@Valid CartItemRequest> items
) {
}

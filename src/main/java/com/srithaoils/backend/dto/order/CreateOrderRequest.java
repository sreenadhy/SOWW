package com.srithaoils.backend.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateOrderRequest(
        @NotEmpty(message = "At least one cart item is required")
        List<@Valid CartItemRequest> items,
        @NotNull(message = "Shipping details are required")
        @Valid ShippingRequest shipping
) {
}

package com.srithaoils.backend.dto.order;

import com.srithaoils.backend.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateOrderRequest(
        Long addressId,
        @Valid
        OrderAddressRequest address,
        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,
        @Size(max = 500, message = "Payment details can be at most 500 characters")
        String paymentDetails,
        @NotEmpty(message = "At least one cart item is required")
        List<@Valid CartItemRequest> items
) {
}

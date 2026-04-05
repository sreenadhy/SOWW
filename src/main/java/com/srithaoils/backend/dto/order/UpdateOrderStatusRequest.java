package com.srithaoils.backend.dto.order;

import com.srithaoils.backend.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateOrderStatusRequest(
        @NotNull(message = "Order status is required")
        OrderStatus orderStatus,
        @Size(max = 255, message = "Remarks can be at most 255 characters")
        String remarks
) {
}

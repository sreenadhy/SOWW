package com.srithaoils.backend.dto.order;

import com.srithaoils.backend.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateOrderResponse(
        Long id,
        String orderNumber,
        OrderStatus orderStatus,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal totalAmount,
        LocalDateTime createdAt
) {
}

package com.srithaoils.backend.dto.order;

import java.math.BigDecimal;

public record CreateOrderResponse(
        String orderId,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal totalAmount
) {
}

package com.srithaoils.backend.dto.order;

import com.srithaoils.backend.dto.address.AddressResponse;
import com.srithaoils.backend.dto.payment.PaymentResponse;
import com.srithaoils.backend.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CreateOrderResponse(
        Long id,
        String orderNumber,
        OrderStatus orderStatus,
        AddressResponse address,
        PaymentResponse payment,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal totalAmount,
        LocalDateTime createdAt,
        LocalDate estimatedDeliveryDate
) {
}

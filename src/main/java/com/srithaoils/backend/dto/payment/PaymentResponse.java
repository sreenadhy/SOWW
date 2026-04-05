package com.srithaoils.backend.dto.payment;

import com.srithaoils.backend.entity.PaymentMethod;
import com.srithaoils.backend.entity.PaymentStatus;

public record PaymentResponse(
        Long id,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        String paymentDetails
) {
}

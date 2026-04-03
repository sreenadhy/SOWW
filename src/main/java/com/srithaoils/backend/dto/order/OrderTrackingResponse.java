package com.srithaoils.backend.dto.order;

import com.srithaoils.backend.entity.OrderTrackingStatus;

import java.time.LocalDateTime;

public record OrderTrackingResponse(
        Long id,
        OrderTrackingStatus status,
        LocalDateTime updatedAt,
        String remarks
) {
}

package com.srithaoils.backend.controller;

import com.srithaoils.backend.dto.order.CreateOrderRequest;
import com.srithaoils.backend.dto.order.CreateOrderResponse;
import com.srithaoils.backend.dto.order.OrderSummaryResponse;
import com.srithaoils.backend.dto.order.OrderTrackingResponse;
import com.srithaoils.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateOrderResponse createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(authenticatedPhone(authentication), request);
    }

    @GetMapping
    public List<OrderSummaryResponse> getOrders(Authentication authentication) {
        return orderService.getOrdersForUser(authenticatedPhone(authentication));
    }

    @GetMapping("/{orderId}/tracking")
    public List<OrderTrackingResponse> getOrderTracking(
            Authentication authentication,
            @PathVariable Long orderId) {
        return orderService.getOrderTracking(authenticatedPhone(authentication), orderId);
    }

    private String authenticatedPhone(Authentication authentication) {
        if (authentication == null
                || authentication.getName() == null
                || "anonymousUser".equals(authentication.getName())) {
            throw new AuthenticationCredentialsNotFoundException("Authentication is required");
        }

        return authentication.getName();
    }
}

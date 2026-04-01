package com.srithaoils.backend.service;

import com.srithaoils.backend.dto.order.CartItemRequest;
import com.srithaoils.backend.dto.order.CreateOrderRequest;
import com.srithaoils.backend.dto.order.CreateOrderResponse;
import com.srithaoils.backend.dto.order.ShippingRequest;
import com.srithaoils.backend.entity.Order;
import com.srithaoils.backend.entity.OrderItem;
import com.srithaoils.backend.entity.Product;
import com.srithaoils.backend.entity.User;
import com.srithaoils.backend.exception.ResourceNotFoundException;
import com.srithaoils.backend.repository.OrderRepository;
import com.srithaoils.backend.repository.ProductRepository;
import com.srithaoils.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("1000.00");
    private static final BigDecimal STANDARD_SHIPPING_FEE = new BigDecimal("60.00");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CreateOrderResponse createOrder(String phoneNumber, CreateOrderRequest request) {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        Map<Long, Integer> mergedQuantities = mergeQuantities(request.items());
        List<Product> products = productRepository.findAllById(mergedQuantities.keySet());
        Map<Long, Product> productById = products.stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        if (productById.size() != mergedQuantities.size()) {
            throw new ResourceNotFoundException("One or more requested products were not found");
        }

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        applyShippingDetails(order, request.shipping());

        BigDecimal subtotal = BigDecimal.ZERO;
        for (Map.Entry<Long, Integer> entry : mergedQuantities.entrySet()) {
            Product product = productById.get(entry.getKey());
            int requestedQuantity = entry.getValue();

            if (product.getAvailableStock() < requestedQuantity) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: " + product.getName());
            }

            product.setAvailableStock(product.getAvailableStock() - requestedQuantity);

            BigDecimal lineTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(requestedQuantity));

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setQuantity(requestedQuantity);
            orderItem.setLineTotal(lineTotal);
            order.addItem(orderItem);

            subtotal = subtotal.add(lineTotal);
        }

        BigDecimal shippingFee = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
                ? BigDecimal.ZERO.setScale(2)
                : STANDARD_SHIPPING_FEE;
        BigDecimal totalAmount = subtotal.add(shippingFee);

        order.setSubtotal(subtotal);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        return new CreateOrderResponse(
                savedOrder.getOrderNumber(),
                savedOrder.getSubtotal(),
                savedOrder.getShippingFee(),
                savedOrder.getTotalAmount()
        );
    }

    private Map<Long, Integer> mergeQuantities(List<CartItemRequest> items) {
        Map<Long, Integer> merged = new LinkedHashMap<>();
        for (CartItemRequest item : items) {
            merged.merge(item.productId(), item.quantity(), Integer::sum);
        }
        return merged;
    }

    private void applyShippingDetails(Order order, ShippingRequest shipping) {
        order.setShippingFullName(shipping.fullName());
        order.setShippingPhoneNumber(shipping.phoneNumber());
        order.setAddressLine1(shipping.addressLine1());
        order.setAddressLine2(shipping.addressLine2());
        order.setCity(shipping.city());
        order.setState(shipping.state());
        order.setPostalCode(shipping.postalCode());
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int suffix = ThreadLocalRandom.current().nextInt(1000, 10000);
        return "SO-" + timestamp + "-" + suffix;
    }
}

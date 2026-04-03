package com.srithaoils.backend.service;

import com.srithaoils.backend.dto.address.AddressResponse;
import com.srithaoils.backend.dto.order.CartItemRequest;
import com.srithaoils.backend.dto.order.CreateOrderRequest;
import com.srithaoils.backend.dto.order.CreateOrderResponse;
import com.srithaoils.backend.dto.order.OrderItemResponse;
import com.srithaoils.backend.dto.order.OrderSummaryResponse;
import com.srithaoils.backend.dto.order.OrderTrackingResponse;
import com.srithaoils.backend.entity.Address;
import com.srithaoils.backend.entity.Order;
import com.srithaoils.backend.entity.OrderItem;
import com.srithaoils.backend.entity.OrderStatus;
import com.srithaoils.backend.entity.OrderTracking;
import com.srithaoils.backend.entity.OrderTrackingStatus;
import com.srithaoils.backend.entity.Product;
import com.srithaoils.backend.entity.User;
import com.srithaoils.backend.exception.ResourceNotFoundException;
import com.srithaoils.backend.repository.AddressRepository;
import com.srithaoils.backend.repository.OrderRepository;
import com.srithaoils.backend.repository.OrderTrackingRepository;
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
    private final OrderTrackingRepository orderTrackingRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderTrackingRepository orderTrackingRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            AddressRepository addressRepository) {
        this.orderRepository = orderRepository;
        this.orderTrackingRepository = orderTrackingRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
    }

    @Transactional
    public CreateOrderResponse createOrder(String primaryPhoneNumber, CreateOrderRequest request) {
        User user = userRepository.findByPrimaryPhoneNumber(primaryPhoneNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        Address address = addressRepository.findByIdAndUserId(request.addressId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found for this user"));

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
        order.setAddress(address);
        order.setOrderStatus(OrderStatus.PENDING);

        BigDecimal subtotal = BigDecimal.ZERO;
        for (Map.Entry<Long, Integer> entry : mergedQuantities.entrySet()) {
            Product product = productById.get(entry.getKey());
            int requestedQuantity = entry.getValue();

            if (product.getAvailableStock() < requestedQuantity) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }

            product.setAvailableStock(product.getAvailableStock() - requestedQuantity);

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(requestedQuantity));
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(requestedQuantity);
            orderItem.setPrice(product.getPrice());
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

        OrderTracking placedTracking = new OrderTracking();
        placedTracking.setStatus(OrderTrackingStatus.PLACED);
        placedTracking.setRemarks("Order placed successfully");
        order.addTrackingUpdate(placedTracking);

        Order savedOrder = orderRepository.save(order);

        return new CreateOrderResponse(
                savedOrder.getId(),
                savedOrder.getOrderNumber(),
                savedOrder.getOrderStatus(),
                savedOrder.getSubtotal(),
                savedOrder.getShippingFee(),
                savedOrder.getTotalAmount(),
                savedOrder.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> getOrdersForUser(String primaryPhoneNumber) {
        User user = userRepository.findByPrimaryPhoneNumber(primaryPhoneNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        return orderRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapOrderSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderTrackingResponse> getOrderTracking(String primaryPhoneNumber, Long orderId) {
        User user = userRepository.findByPrimaryPhoneNumber(primaryPhoneNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found for this user"));

        return orderTrackingRepository.findAllByOrderIdOrderByUpdatedAtAsc(order.getId())
                .stream()
                .map(tracking -> new OrderTrackingResponse(
                        tracking.getId(),
                        tracking.getStatus(),
                        tracking.getUpdatedAt(),
                        tracking.getRemarks()
                ))
                .toList();
    }

    private Map<Long, Integer> mergeQuantities(List<CartItemRequest> items) {
        Map<Long, Integer> merged = new LinkedHashMap<>();
        for (CartItemRequest item : items) {
            merged.merge(item.productId(), item.quantity(), Integer::sum);
        }
        return merged;
    }

    private OrderSummaryResponse mapOrderSummary(Order order) {
        Address address = order.getAddress();

        AddressResponse addressResponse = new AddressResponse(
                address.getId(),
                address.getUser().getId(),
                address.getFullAddress(),
                address.getCity(),
                address.getState(),
                address.getPincode(),
                Boolean.TRUE.equals(address.getIsDefault()),
                address.getCreatedAt()
        );

        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                ))
                .toList();

        return new OrderSummaryResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getOrderStatus(),
                addressResponse,
                items,
                order.getSubtotal(),
                order.getShippingFee(),
                order.getTotalAmount(),
                order.getCreatedAt()
        );
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int suffix = ThreadLocalRandom.current().nextInt(1000, 10000);
        return "SO-" + timestamp + "-" + suffix;
    }
}

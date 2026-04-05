package com.srithaoils.backend.service;

import com.srithaoils.backend.dto.address.AddressResponse;
import com.srithaoils.backend.dto.order.CartItemRequest;
import com.srithaoils.backend.dto.order.CreateOrderRequest;
import com.srithaoils.backend.dto.order.CreateOrderResponse;
import com.srithaoils.backend.dto.order.OrderAddressRequest;
import com.srithaoils.backend.dto.order.OrderItemResponse;
import com.srithaoils.backend.dto.order.OrderSummaryResponse;
import com.srithaoils.backend.dto.order.OrderTrackingResponse;
import com.srithaoils.backend.dto.order.UpdateOrderStatusRequest;
import com.srithaoils.backend.dto.payment.PaymentResponse;
import com.srithaoils.backend.entity.Address;
import com.srithaoils.backend.entity.Order;
import com.srithaoils.backend.entity.OrderItem;
import com.srithaoils.backend.entity.OrderStatus;
import com.srithaoils.backend.entity.Payment;
import com.srithaoils.backend.entity.PaymentMethod;
import com.srithaoils.backend.entity.PaymentStatus;
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
    private static final int ESTIMATED_DELIVERY_DAYS = 4;

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

        Address address = resolveAddress(user, request.addressId(), request.address());

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
        order.setOrderStatus(OrderStatus.CREATED);

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

        Payment payment = new Payment();
        payment.setPaymentMethod(request.paymentMethod());
        payment.setPaymentStatus(resolvePaymentStatus(request.paymentMethod()));
        payment.setPaymentDetails(request.paymentDetails());
        order.setPayment(payment);

        OrderTracking placedTracking = new OrderTracking();
        placedTracking.setStatus(OrderTrackingStatus.PLACED);
        placedTracking.setRemarks("Order placed successfully");
        order.addTrackingUpdate(placedTracking);

        Order savedOrder = orderRepository.save(order);

        return new CreateOrderResponse(
                savedOrder.getId(),
                savedOrder.getOrderNumber(),
                savedOrder.getOrderStatus(),
                mapAddress(savedOrder.getAddress()),
                mapPayment(savedOrder.getPayment()),
                savedOrder.getSubtotal(),
                savedOrder.getShippingFee(),
                savedOrder.getTotalAmount(),
                savedOrder.getCreatedAt(),
                savedOrder.getCreatedAt().toLocalDate().plusDays(ESTIMATED_DELIVERY_DAYS)
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

    @Transactional
    public OrderSummaryResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setOrderStatus(request.orderStatus());

        OrderTracking tracking = new OrderTracking();
        tracking.setStatus(mapTrackingStatus(request.orderStatus()));
        tracking.setRemarks(request.remarks() == null || request.remarks().isBlank()
                ? "Order status updated to " + request.orderStatus().name()
                : request.remarks().trim());
        order.addTrackingUpdate(tracking);

        return mapOrderSummary(orderRepository.save(order));
    }

    private Map<Long, Integer> mergeQuantities(List<CartItemRequest> items) {
        Map<Long, Integer> merged = new LinkedHashMap<>();
        for (CartItemRequest item : items) {
            merged.merge(item.productId(), item.quantity(), Integer::sum);
        }
        return merged;
    }

    private OrderSummaryResponse mapOrderSummary(Order order) {
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
                mapAddress(order.getAddress()),
                mapPayment(order.getPayment()),
                items,
                order.getSubtotal(),
                order.getShippingFee(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                order.getCreatedAt().toLocalDate().plusDays(ESTIMATED_DELIVERY_DAYS)
        );
    }

    private Address resolveAddress(User user, Long addressId, OrderAddressRequest addressRequest) {
        if (addressId != null) {
            return addressRepository.findByIdAndUserId(addressId, user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Address not found for this user"));
        }

        if (addressRequest == null) {
            throw new IllegalArgumentException("Address details are required when no saved address is selected");
        }

        List<Address> existingAddresses = addressRepository.findAllByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId());
        boolean shouldBeDefault = Boolean.TRUE.equals(addressRequest.saveAsDefault()) || existingAddresses.isEmpty();

        if (shouldBeDefault) {
            existingAddresses.forEach(existingAddress -> existingAddress.setIsDefault(Boolean.FALSE));
        }

        Address address = new Address();
        address.setUser(user);
        address.setFullAddress(addressRequest.addressLine().trim());
        address.setCity(addressRequest.city().trim());
        address.setState(addressRequest.state().trim());
        address.setPincode(addressRequest.pincode().trim());
        address.setIsDefault(shouldBeDefault);
        return addressRepository.save(address);
    }

    private AddressResponse mapAddress(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getUser().getId(),
                address.getFullAddress(),
                address.getCity(),
                address.getState(),
                address.getPincode(),
                Boolean.TRUE.equals(address.getIsDefault()),
                address.getCreatedAt()
        );
    }

    private PaymentResponse mapPayment(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getPaymentMethod(),
                payment.getPaymentStatus(),
                payment.getPaymentDetails()
        );
    }

    private PaymentStatus resolvePaymentStatus(PaymentMethod paymentMethod) {
        return paymentMethod == PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.COMPLETED;
    }

    private OrderTrackingStatus mapTrackingStatus(OrderStatus orderStatus) {
        return switch (orderStatus) {
            case CREATED -> OrderTrackingStatus.PLACED;
            case CONFIRMED -> OrderTrackingStatus.PACKED;
            case SHIPPED -> OrderTrackingStatus.SHIPPED;
            case DELIVERED -> OrderTrackingStatus.DELIVERED;
        };
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int suffix = ThreadLocalRandom.current().nextInt(1000, 10000);
        return "SO-" + timestamp + "-" + suffix;
    }
}

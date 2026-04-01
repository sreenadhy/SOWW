# Sritha Oils Backend

Spring Boot backend for the "Sritha Oils" e-commerce app with product listing, OTP authentication, JWT-protected order creation, H2 persistence, validation, CORS, and centralized error handling.

## Tech Stack

- Java 17
- Spring Boot 3.3
- Spring Web
- Spring Data JPA
- Spring Security
- H2 in-memory database
- JWT (`jjwt`)

## Project Structure

```text
.
|-- pom.xml
|-- README.md
`-- src
    `-- main
        |-- java
        |   `-- com/srithaoils/backend
        |       |-- SrithaOilsApplication.java
        |       |-- config
        |       |   |-- CorsConfig.java
        |       |   `-- DataInitializer.java
        |       |-- controller
        |       |   |-- AuthController.java
        |       |   |-- OrderController.java
        |       |   `-- ProductController.java
        |       |-- dto
        |       |   |-- auth
        |       |   |   |-- AuthResponse.java
        |       |   |   |-- OtpRequestRequest.java
        |       |   |   |-- OtpRequestResponse.java
        |       |   |   `-- OtpVerifyRequest.java
        |       |   |-- order
        |       |   |   |-- CartItemRequest.java
        |       |   |   |-- CreateOrderRequest.java
        |       |   |   |-- CreateOrderResponse.java
        |       |   |   `-- ShippingRequest.java
        |       |   `-- product
        |       |       `-- ProductResponse.java
        |       |-- entity
        |       |   |-- Order.java
        |       |   |-- OrderItem.java
        |       |   |-- Product.java
        |       |   `-- User.java
        |       |-- exception
        |       |   |-- ApiErrorResponse.java
        |       |   |-- GlobalExceptionHandler.java
        |       |   |-- InvalidOtpException.java
        |       |   `-- ResourceNotFoundException.java
        |       |-- repository
        |       |   |-- OrderRepository.java
        |       |   |-- ProductRepository.java
        |       |   `-- UserRepository.java
        |       |-- security
        |       |   |-- JwtAuthenticationFilter.java
        |       |   |-- JwtService.java
        |       |   |-- RestAccessDeniedHandler.java
        |       |   |-- RestAuthenticationEntryPoint.java
        |       |   `-- SecurityConfig.java
        |       `-- service
        |           |-- AuthService.java
        |           |-- OrderService.java
        |           |-- OtpStore.java
        |           `-- ProductService.java
        `-- resources
            `-- application.properties
```

## Implemented APIs

### 1. Products

- `GET /api/products`
- Returns 5 products seeded on startup
- Each startup assigns a random price between `150` and `600`

### 2. OTP Authentication

- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`
- OTPs are stored in-memory with a `2 minute` expiry
- Development mode returns the generated OTP in the request response

### 3. Orders

- `POST /api/orders`
- Requires `Authorization: Bearer <jwt>`
- Accepts cart items and shipping details
- Recalculates subtotal, shipping fee, and total on the server
- Returns a generated `orderId`

## Business Rules

- Shipping fee is `Rs. 60.00` for orders below `Rs. 1000.00`
- Shipping is free for orders with subtotal `>= Rs. 1000.00`
- Product stock is decremented when an order is placed

## Run the Project

### Option 1: Run with Maven

```bash
mvn spring-boot:run
```

### Option 2: Build and run the jar

```bash
mvn clean package
java -jar target/sritha-oils-backend-0.0.1-SNAPSHOT.jar
```

Application URL:

- `http://localhost:8080`

H2 console:

- `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:srithaoilsdb`
- Username: `sa`
- Password: blank

## Sample Requests

### Get products

```bash
curl http://localhost:8080/api/products
```

### Request OTP

```bash
curl -X POST http://localhost:8080/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"9876543210\"}"
```

### Verify OTP

```bash
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"9876543210\",\"otp\":\"123456\"}"
```

### Create an order

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt>" \
  -d "{
    \"items\": [
      {\"productId\": 1, \"quantity\": 2},
      {\"productId\": 3, \"quantity\": 1}
    ],
    \"shipping\": {
      \"fullName\": \"Sritha Customer\",
      \"phoneNumber\": \"9876543210\",
      \"addressLine1\": \"12 Market Street\",
      \"addressLine2\": \"Near Temple Road\",
      \"city\": \"Chennai\",
      \"state\": \"Tamil Nadu\",
      \"postalCode\": \"600001\"
    }
  }"
```

## Notes

- The OTP store is intentionally in-memory for development/demo use.
- `app.auth.dev-return-otp=true` is enabled by default; disable it in production.
- JWT secret and CORS origins are configurable in `src/main/resources/application.properties`.

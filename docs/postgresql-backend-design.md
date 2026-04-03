# Sritha Oils PostgreSQL Backend Design

## Database Schema

The PostgreSQL schema is implemented in:

- `src/main/resources/db/migration/V1__create_postgresql_schema.sql`

It creates the following tables:

- `users`
- `addresses`
- `products`
- `orders`
- `order_items`
- `order_tracking`

### Core Relationships

- One user -> many addresses
- One user -> many orders
- One order -> many order items
- One order -> many tracking updates

### Key Design Choices

- `BIGSERIAL` primary keys for simple, scalable relational joins
- unique constraint on `users.primary_phone_number`
- partial unique index to enforce a single default address per user
- indexed foreign keys for `user_id`, `order_id`, and tracking lookups
- enum-style status values stored as strings for readability
- Flyway migration-based schema management for repeatable deployments

## Sample Insert Queries

Sample PostgreSQL insert queries are provided in:

- `docs/postgresql-sample-inserts.sql`

## API Endpoint Structure

### Authentication

- `POST /api/auth/register`
  - Register a new user with `primaryPhoneNumber`, optional `secondaryPhoneNumber`, and `name`
- `POST /api/auth/request-otp`
  - Request OTP for a phone number
- `POST /api/auth/verify-otp`
  - Verify OTP and return JWT if the user is registered

### Address Management

- `POST /api/addresses`
  - Add a new address for the authenticated user
- `GET /api/addresses`
  - Get all addresses for the authenticated user

### Product Catalog

- `GET /api/products`
  - Fetch all products

### Order Management

- `POST /api/orders`
  - Create an order using an existing `addressId` and cart items
- `GET /api/orders`
  - Get all orders for the authenticated user
- `GET /api/orders/{orderId}/tracking`
  - Get tracking history for a specific order owned by the authenticated user

### Optional Cart

- Cart persistence is currently frontend-driven
- A dedicated cart API is intentionally left out for now because it was marked optional

## Example Request Shapes

### Register User

```json
{
  "primaryPhoneNumber": "9876543210",
  "secondaryPhoneNumber": "9123456780",
  "name": "Sritha Customer"
}
```

### Add Address

```json
{
  "fullAddress": "12 Market Street, Near Temple Road",
  "city": "Chennai",
  "state": "Tamil Nadu",
  "pincode": "600001",
  "isDefault": true
}
```

### Create Order

```json
{
  "addressId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 3,
      "quantity": 1
    }
  ]
}
```

## Backend Folder Structure

```text
src/main/java/com/srithaoils/backend
|-- config
|-- controller
|-- dto
|   |-- address
|   |-- auth
|   |-- order
|   `-- product
|-- entity
|-- exception
|-- repository
|-- security
`-- service

src/main/resources
|-- application.properties
`-- db/migration
```

## Runtime Configuration

The backend now expects PostgreSQL by default through environment-driven properties:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

Default local connection:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sritha_oils
spring.datasource.username=postgres
spring.datasource.password=postgres
```

## Notes

- Existing JWT auth was preserved and updated to use `primary_phone_number`
- Product seeding remains in `DataInitializer`
- Schema creation is handled by Flyway, not Hibernate auto-create

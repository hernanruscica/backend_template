# API Documentation

This document provides detailed information about the API endpoints backend.

## Base URL

All API endpoints are prefixed with `/api`.
**Example:** `https://your-domain.com/api`

---

## Authentication

All endpoints (except for `/auth/login`) are protected and require a JSON Web Token (JWT) to be included in the `Authorization` header.

**Header Format:**
`Authorization: Bearer <your_jwt_token>`

---

## Auth Endpoints

### Login

-   **Endpoint:** `POST /auth/login`
-   **Description:** Authenticates a user with their email and password.
-   **Permissions:** Public (no authentication required).
-   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Login successful",
      "token": "ey...",
      "user": {
        "uuid": "...",
        "first_name": "John",
        "last_name": "Doe",
        "email": "user@example.com",
        "roles": ["ADMIN"]
      }
    }
    ```
-   **Error Response (401 Unauthorized):**
    ```json
    {
      "success": false,
      "message": "Invalid credentials"
    }
    ```

---

## User Endpoints

-   **Base Path:** `/users`

### Get All Users

-   **Endpoint:** `GET /users`
-   **Description:** Retrieves a list of all users in the system.
-   **Permissions:** Requires a role with `GET` permission on the `users` entity.
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "users": [
        {
          "uuid": "...",
          "first_name": "Jane",
          "last_name": "Doe",
          "email": "jane.doe@example.com",
          // ... other user fields
        }
      ]
    }
    ```

### Create a New User

-   **Endpoint:** `POST /users`
-   **Description:** Creates a new user and associates them with a business and a role.
-   **Permissions:** Requires a role with `POST` permission on the `users` entity. The creating user must have a higher role hierarchy than the user being created.
-   **Request Body:**
    ```json
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "password": "strongpassword123",
      "phone": "1234567890",
      "dni": "12345678",
      "street": "123 Main St",
      "city": "Anytown",
      "state": "Anystate",
      "country": "Country",
      "zipCode": "12345",
      "business_uuid": "business-uuid-goes-here",
      "role": "OPERATOR"
    }
    ```
-   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "User created successfully",
      "user": {
        "uuid": "new-user-uuid",
        // ... full user object
      }
    }
    ```
-   **Error Response (409 Conflict):**
    ```json
    {
      "success": false,
      "message": "The email 'john.doe@example.com' is already in use."
    }
    ```
-   **Error Response (403 Forbidden):**
    ```json
    {
      "success": false,
      "message": "Administrators can only create users with a lower hierarchy level."
    }
    ```

### Get User by UUID

-   **Endpoint:** `GET /users/:uuid`
-   **Description:** Retrieves a single user by their unique identifier.
-   **Permissions:** Requires a role with `GET` permission on the `users` entity.
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "user": {
        "uuid": "user-uuid-to-fetch",
        // ... full user object
      }
    }
    ```
-   **Error Response (404 Not Found):**
    ```json
    {
      "success": false,
      "message": "User not found"
    }
    ```

### Update User by UUID

-   **Endpoint:** `PUT /users/:uuid`
-   **Description:** Updates a user's information. Can also handle image uploads for the user's avatar.
-   **Permissions:** Requires a role with `PUT` permission on the `users` entity.
-   **Request Body:** Can be `application/json` for data or `multipart/form-data` for file uploads. Include any fields to update.
    ```json
    {
      "firstName": "Johnathan",
      "phone": "0987654321"
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "User updated successfully",
      "user": {
        "uuid": "updated-user-uuid",
        // ... full updated user object
      }
    }
    ```

### Delete User by UUID

-   **Endpoint:** `DELETE /users/:uuid`
-   **Description:** Deletes a user from the system.
-   **Permissions:** Requires a role with `DELETE` permission on the `users` entity.
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "User deleted successfully"
    }
    ```
-   **Error Response (404 Not Found):**
    ```json
    {
      "success": false,
      "message": "User not found"
    }
    ```

### Hard Delete User by UUID

-   **Endpoint:** `DELETE /users/:uuid/hard`
-   **Description:** Permanently deletes a user from the system. This is a hard delete and cannot be undone.
-   **Permissions:** Requires a role with `DELETE` permission on the `users` entity.
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "User permanently deleted"
    }
    ```
-   **Error Response (404 Not Found):**
    ```json
    {
      "success": false,
      "message": "User not found"
    }
    ```
---

## Business Endpoints

-   **Base Path:** `/businesses`

### Get All Businesses

-   **Endpoint:** `GET /businesses`
-   **Description:** Retrieves a list of all businesses in the system.
-   **Permissions:** Requires a role with `GET` permission on the `businesses` entity.
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "businesses": [
        {
          "uuid": "...",
          "name": "Business Name",
          // ... other business fields
        }
      ]
    }
    ```

### Create a New Business

-   **Endpoint:** `POST /businesses`
-   **Description:** Creates a new business.
-   **Permissions:** Requires a role with `POST` permission on the `businesses` entity.
-   **Request Body:**
    ```json
    {
      "name": "New Business",
      "cuit": "30-12345678-9",
      "street": "456 Business Ave",
      "city": "Businesstown",
      "state": "Businessstate",
      "country": "Country",
      "zipCode": "54321",
      "phone": "1231231234",
      "email": "contact@newbusiness.com"
    }
    ```
-   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Business created successfully",
      "business": {
        "uuid": "new-business-uuid",
        // ... full business object
      }
    }
    ```

### Get Business by UUID

-   **Endpoint:** `GET /businesses/:uuid`
-   **Description:** Retrieves a single business by its unique identifier.
-   **Permissions:** Requires a role with `GET` permission on the `businesses` entity.
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "business": {
        "uuid": "business-uuid-to-fetch",
        // ... full business object
      }
    }
    ```
-   **Error Response (404 Not Found):**
    ```json
    {
      "success": false,
      "message": "Business not found"
    }
    ```

### Update Business by UUID

-   **Endpoint:** `PUT /businesses/:uuid`
-   **Description:** Updates a business's information. Can also handle image uploads for the business's logo.
-   **Permissions:** Requires a role with `PUT` permission on the `businesses` entity.
-   **Request Body:** Can be `application/json` for data or `multipart/form-data` for file uploads. Include any fields to update.
    ```json
    {
      "name": "Updated Business Name",
      "phone": "0987654321"
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Business updated successfully",
      "business": {
        "uuid": "updated-business-uuid",
        // ... full updated business object
      }
    }
    ```

### Delete Business by UUID

-   **Endpoint:** `DELETE /businesses/:uuid`
-   **Description:** Deletes a business from the system.
-   **Permissions:** Requires a role with `DELETE` permission on the `businesses` entity.
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Business deleted successfully"
    }
    ```
-   **Error Response (404 Not Found):**
    ```json
    {
      "success": false,
      "message": "Business not found"
    }
    ```

### Hard Delete Business by UUID

-   **Endpoint:** `DELETE /businesses/:uuid/hard`
-   **Description:** Permanently deletes a business from the system. This is a hard delete and cannot be undone.
-   **Permissions:** Requires a role with `DELETE` permission on the `businesses` entity.
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Business permanently deleted"
    }
    ```
-   **Error Response (404 Not Found):**
    ```json
    {
      "success": false,
      "message": "Business not found"
    }
    ```

---

## Product Endpoints

-   **Base Path:** `/products`

### Get All Products

-   **Endpoint:** `GET /products`
-   **Description:** Retrieves a list of all products.
-   **Permissions:** Requires a role with `GET` permission on the `products` entity.
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "products": [
        {
          "uuid": "...",
          "name": "Product Name",
          // ... other product fields
        }
      ]
    }
    ```

### Create a New Product

-   **Endpoint:** `POST /products`
-   **Description:** Creates a new product.
-   **Permissions:** Requires a role with `POST` permission on the `products` entity.
-   **Request Body:**
    ```json
    {
      "name": "New Product",
      "description": "Product description",
      "price": 99.99,
      "stock": 100
    }
    ```
-   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Product created successfully",
      "product": {
        "uuid": "new-product-uuid",
        // ... full product object
      }
    }
    ```

### Get Product by UUID

-   **Endpoint:** `GET /products/:uuid`
-   **Description:** Retrieves a single product by its unique identifier.
-   **Permissions:** Requires a role with `GET` permission on the `products` entity.
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "product": {
        "uuid": "product-uuid-to-fetch",
        // ... full product object
      }
    }
    ```
-   **Error Response (404 Not Found):**
    ```json
    {
      "success": false,
      "message": "Product not found"
    }
    ```

### Update Product by UUID

-   **Endpoint:** `PUT /products/:uuid`
-   **Description:** Updates a product's information.
-   **Permissions:** Requires a role with `PUT` permission on the `products` entity.
-   **Request Body:**
    ```json
    {
      "name": "Updated Product Name",
      "price": 129.99
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Product updated successfully",
      "product": {
        "uuid": "updated-product-uuid",
        // ... full updated product object
      }
    }
    ```

### Delete Product by UUID

-   **Endpoint:** `DELETE /products/:uuid`
-   **Description:** Deletes a product from the system.
-   **Permissions:** Requires a role with `DELETE` permission on the `products` entity.
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Product deleted successfully"
    }
    ```
-   **Error Response (404 Not Found):**
    ```json
    {
      "success": false,
      "message": "Product not found"
    }

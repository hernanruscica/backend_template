# API Documentation

This document provides detailed information about the API endpoints for the MDV Sensores backend.

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

# Error Handling Architecture

This document explains the centralized error handling system implemented in this project. The system is designed to be robust, predictable, and to keep the controller and service layers clean of repetitive error-handling logic.

The architecture consists of three main components that work together:

1.  `src/utils/customError.js` (The Custom Error Class)
2.  `src/utils/catchAsync.js` (The Async Wrapper)
3.  `src/middlewares/errorHandler.js` (The Global Error Handler)

---

### 1. `src/utils/customError.js` - The Custom Error Class

This file defines a special `CustomError` class that extends JavaScript's built-in `Error` class.

**Purpose:** Standard JavaScript `Error` objects don't have a property for HTTP status codes. This class adds a `statusCode` property, allowing us to create errors that map directly to specific HTTP responses (e.g., `404 Not Found`, `403 Forbidden`).

**How it's used:** Whenever we need to stop an operation and send a specific error response to the client, we `throw` a new instance of this class.

**Example:**
```javascript
// Inside a service or model
if (!user) {
  throw new CustomError('User not found with that ID', 404);
}
```

---

### 2. `src/utils/catchAsync.js` - The Async Wrapper

This is a higher-order function that wraps our asynchronous Express controller functions.

**Purpose:** In Express, if an error occurs inside an `async` function, it will crash the server unless it's caught. This utility avoids the need to write `try...catch` blocks in every single async controller.

**How it works:** It takes an `async` controller function as input and returns a new function. This new function executes the original controller and attaches a `.catch(next)` to its promise chain. If the promise rejects (meaning an error occurred), the `.catch()` block automatically passes the error to Express's `next` function, which then forwards it to our global error handling middleware.

**Example (in `userRoutes.js`):**
```javascript
// The createUser controller is wrapped with catchAsync
router.route('/').post(catchAsync(createUser));
```

---

### 3. `src/middlewares/errorHandler.js` - The Global Error Handler

This is the final destination for all errors in the application. It's a special type of Express middleware (an "error-handling middleware") that only runs when an error is passed to the `next()` function.

**Purpose:** To catch all errors from anywhere in the application and send a single, consistently formatted JSON response to the client.

**How it works:**
1.  It's registered at the very end of the middleware stack in `src/app.js`.
2.  It receives the `err` object that was passed by `next(err)`.
3.  It inspects the error. If it's a `CustomError`, it logs a clean, simple message. For unexpected, generic errors, it logs the full stack trace for better debugging.
4.  It determines the `statusCode` and `message` from the error object, defaulting to a `500 Internal Server Error` if the details are not specified.
5.  Finally, it sends a standardized JSON error response to the client.

---

### The Complete Flow (Example: Duplicate Email)

Here is how the pieces work together:

1.  A request is made to create a user with an email that already exists.
2.  The `UserModel.create` method attempts to insert the new user into the database, which fails with a MySQL "Duplicate entry" error.
3.  The `catch` block inside `UserModel.create` identifies this specific database error and **throws a `new CustomError('The email is already in use.', 409)`**.
4.  This `CustomError` propagates up.
5.  The `catchAsync` wrapper around the `createUser` controller catches this error and **automatically calls `next(error)`**.
6.  Express receives the error and skips all other middleware, jumping directly to our **global `errorHandler.js`**.
7.  The `errorHandler` receives the `CustomError` object. It logs a clean message to the console and sends a `409` JSON response to the client with the message "The email is already in use."

This system ensures that your application code remains clean and focused on business logic, while all errors are handled consistently and gracefully in one central location.

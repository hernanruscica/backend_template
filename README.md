# Generic users, business, roles, permissions system

## Author 
Cesar Hernan Ruscica 
### Enlaces: 
- <a href= 'https://www.linkedin.com/in/cesar-hernan-ruscica' target="_blank"> linkedin </a>
- <a href= 'https://ruscica.com.ar' target="_blank"> ruscica.com.ar </a>

## Project Overview

This project is the generic backend service for many uses. It's a robust and scalable RESTful API built with Node.js and Express. It handles user management, business logic, authentication, and permissions, providing a solid foundation for the application's needs. The architecture has been refactored to follow best practices, including a service layer, centralized error handling, and enhanced security.

## Technologies Used

- **Backend Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MySQL 2](https://github.com/sidorares/node-mysql2)
- **Authentication:** [JSON Web Tokens (JWT)](https://jwt.io/)
- **Password Hashing:** [bcrypt.js](https://github.com/kelektiv/node.bcrypt.js)
- **Image Uploads:** [Multer](https://github.com/expressjs/multer) and [Cloudinary](https://cloudinary.com/)
- **Validation:** [express-validator](https://express-validator.github.io/)
- **Security:** [Helmet](https://helmetjs.github.io/) and [express-rate-limit](https://github.com/nfriedly/express-rate-limit)
- **Testing:** [Jest](https://jestjs.io/) and [Supertest](https://github.com/visionmedia/supertest)
- **Development:** [Nodemon](https://nodemon.io/) for automatic server restarts and [dotenv](https://github.com/motdotla/dotenv) for environment variable management.

## Project Structure

The project follows a feature-oriented, layered architecture to ensure a clean separation of concerns, making it easier to maintain and scale.

```
/
├── __tests__/              # Integration and unit tests
├── scripts/                # Utility scripts (e.g., db reset, password hashing)
├── src/
│   ├── config/             # Configuration files (database, cloudinary)
│   ├── controllers/        # Express controllers (request/response handling)
│   ├── db/                 # Database migrations and seeders
│   ├── middlewares/        # Custom Express middleware (auth, permissions, error handling)
│   ├── models/             # Data access layer (database interactions)
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic layer
│   └── utils/              # Utility functions and classes
├── .env                    # Environment variables (not committed)
├── app.js                  # Express application setup
├── index.js                # Application entry point
└── package.json            # Project dependencies and scripts
```

- **`index.js` & `app.js`**: The entry point that starts the server and the core Express app setup where middleware and routes are registered.
- **`config/`**: Contains configuration for external services like the database connection.
- **`routes/`**: Defines the API endpoints and maps them to the appropriate controllers.
- **`middlewares/`**: Handles cross-cutting concerns like authentication, authorization, input validation, and global error handling.
- **`controllers/`**: Acts as the interface between the routes and the business logic. Its primary role is to handle HTTP requests and responses, delegating the heavy lifting to the service layer.
- **`services/`**: This layer contains the core business logic of the application. It encapsulates complex operations, interacts with the model layer, and ensures that the controllers remain lean.
- **`models/`**: The data access layer, responsible for all communication with the database. It abstracts away the raw SQL queries.

## Business Logic

- **Users**: The core entity of the system. Users can be created, updated, and deleted. They are associated with one or more businesses and have specific roles within each.
- **Businesses**: Represents a company or organization. Each business can have multiple users associated with it.
- **Roles & Permissions**: The system uses a role-based access control (RBAC) model.
    - **Roles** (e.g., `SUPER_ADMIN`, `ADMIN`, `OPERATOR`) are defined with a `hierarchy_level`.
    - Administrators can only create or manage users with a role of a lower hierarchy level than their own.
    - **Permissions** are granular and checked by the `permissionMiddleware` to authorize actions on specific routes.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd mdv-sensores-backend-v2
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the necessary environment variables. You can use `.env.example` as a template.
    ```
    PORT=5000
    DB_HOST=localhost
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=your_db_name
    JWT_SECRET=your_jwt_secret
    # ... other variables
    ```

4. **Reset the database**
    Run on root folder:
    ```bash
    npm run db:reset
    ```
    This action reset the database, making migrations and seeders.

## Available Scripts

-   **`npm start`**: Starts the application in production mode.
-   **`npm run dev`**: Starts the application in development mode with `nodemon`, which automatically restarts the server on file changes.
-   **`npm test`**: Runs the test suite using Jest. No working yet. (September 6, 25)
-   **`npm run db:reset`**: Resets the database by running all migrations and seeders.
-   **`npm run hash:password`**: A utility script to hash a password from the command line. Usefull to create a new user into the migrations file.

## API Endpoints

The API routes are defined in the `src/routes/` directory.

-   **`POST /api/auth/login`**: Authenticate a user and receive a JWT.
-   **`GET /api/users`**: Get a list of all users.
-   **`POST /api/users`**: Create a new user.
-   **`GET /api/users/:uuid`**: Get a user by their UUID.
-   **`PUT /api/users/:uuid`**: Update a user's information.
-   **`DELETE /api/users/:uuid`**: Delete a user.
-   *(Other business-related endpoints are also available)*

## Testing

The project uses Jest for testing. To run the tests, use the following command:

```bash
npm test
```

## Testing with the .http file

### - Control all entities of the database

Working Ok: ✅  -  Failure: ❌

####  Owner user - Test:
    - Login: ✅
    - Own and other Business : 
        - GET ✅, POST ✅, PUT ✅, DELETE ✅, HARDDELETE Users ✅
        - GET ✅, POST ✅, PUT ✅, DELETE ✅, HARDDELETE Business ✅

#### Admin user - Test:
    - Own and other Business : 
        - GET ✅, POST ✅, PUT
        - GET ✅, POST ✅, PUT
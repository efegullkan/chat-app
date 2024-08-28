# Chat App

A real-time chat application built using Node.js, Express, Socket.IO, and MySQL. This app allows users to create accounts, log in, and send private messages to each other in a seamless and responsive environment.

## Features

- **User Authentication**: 
  - Secure registration and login using session management.
  - Passwords are hashed using bcrypt for added security.
  
- **Real-time Messaging**: 
  - Instant private messaging powered by Socket.IO.
  - Users can see when others are typing and receive immediate message updates.

- **User Sessions**:
  - User sessions are managed using Express sessions with persistent storage in MySQL.
  - Session data is securely stored in the database.

- **Email Notifications**:
  - Users receive email notifications for account verification and password recovery.
  - Nodemailer is used to send emails through a configured SMTP service.

## Technologies Used

- **Backend**: Node.js, Express
- **Frontend**: EJS, HTML, CSS
- **Real-time Communication**: Socket.IO
- **Database**: MySQL
- **Session Management**: Express Sessions with MySQL storage
- **Email Service**: Nodemailer

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/efegullkan/chat-app.git
    cd chat-app
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Configure environment variables:
    - Create a `config/config.json` file in the root directory with the following structure:
        ```json
        {
          "development": {
            "username": "your-mysql-username",
            "password": "your-mysql-password",
            "database": "chat_app",
            "host": "127.0.0.1"
          },
          "email": {
            "service": "your-email-service",
            "auth": {
              "user": "your-email-address",
              "pass": "your-email-password"
            }
          }
        }
        ```

4. Set up the database:
    - Make sure MySQL is installed and running.
    - Create a database named `chat_app` or update the `config.json` with your database name.

5. Start the server:
    ```bash
    npm start
    ```

6. Access the app at `http://localhost:3000`.

## Usage

- Register a new account or log in with an existing one.
- Chat with other users in real-time.

## Folder Structure

- **controllers/**: Handles request logic for routes.
- **helpers/**: Utility functions used throughout the app.
- **middlewares/**: Custom middlewares for authentication and other tasks.
- **models/**: Sequelize models for MySQL tables.
- **public/**: Static assets (CSS, JavaScript, images).
- **routes/**: Express routes for different endpoints.
- **views/**: EJS templates for rendering HTML pages.

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

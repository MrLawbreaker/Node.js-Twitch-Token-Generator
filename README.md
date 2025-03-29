# TwitchAuthPage

This project is a web application designed to handle Twitch authentication. It allows users to log in with their Twitch account and provides a foundation for integrating Twitch API features. The application supports both HTTP and HTTPS, with HTTPS recommended for production environments.

## Features
- Twitch OAuth integration.
- Predefined scopes for bot and user access tokens.
- Customizable scopes for specific Twitch API needs.
- HTTPS support for secure communication.

## Setup Instructions

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/MrLawbreaker/Node.js-Twitch-Token-Generator.git
    cd Node.js-Twitch-Token-Generator
    ```

2. **Install Dependencies**:
    Ensure you have [Node.js](https://nodejs.org/) installed, then run:
    ```bash
    npm install
    ```

3. **Create a `.env` File**:
    Add your Twitch credentials and server configuration in a `.env` file:
    ```
    TWITCH_CLIENT_ID=your_client_id
    TWITCH_CLIENT_SECRET=your_client_secret
    HOST=your_host_url # Defaults to "localhost" if not provided
    PORT=your_port # Defaults to 3000 if not provided
    CERT_KEY=path_to_ssl_key
    CERT_FILE=path_to_ssl_certificate
    ```

4. **Run the Application**:
    Start the server:
    ```bash
    npm start
    ```

5. **Access the Application**:
    Open your browser and navigate to your configured URL 

    ```https://your_host_url:your_port```

    The application will also tell you 

6. **Enable HTTPS (Optional)**:
    For secure communication, configure HTTPS by providing valid SSL certificates in the `.env` file. 

## How It Works
- The application uses Twitch's OAuth flow to authenticate users.
- It provides predefined scopes for bot and user access tokens.
- Users can also specify custom scopes for their authentication needs.
- The server supports both HTTP and HTTPS, with automatic fallback to HTTP if SSL certificates are not provided.

## License
This project is licensed under the [MIT License](LICENSE).

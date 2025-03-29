# TwitchAuthPage

This project is a web application designed to easily get Twitch user access tokens. It allows users to log in with their Twitch account and provides a foundation for integrating Twitch API features. The application supports both HTTP and HTTPS, with HTTPS recommended for production environments.

## Features

- Implementation of Authorization code grant flow
- Selection of custom scopes for easy copy paste or immediate authentication with selected scopes
- Predefined scopes for bot and user access tokens.
- Allows for partly disabling of pages so one could only serve the preset Bot/User scopes
- HTTPS support for secure communication. (HTTP for localhost as fallback)
- Uses generated [state parameter](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#authorization-code-grant-flow) to ensure only codes from this application are turned into tokens


## Obtaining a Twitch Client ID and Secret

1. Go to the [Twitch Developer Console](https://dev.twitch.tv/console).
2. Log in with your Twitch account.
3. Click on "Applications" in the top navigation bar.
4. Click the "Register Your Application" button.
5. Fill out the form:
   - **Name**: Enter a name for your application.
   - **OAuth Redirect URLs**: Add the URL where users will be redirected after authentication (e.g., `https://your_host_url:your_port/Twitch/callback`).
   - **Category**: Select the appropriate category for your application.
6. Click "Create" to register your application.
7. Copy the **Client ID** and **Client Secret** from the application details page.

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
    This will start a [install script](setup.js) and prompt you to enter the Twitch ClientID and Client Secret. The entered values will be set in the `.env` file.
3. **Configure the `.env` File**:

    Add your Twitch credentials and server configuration in a `.env` file next to [server.js](server.js) (see [example.env](example.env)):
    ``` yaml
    # Required twitch info
    TWITCH_CLIENT_ID=
    TWITCH_CLIENT_SECRET=

    # The Host for the web server
    # defaults to localhost
    HOST=
    # The port to run the server on will default to 3000
    PORT=

    #Certificate files used for HTTPS
    CERT_KEY=
    CERT_FILE=

    # Space delimted list of preset scopes
    # https://dev.twitch.tv/docs/authentication/scopes/
    TWITCH_SCOPES_BOT=
    TWITCH_SCOPES_USER=

    # Callback URL for the AuthToken
    # this will be called with POST and the body is the access token
    # as described in https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#authorization-code-grant-flow
    # This allows you to use the token in your own application
    # If this is not set the data will be shown to the calling user
    # If set the user will only see a success or fail message
    CALLBACK=

    # If set to anything other than "true"
    # the index page will not be shown
    ALLOW_CUSTOM_SCOPES=true
    # If set to anything other than "true"
    # the scope page /TwitchBot will not be shown
    ALLOW_BOT_SCOPES=true
    # If set to anything other than "true"
    # the scope page /TwitchUser will not be shown
    ALLOW_USER_SCOPES=true
    ```

4. **Run the Application**:
    Start the server:
    ```bash
    npm start
    ```

5. **Access the Application**:
    Open your browser and navigate to your configured URL 

    ``` 
    https://your_host_url:your_port
    ```

    The application will also tell you the URL where it is running based on your configuration.

6. **Enable HTTPS (Optional)**:
    For secure communication, configure HTTPS by providing valid SSL certificates in the `.env` file. 

## API Endpoints

The application provides the following endpoints:

 **`/TwitchBot`**  
Redirects the user to Twitch's authorization page for obtaining a bot access token using predefined bot scopes.  
Can be called manually if env var `ALLOW_BOT_SCOPES` is set to `true`

 **`/TwitchUser`**  
Redirects the user to Twitch's authorization page for obtaining a user access token using predefined user scopes.  
Can be called manually if env var `ALLOW_USER_SCOPES` is set to `true`

 **`/TwitchCustom`**  
Redirects the user to Twitch's authorization page for obtaining an access token with custom scopes.  
Can be called manually if env var `ALLOW_CUSTOM_SCOPES` is set to `true`
- Query Parameter: `scopes` (space-delimited list of scopes).

 **`/TwitchValidate`**  
Serves a validation page where users can input and validate their Twitch tokens.

 **`/Twitch/callback`**  
Handles the callback from Twitch after user authorization. Exchanges the authorization code for an access token and returns the token details as JSON or sends them to the configured callback adress.

## License
This project is licensed under the [MIT License](LICENSE).

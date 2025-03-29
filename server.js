const express = require('express');
const dotenv = require('dotenv');
const https = require('https');
const http = require('http'); // For HTTP server
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

dotenv.config();
const app = express();
const PORT = process.env.PORT ? process.env.PORT : 3000;

// Twitch credentials
const gClientId = process.env.TWITCH_CLIENT_ID;
if (!gClientId) {
    throw new Error('TWITCH_CLIENT_ID is not defined in the environment variables.');
}

const gClientSecret = process.env.TWITCH_CLIENT_SECRET;
if (!gClientSecret) {
    throw new Error('TWITCH_CLIENT_SECRET is not defined in the environment variables.');
}

var gHost = isValidHost(process.env.HOST) ? isValidHost(process.env.HOST) : "localhost";

//Preset scopes for the bot user access token
const gScopesBot = process.env.TWITCH_SCOPES_BOT;

//Preset scopes for the Channel user access token
const gScopesUser = process.env.TWITCH_SCOPES_USER;

var gProtocol;

try {
    const privateKey = fs.readFileSync(process.env.CERT_KEY);
    const certificate = fs.readFileSync(process.env.CERT_FILE);
    const credentials = { key: privateKey, cert: certificate };

    // Create an HTTPS server if key files exist
    https.createServer(credentials, app).listen(PORT, () => {
        console.log(`Server is running on https://${gHost}:${PORT}`);
    });

    gProtocol = 'https';
} catch (error) {
    // If key files don't exist, start a regular HTTP server, will only work for localhost
    // as twitch redirects only to https or localhost
    console.log('SSL certificate files not found, starting HTTP server instead.');

    gProtocol = 'http';
    gHost = 'localhost';

    http.createServer(app).listen(PORT, () => {
        console.log(`Server is running on http://${gHost}:${PORT}`);
    });


}

const gRedirectUri = `${gProtocol}://${gHost}:${PORT}/Twitch/callback`;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/TwitchBot', (req, res) => {
    const lAuthUrl = getAuthURL(gScopesBot);
    res.redirect(lAuthUrl);
});

app.get('/TwitchUser', (req, res) => {

    const lAuthUrl = getAuthURL(gScopesUser);
    res.redirect(lAuthUrl);
});

app.get('/TwitchCustom', (req, res) => {
    const lCustomScopes = req.query.scopes;
    const lAuthURL = getAuthURL(lCustomScopes);

    res.redirect(lAuthURL);
});

app.get('/TwitchValidate', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/twitch-validate.html'));
});

app.get('/scope-availability', (req, res) => {
    res.json({
        botScopesAvailable: !!gScopesBot,
        userScopesAvailable: !!gScopesUser
    });
});

app.get('/Twitch/callback', async (req, res) => {

    /**
     * Authorization checks
     */

    const lAuthCode = req.query.code;
    if (!lAuthCode) {
        return res.status(400).send('Authorization failed.');
    }

    const lState = req.query.state;
    if (!lState || !gStateSet.has(lState)) {
        return res.sendStatus(401);
    }

    gStateSet.delete(lState);

    /**
     * Build the call to the twitch api to get the token
     * using authorization code grant flow
     */

    const tokenUrl = 'https://id.twitch.tv/oauth2/token';
    const params = new URLSearchParams({
        client_id: gClientId,
        client_secret: gClientSecret,
        code: lAuthCode,
        grant_type: 'authorization_code',
        redirect_uri: gRedirectUri,
    });

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });

        const data = await response.json();

        //Call the callback URL if provided
        if (process.env.CALLBACK_URL) {
            await fetch(process.env.CALLBACK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            res.send('Success! You can close this window now!');
        }
        else {
            res.json(data);
        }


    } catch (error) {
        console.error('Error exchanging token:', error.message);
        res.status(500).send('Error exchanging token');
    }
});


const gStateSet = new Set();

function getAuthURL(pScopesString) {
    const lNow = Date.now();
    const lState = `${lNow}${randomUUID()}`;

    gStateSet.add(lState);
    setTimeout(() => {
        gStateSet.delete(lState);
    }, 5 * 60 * 1000); //Make state invalid automatically

    const lAuthUrl = new URL('https://id.twitch.tv/oauth2/authorize');
    lAuthUrl.searchParams.append('client_id', gClientId);
    lAuthUrl.searchParams.append('state', lState);
    lAuthUrl.searchParams.append('redirect_uri', gRedirectUri);
    lAuthUrl.searchParams.append('response_type', 'code');
    lAuthUrl.searchParams.append('scope', pScopesString);
    lAuthUrl.searchParams.append('force_verify', 'true');

    return lAuthUrl.toString();
}

function isValidHost(pHost) {
    try {
        // If the user provided just a hostname (no scheme), prepend "http://"
        const lFormattedHost = pHost.includes("://") ? pHost : `http://${pHost}`;

        // Try creating a new URL object
        const lUrl = new URL(lFormattedHost);

        // Check if the hostname is valid
        return lUrl.hostname;
    } catch (error) {
        console.error('Invalid host:', error.message);
        return false;
    }
}
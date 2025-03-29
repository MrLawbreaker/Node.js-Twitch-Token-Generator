const express = require('express');
const dotenv = require('dotenv');
const https = require('https');
const http = require('http'); // For HTTP server
const fs = require('fs');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT ?? 3000;

// Twitch credentials
const gClientId = process.env.TWITCH_CLIENT_ID;
const gClientSecret = process.env.TWITCH_CLIENT_SECRET;
var gHost = process.env.HOSTURL ?? "localhost";

//Preset scopes for the bot user access token
const gScopesBot = ['chat:edit', 'chat:read', 'user:write:chat', 'moderator:manage:announcements',
    'moderator:manage:automod', 'moderator:read:banned_users', 'moderator:read:chat_messages',
    'moderator:manage:chat_messages', 'moderator:read:moderators', 'moderator:manage:shoutouts',
    'moderator:read:suspicious_users', 'user:bot', 'moderator:read:followers', 'user:read:chat'
].join(' ');

//Preset scopes for the Channel user access token
const gScopesUser = ['bits:read', 'channel:manage:ads', 'channel:read:ads', 'channel:manage:broadcast',
    'channel:edit:commercial', 'channel:manage:moderators', 'channel:manage:raids',
    'channel:read:subscriptions', 'channel:read:vips', 'channel:manage:vips',
    'channel:moderate', 'clips:edit', 'moderation:read', 'moderator:read:shoutouts',
    'moderator:read:followers', 'user:read:chat'
].join(' ');

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

var gRedirectUri = `${gProtocol}://${gHost}:${PORT}/Twitch/callback`;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/TwitchBot', (req, res) => {
    const lAuthUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${gClientId}&redirect_uri=${encodeURIComponent(gRedirectUri)}&response_type=code&scope=${encodeURIComponent(gScopesBot)}&force_verify=true`;
    res.redirect(lAuthUrl);
});

app.get('/TwitchUser', (req, res) => {
    const lAuthUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${gClientId}&redirect_uri=${encodeURIComponent(gRedirectUri)}&response_type=code&scope=${encodeURIComponent(gScopesUser)}&force_verify=true`;
    res.redirect(lAuthUrl);
});

app.get('/TwitchCustom', (req, res) => {
    const lCustomScopes = req.query.scopes;
    const lAuthURL = `https://id.twitch.tv/oauth2/authorize?client_id=${gClientId}&redirect_uri=${encodeURIComponent(gRedirectUri)}&response_type=code&scope=${encodeURIComponent(lCustomScopes)}&force_verify=true`

    res.redirect(lAuthURL);
});

app.get('/TwitchValidate', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/twitch-validate.html'));
});

app.get('/Twitch/callback', async (req, res) => {
    const lAuthCode = req.query.code;
    if (!lAuthCode) {
        return res.send('Authorization failed.');
    }

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
        res.json(data);
    } catch (error) {
        res.send('Error exchanging token: ' + error.message);
    }
});



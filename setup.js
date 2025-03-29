const fs = require('fs');
const prompt = require('prompt');
const dotenv = require('dotenv')



const envFilePath = '.env';
const exampleEnvFilePath = 'example.env';

// Check if `.env` exists; if not, copy from `example.env`
if (!fs.existsSync(envFilePath)) {
    if (fs.existsSync(exampleEnvFilePath)) {
        fs.copyFileSync(exampleEnvFilePath, envFilePath);
        console.log(`No .env file found. Copied from ${exampleEnvFilePath} to ${envFilePath}.`);
    } else {
        console.error(`Neither ${envFilePath} nor ${exampleEnvFilePath} exists. Please create one.`);
        process.exit(1);
    }
}

dotenv.config();

// Check if the credentials are already set
const hasClientId = Boolean(process.env.TWITCH_CLIENT_ID);
const hasClientSecret = Boolean(process.env.TWITCH_CLIENT_SECRET);

if (hasClientId && hasClientSecret) {
    console.log('TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET are already set. Exiting.');
    return;
}

// Define the schema for the prompt
const schema = {
    properties: {

    }
};

if (!hasClientId) {
    schema.properties.TWITCH_CLIENT_ID = {
        description: 'Enter your Twitch Client ID',
        required: true
    };
}

if (!hasClientSecret) {
    schema.properties.TWITCH_CLIENT_SECRET = {
        description: 'Enter your Twitch Client Secret',
        required: true,
        hidden: true,
        replace: '*'
    };
}

// Start the prompt
prompt.start();

// Get user input
prompt.get(schema, (err, result) => {
    if (err) {
        console.error('Error during setup:', err);
        process.exit(1);
    }

    // Read the existing .env file
    let lEnvContent = fs.readFileSync(envFilePath, 'utf8');

    // Update or add the variables in the .env file
    const updatedEnvContent = lEnvContent
        .split('\n')
        .map(lLine => {
            if (lLine.startsWith('TWITCH_CLIENT_ID=')) {
                return `TWITCH_CLIENT_ID=${hasClientId ? process.env.TWITCH_CLIENT_ID : result.TWITCH_CLIENT_ID}`;
            }

            if (lLine.startsWith('TWITCH_CLIENT_SECRET=')) {
                return `TWITCH_CLIENT_SECRET=${hasClientSecret ? process.env.TWITCH_CLIENT_SECRET : result.TWITCH_CLIENT_SECRET}`;
            }

            return lLine;
        })
        .join('\n');

    // Write the updated content back to the .env file
    fs.writeFileSync(envFilePath, updatedEnvContent, 'utf8');
    console.log('Setup complete! Your .env file has been updated.');
});
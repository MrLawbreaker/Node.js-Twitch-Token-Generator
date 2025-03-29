const fs = require('fs');
const prompt = require('prompt');

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

// Define the schema for the prompt
const schema = {
    properties: {
        TWITCH_CLIENT_ID: {
            description: 'Enter your Twitch Client ID',
            required: true
        },
        TWITCH_CLIENT_SECRET: {
            description: 'Enter your Twitch Client Secret',
            required: true,
            hidden: true,
            replace: '*'
        }
    }
};

// Start the prompt
prompt.start();

// Get user input
prompt.get(schema, (err, result) => {
    if (err) {
        console.error('Error during setup:', err);
        process.exit(1);
    }

    // Read the existing .env file
    let envContent = fs.readFileSync(envFilePath, 'utf8');

    // Update or add the variables in the .env file
    const updatedEnvContent = envContent
        .split('\n')
        .filter(line => !line.startsWith('TWITCH_CLIENT_ID=') && !line.startsWith('TWITCH_CLIENT_SECRET='))
        .concat([
            `TWITCH_CLIENT_ID=${result.TWITCH_CLIENT_ID}`,
            `TWITCH_CLIENT_SECRET=${result.TWITCH_CLIENT_SECRET}`
        ])
        .join('\n');

    // Write the updated content back to the .env file
    fs.writeFileSync(envFilePath, updatedEnvContent, 'utf8');
    console.log('Setup complete! Your .env file has been updated.');
});
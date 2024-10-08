const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

// Function to generate random text
function generateRandomText() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomText = '';
    const length = Math.floor(Math.random() * 20) + 5; // Random length between 5 and 25 characters

    for (let i = 0; i < length; i++) {
        randomText += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return randomText;
}

// Function to send a message to NGL
async function sendNglMessage(nglLink, message) {
    try {
        await axios.post(nglLink, { question: message });
        console.log(`Message sent: ${message}`);
    } catch (error) {
        console.error('Error sending message:', error.message);
    }
}

// API to send 100 random messages to the NGL link
app.get('/send/:username', async (req, res) => {
    const username = req.params.username;
    const nglLink = `https://ngl.link/${username}`;
    
    console.log(`Sending messages to ${nglLink}...`);

    for (let i = 0; i < 100; i++) {
        const randomMessage = generateRandomText();
        await sendNglMessage(nglLink, randomMessage);
    }

    res.send(`100 random messages sent to ${nglLink}`);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

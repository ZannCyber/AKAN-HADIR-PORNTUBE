const express = require('express');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

// Replace with your actual Google API key
const Used_Apikey = "AIzaSyB2mvsGVTZAU-h-GtCLzoLhjHEdvugx9uQ";
const genAI = new GoogleGenerativeAI(Used_Apikey);

// Middleware to parse JSON request bodies
app.use(express.json());

app.get('/process-image', async (req, res) => {
    try {
        const imageUrl = req.query.imageUrl;
        const prompt = req.query.prompt || ''; // Get prompt from query parameters

        if (!imageUrl) {
            return res.status(400).json({ error: 'No image URL provided' });
        }

        // Download the image
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const fileData = Buffer.from(response.data); // Convert to Buffer

        // Upload the file to Google AI File Manager
        const uploadResponse = await genAI.uploadFile(fileData, {
            mimeType: "image/jpeg",
            displayName: `image_${Date.now()}.jpg`,
        });

        console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

        const result = await genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
        }).generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri
                }
            },
            { text: 'gunakan bahasa indonesia ' + prompt },
        ]);

        res.json({ response: result.response.text() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing the image.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

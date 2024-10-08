const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const app = express();
const port = process.env.PORT || 3000;

// Replace with your actual Google API key
const Used_Apikey = "AIzaSyB2mvsGVTZAU-h-GtCLzoLhjHEdvugx9uQ";
const genAI = new GoogleGenerativeAI(Used_Apikey);
const fileManager = new GoogleAIFileManager(Used_Apikey);

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Temporary directory for uploads

app.use(express.json()); // Middleware to parse JSON request bodies

app.get('/process-image', upload.single('image'), async (req, res) => {
    try {
        let tempFilePath;

        if (req.query.imageUrl) {
            // If imageUrl is provided, download the image
            const response = await axios.get(req.query.imageUrl, { responseType: 'arraybuffer' });
            tempFilePath = path.join(__dirname, `temp_image_${Date.now()}.jpg`);
            fs.writeFileSync(tempFilePath, response.data);
        } else if (req.file) {
            // If an image file is uploaded directly
            const fileBuffer = fs.readFileSync(req.file.path);
            tempFilePath = path.join(__dirname, `temp_image_${Date.now()}.jpg`);
            fs.writeFileSync(tempFilePath, fileBuffer);
        } else {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Upload the file to Google AI File Manager
        const uploadResponse = await fileManager.uploadFile(tempFilePath, {
            mimeType: "image/jpeg",
            displayName: `temp_image_${Date.now()}`,
        });

        // Delete the temporary file after upload
        fs.unlinkSync(tempFilePath);
        console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

        const prompt = req.query.prompt || ''; // Get prompt from query parameters
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
});</html>

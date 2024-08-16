const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');

require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static('public')); // for serving static files like CSS, JS, etc.

// Set up multer for storing uploaded files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Route to display the index page
app.get('/', (req, res) => {
    res.render('index');
});

// Route to handle form submission
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        let documentText = "";
        // if (req.file.mimetype === 'application/pdf') {
        //     const pdfData = await pdfParse(req.file.buffer);
        //     documentText = pdfData.text;
        // } else {
        //     documentText = await textract.fromBufferWithName(req.file.originalname, req.file.buffer);
        // }

        // Construct the prompt using uploaded document content and additional form fields
        const prompt = `Additional Info: ${req.body.additionalInput} \nOption Selected: ${req.body.option} \nValues Selected: ${req.body.values}`;

        // Call OpenAI API
        const gptResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: "This is a conversation with a user uploading a document for analysis."
            }, {
                role: "user",
                content: prompt
            }]
        });

        // Render the result page with the response
        res.render('result', { response: gptResponse.choices[0].message.content });
    } catch (error) {
        console.error('Error processing the request:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');
const textract = require('textract');
const TORObject = require('./torObject'); // Import the TORObject class
require('dotenv').config();
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require('docx'); // Import docx librar

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add this line to parse JSON bodies
app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

let torObject = null; // Declare a global variable to store the TORObject instance

app.get('/', (req, res) => {
    res.render('index');
});

const getRandomNumber = () => Math.floor(Math.random() * 1000);

// Existing PDF download route
app.post('/download-pdf', (req, res) => {
    try {
        const doc = new PDFDocument();

        // Set headers to trigger a download in the browser
        res.setHeader('Content-Disposition', 'attachment; filename="Evaluation_Results.pdf"');
        res.setHeader('Content-Type', 'application/pdf');

        doc.pipe(res);

        // Add content to the PDF
        doc.fontSize(25).text('Evaluation Results', { align: 'center' });
        doc.moveDown(); // Move down to add more content

        // Add each section's data to the same page
        if (torObject) {
            const sections = torObject.getSectionsForRendering();
            sections.forEach((section, index) => {
                doc.fontSize(18).text(section.NAME, { align: 'left' });
                doc.fontSize(12).text(section.VALUE, { align: 'left' });
                if (index < sections.length - 1) {
                    doc.moveDown(1); // Add some space between sections
                }
            });
        }

        // Finalize the PDF and send it
        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF.');
    }
});

// New route to handle Word document download
app.post('/download-word', (req, res) => {
    try {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Evaluation Results',
                                    bold: true,
                                    size: 48,
                                }),
                            ],
                            alignment: "center",
                            spacing: { after: 300 },
                        }),
                    ],
                },
            ],
        });

        if (torObject) {
            const sections = torObject.getSectionsForRendering();
            sections.forEach((section) => {
                doc.addSection({
                    children: [
                        new Paragraph({
                            text: section.NAME,
                            heading: "Heading2",
                            spacing: { after: 100 },
                        }),
                        new Paragraph({
                            text: section.VALUE,
                            spacing: { after: 300 },
                        }),
                    ],
                });
            });
        }

        Packer.toBuffer(doc).then((buffer) => {
            res.setHeader('Content-Disposition', 'attachment; filename="Evaluation_Results.docx"');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.send(buffer);
        });
    } catch (error) {
        console.error('Error generating Word document:', error);
        res.status(500).send('Error generating Word document.');
    }
});


app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        let documentText = "";

        if (req.file.mimetype === 'application/pdf') {
            const pdfData = await pdfParse(req.file.buffer);
            documentText = pdfData.text;
        } else {
            documentText = await new Promise((resolve, reject) => {
                textract.fromBufferWithName(req.file.originalname, req.file.buffer, (error, text) => {
                    if (error) {
                        reject(`Textract error: ${error.message}`);
                    } else {
                        resolve(text);
                    }
                });
            });
        }

        torObject = new TORObject(); // Initialize the TORObject
        const sections = torObject.getSectionsForRendering();

        for (const section of sections) {
           const sectionKey = section.NAME.toLowerCase().replace(/ /g, '');
           const prompt = `${section.prompt}: ${documentText}`;
           try {
           
            //     const gptResponse = await openai.chat.completions.create({
            //         model: "gpt-4",
            //         messages: [{
            //             role: "system",
            //             content: "This is a conversation with a user uploading a document for analysis."
            //         }, {
            //             role: "user",
            //             content: prompt
            //         }]
            //     });

            //     torObject.updateSection(sectionKey, gptResponse.choices[0].message.content);
             torObject.updateSection(sectionKey, `Fallback response: ${getRandomNumber()}`);
            } catch (error) {
                console.warn('OpenAI API call failed, using fallback:', error);
                torObject.updateSection(sectionKey, `Fallback response: ${getRandomNumber()}`);
            }
        }

        res.render('result', { sections: torObject.getSectionsForRendering() });
        console.log('The sections after upload:', torObject.getSectionsForRendering());
    } catch (error) {
        console.error('Error processing the request:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

app.post('/update-tor/:index', (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const updatedValue = req.body.value;
        const isTextField = req.body.isTextField === 'true'; // Ensure correct boolean value

        if (torObject) {
            const sections = torObject.getSectionsForRendering();  
            console.log('The sections before updating:', sections);

            if (sections[index]) {
                const sectionKey = sections[index].NAME.toLowerCase().replace(/ /g, '');
                console.log(`Updating section ${sectionKey} with value: ${updatedValue}`);
                // Check if the value has changed before updating
                if (sections[index].VALUE !== updatedValue) {
                    torObject.updateSection(sectionKey, updatedValue, isTextField);
                }

                console.log('Updated TORObject sections:', torObject.getSectionsForRendering());
                res.json({ success: true, message: `Section ${index + 1} updated successfully.` });
            } else {
                res.status(400).json({ success: false, message: `Invalid section index ${index}.` });
            }
        } else {
            res.status(400).json({ success: false, message: 'TORObject is not initialized.' });
        }
    } catch (error) {
        console.error('Error updating torObject:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");
const pdfParse = require("pdf-parse");
const textract = require("textract");
const TORObject = require("./torObject"); // Import the TORObject class
require("dotenv").config();
const PDFDocument = require("pdfkit");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const path = require("path");
const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Correctly set the path to the views directory
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add this line to parse JSON bodies
app.use(express.static("public"));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let torObject = null; // Declare a global variable to store the TORObject instance

app.get("/", (req, res) => {
  res.render("index");
});

const getRandomNumber = () => Math.floor(Math.random() * 1000);

// Existing PDF download route
app.post("/download-pdf", (req, res) => {
  try {
    const doc = new PDFDocument();

    // Set headers to trigger a download in the browser
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Evaluation_Results.pdf"'
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(25).text("Evaluation Results", { align: "center" });
    doc.moveDown(); // Move down to add more content

    // Add each section's data to the same page
    if (torObject) {
      const sections = torObject.getSectionsForRendering();
      sections.forEach((section, index) => {
        doc.fontSize(18).text(section.NAME, { align: "left" });
        doc.fontSize(12).text(section.VALUE, { align: "left" });
        if (index < sections.length - 1) {
          doc.moveDown(1); // Add some space between sections
        }
      });
    }

    // Finalize the PDF and send it
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF.");
  }
});


app.post("/download-word", (req, res) => {
    try {
      // Create a new Document with a single section
      const sections = [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Evaluation Results",
                  bold: true,
                  size: 48,
                }),
              ],
              alignment: "center",
              spacing: { after: 10 },
            }),
          ],
        },
      ];
  
      if (torObject) {
        const renderedSections = torObject.getSectionsForRendering();
  
        // Add content to the same section
        renderedSections.forEach((section) => {
          sections[0].children.push(
            new Paragraph({
              text: section.NAME,
              heading: "Heading2",
              spacing: { after: 10 },
            })
          );
          sections[0].children.push(
            new Paragraph({
              text: section.VALUE,
              spacing: { after: 10 },
            })
          );
        });
      }
  
      // Create the document with the sections array
      const doc = new Document({
        sections,
      });
  
      Packer.toBuffer(doc).then((buffer) => {
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="Evaluation_Results.docx"'
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        res.send(buffer);
      });
    } catch (error) {
      console.error("Error generating Word document:", error);
      res.status(500).send("Error generating Word document.");
    }
  });
// File upload and initial section processing
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    let documentText = "";

    // Parse the uploaded file
    if (req.file.mimetype === "application/pdf") {
      const pdfData = await pdfParse(req.file.buffer);
      documentText = pdfData.text;
    } else {
      documentText = await new Promise((resolve, reject) => {
        textract.fromBufferWithName(
          req.file.originalname,
          req.file.buffer,
          (error, text) => {
            if (error) reject(`Textract error: ${error.message}`);
            else resolve(text);
          }
        );
      });
    }

    // Initialize TORObject and get sections
    torObject = new TORObject();
    const sections = torObject.getSectionsForRendering();

    // Process the first section
    if (sections.length > 0) {
      const firstSection = sections[0];
      const sectionKey = firstSection.NAME.toLowerCase().replace(/ /g, "");
      const prompt = `${firstSection.prompt}: ${documentText}`;

      try {
        // Uncomment the OpenAI API code to process the first section dynamically
        // const gptResponse = await openai.chat.completions.create({
        //     model: "gpt-4",
        //     messages: [
        //         { role: "system", content: "This is a conversation with a user uploading a document for analysis." },
        //         { role: "user", content: prompt }
        //     ]
        // });

        // torObject.updateSection(sectionKey, gptResponse.choices[0].message.content);

        // For now, use fallback response
        torObject.updateSection(
          sectionKey,
          `Fallback response: ${getRandomNumber()}`
        );
      } catch (error) {
        console.warn("OpenAI API call failed, using fallback:", error);
        torObject.updateSection(
          sectionKey,
          `OpenAI API call failed`
        );
      }

      // Render the first section to the user for acceptance
      res.render("result", { sections: torObject.getSectionsForRendering() });
    } else {
      res.status(400).send("No sections found.");
    }
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

app.post("/process-next-section/:index", async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const calledFromSave = req.body.calledFromSave;
    const selectedParameters = req.body.parameters || {}; // User-selected parameters
    if (isNaN(index)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid index parameter." });
    }

    if (!torObject) {
      return res
        .status(400)
        .json({ success: false, message: "TORObject is not initialized." });
    }

    const sections = torObject.getSectionsForRendering();

    if (index < 0 || index >= sections.length) {
      return res
        .status(400)
        .json({ success: false, message: `Invalid section index ${index}.` });
    }

    const currentSection = sections[index]; // Current section being processed
    const nextSection = sections[index + 1]; // Next section for processing

    // Function to escape special characters in the placeholder
    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    const replacePlaceholders = (
      prompt,
      extraPromptParameters,
      selectedParameters
    ) => {
      let updatedPrompt = prompt;
      extraPromptParameters.forEach((param, index) => {
        const { code } = param;
        const placeholder = `{${code}}`;
        // Escape the placeholder for regex
        const escapedPlaceholder = escapeRegExp(placeholder);
        const value = selectedParameters[index]; // Use code to get value
        const regex = new RegExp(escapedPlaceholder, "g");
        updatedPrompt = updatedPrompt.replace(regex, value);
      });

      return updatedPrompt;
    };

    // Process the current section's prompt with user-selected parameters
    if (Array.isArray(currentSection.extraPromptParameters) && !calledFromSave) {
      currentSection.prompt = replacePlaceholders(
        currentSection.prompt,
        currentSection.extraPromptParameters,
        selectedParameters
      );

      const sectionKey = currentSection.NAME.toLowerCase().replace(/ /g, "");
         // Uncomment the OpenAI API code to process the first section dynamically
        // const gptResponse = await openai.chat.completions.create({
        //     model: "gpt-4",
        //     messages: [
        //         { role: "system", content: "This is a conversation with a user uploading a document for analysis." },
        //         { role: "user", content: updatedPrompt }
        //     ]
        // });

        // torObject.updateSection(sectionKey, gptResponse.choices[0].message.content);

      torObject.updateSection(
        sectionKey,
        `Processed value: ${getRandomNumber()}`
      );

      // Process the next section
      if (nextSection&& !calledFromSave) {
        if (
          !Array.isArray(nextSection.extraPromptParameters) ||
          Object.keys(nextSection.extraPromptParameters).length === 0
        ) {
          // If next section has no extraPromptParameters or is an empty object
          const nextSectionKey = nextSection.NAME.toLowerCase().replace(
            / /g,
            ""
          );

          // Uncomment the OpenAI API code to process the first section dynamically
          // const gptResponse = await openai.chat.completions.create({
          //     model: "gpt-4",
          //     messages: [
          //         { role: "system", content: "This is a conversation with a user uploading a document for analysis." },
          //         { role: "user", content: updatedPrompt }
          //     ]
          // });

          // torObject.updateSection(nextSectionKey, gptResponse.choices[0].message.content);

          torObject.updateSection(
            nextSectionKey,
            `Fallback response: ${getRandomNumber()}`
          );
        }
      }

      res.json({
        success: true,
        message: "Section processed successfully.",
        nextSection: nextSection,
        sections: torObject.getSectionsForRendering(),
      });
    } else {
   
      // Process the next section
      if (nextSection ) {
        if (
          !Array.isArray(nextSection.extraPromptParameters) ||
          Object.keys(nextSection.extraPromptParameters).length === 0
        ) {
          const nextSectionKey = nextSection.NAME.toLowerCase().replace(
            / /g,
            ""
          );

            // Uncomment the OpenAI API code to process the first section dynamically
            // const gptResponse = await openai.chat.completions.create({
            //     model: "gpt-4",
            //     messages: [
            //         { role: "system", content: "This is a conversation with a user uploading a document for analysis." },
            //         { role: "user", content: updatedPrompt }
            //     ]
            // });

            // torObject.updateSection(nextSectionKey, gptResponse.choices[0].message.content);
          torObject.updateSection(
            nextSectionKey,
            `Fallback response: ${getRandomNumber()}`
          );
        }
      }

      res.json({
        success: true,
        message: "Section processed successfully.",
        nextSection: nextSection,
        sections: torObject.getSectionsForRendering(),
      });
    }
  } catch (error) {
    console.error("Error processing next section:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

app.post("/update-tor/:index", (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const updatedValue = req.body.value;
    const isTextField = req.body.isTextField === "true"; // Ensure correct boolean value
    if (torObject) {
      const sections = torObject.getSectionsForRendering();

      if (sections[index]) {
        const sectionKey = sections[index].NAME.toLowerCase().replace(/ /g, "");

        // Check if the value has changed before updating
        if (sections[index].VALUE !== updatedValue) {
    
          torObject.updateSection(sectionKey, updatedValue, isTextField);
         
        } else {
          console.log("No change detected, skipping update.");
        }


        res.json({
          success: true,
          message: `Section ${index + 1} updated successfully. `,
        });
      } else {
        res.status(400).json({
          success: false,
          message: `Invalid section index ${index}. `,
        });
      }
    } else {
      res
        .status(400)
        .json({ success: false, message: "TORObject is not initialized." });
    }
  } catch (error) {
    console.error("Error updating torObject:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

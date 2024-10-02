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
const { error } = require("console");
const app = express();
app.use((req, res, next) => {
  req.setTimeout(300000); // Set request timeout to 5 minutes
  res.setTimeout(300000); // Set response timeout to 5 minutes
  next();
});
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

// app.get("/", (req, res) => {
//   res.render("index");
// });
app.get("/", (req, res) => {
  // Check if the "norobots" parameter is present in the URL
  if (req.query.norobots !== undefined) {
    // Render index page if ?norobots is present
    res.render("index");
  } else {
    // Render an alternative page if ?norobots is not present
    res.render("alternativepage");  // Replace 'alternativePage' with your actual page name
  }
});

const getRandomNumber = () => Math.floor(Math.random() * 1000);

app.post("/download-pdf", (req, res) => {
  try {
    const doc = new PDFDocument();
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Evaluation_Results.pdf"'
    );
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(25).text("Evaluation Results", { align: "center" });
    doc.moveDown();

    // Add Type of Evaluation if available
    if (torObject && torObject.getTypeOfEvaluation()) {
      doc.fontSize(18).text(`Type of Evaluation:`, { align: "left" });
      doc.fontSize(12).text(torObject.getTypeOfEvaluation(), { align: "left" });
      doc.moveDown();
    }

    // Add sections
    if (torObject) {
      const sections = torObject.getSectionsForRendering();
      sections.forEach((section, index) => {
        // Skip section 7 (index === 6 since it's 0-based)
        if (index ===7) {
          return;
        }

        if (index === 0) {
          doc.fontSize(18).text(section.NAME, { align: "left" });
          doc.fontSize(12).text(section.VALUE, { align: "left" });
          doc.moveDown();

          // Add Starting Date after section 0 and before section 1
          if (torObject.getStartingDate()) {
            doc.fontSize(18).text(`Starting Date: `, { align: "left" });
            doc
              .fontSize(12)
              .text(torObject.getStartingDate(), { align: "left" });
            doc.moveDown();
          }
        } else {
          doc.fontSize(18).text(section.NAME, { align: "left" });
          doc.fontSize(12).text(section.VALUE, { align: "left" });
          if (index < sections.length - 1) doc.moveDown(1);
        }
      });
    }

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF.");
  }
});


// Word Document Download Route
app.post("/download-word", (req, res) => {
  try {
    const sections = [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "Evaluation Results", bold: true, size: 48 }),
            ],
            alignment: "center",
            spacing: { after: 10 },
          }),
        ],
      },
    ];

    // Add Type of Evaluation if available
    if (torObject && torObject.getTypeOfEvaluation()) {
      sections[0].children.push(
        new Paragraph({
          text: "Type of Evaluation:",
          heading: "Heading2",
          spacing: { after: 10 },  // Add spacing after the name
        })
      );
      sections[0].children.push(
        new Paragraph({
          text: torObject.getTypeOfEvaluation(),
          spacing: { after: 10 },  // Add spacing after the value
        })
      );
    }

    // Add sections with Starting Date after section 0, and skip section 7
    if (torObject) {
      const renderedSections = torObject.getSectionsForRendering();
      renderedSections.forEach((section, index) => {
        if (index === 0) {
          // Add section name
          sections[0].children.push(
            new Paragraph({
              text: section.NAME,
              heading: "Heading2",
              spacing: { after: 10 },  // Add spacing after the name
            })
          );
          
          // Add section value on a new line
          sections[0].children.push(
            new Paragraph({
              text: section.VALUE,
              spacing: { after: 10 },  // Add spacing after the value
            })
          );
        
          // Add Starting Date on a new line
          if (torObject.getStartingDate()) {
            sections[0].children.push(
              new Paragraph({
                text: "Starting Date:", // Title of the Starting Date
                heading: "Heading2",
                spacing: { after: 10 },
              })
            );
            sections[0].children.push(
              new Paragraph({
                text: torObject.getStartingDate(), // Value of the Starting Date
                spacing: { after: 10 },  // Add spacing after the date
              })
            );
          }
        
        
        } else if (index !== 7) {
          // Skip section 7
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
        }
      });
    }

    const doc = new Document({ sections });

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
let documentText = "";

// File Upload and Initial Section Processing
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    let errorMessage = null;
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

    torObject = new TORObject();
    const sections = torObject.getSectionsForRendering();

    if (sections.length > 0) {
      const firstSection = sections[0];
      const sectionKey = firstSection.NAME.toLowerCase().replace(/ /g, "");
      const prompt = `${firstSection.prompt}`;

      try {
       
        //  Uncomment the OpenAI API code to process the first section dynamically
        const gptResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Here is the document text for reference:\n\n${documentText}`,
            },
            { role: "user", content: prompt },
          ],
        });

        torObject.updateSection(
          sectionKey,
          gptResponse.choices[0].message.content
        );

        // Fallback response for now
   //     torObject.updateSection(sectionKey, `Fallback response: ${getRandomNumber()}.Test 1. Test2.`);
      } catch (error) {
        console.warn("OpenAI API call failed, using fallback:", error);
        torObject.updateSection(sectionKey, `OpenAI API call failed`);
        errorMessage = error;
      }
      res.render("result", {
        sections: torObject.getSectionsForRendering(),
        additionalInfo: `${errorMessage}`,
      });
    } else {
      res.status(400).send("No sections found.");
    }
  } catch (error) {
    console.error("Error processing the request:", error);
    res.json({ success: false, message: error });
    
  }
});

app.post("/process-next-section/:index", async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const selectedParameters = Array.isArray(req.body.parameters) ? req.body.parameters : [];
    const calledFromSave = req.body.calledFromSave;
    const callEndpoint = req.body.callEndpoint;

    if (isNaN(index)) {
      return res.status(400).json({ success: false, message: "Invalid index parameter." });
    }

    let sections = torObject.getSectionsForRendering();
    const nextSection = sections[index + 1]; // Ensure nextSection is never undefined
    const systemPrompt = torObject.getSystemPrompt();

    if (selectedParameters.length > 0) {
      torObject.addEvaluationCriteriaSections(selectedParameters);
      sections = torObject.getSectionsForRendering();
      const theNextOne = sections[index + 1];
      const prompt = `${theNextOne.prompt}`;
      const nextSectionKey = theNextOne ? theNextOne.NAME.toLowerCase().replace(/ /g, "") : null;

      if (nextSectionKey) {
        // Call GPT only if callEndpoint is true
        if (callEndpoint) {
          try {
            const gptResponse = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { role: "user", content: `Here is the document text for reference:\n\n${documentText}` },
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt },
              ],
            });
            if (gptResponse.choices && gptResponse.choices.length > 0) {
              torObject.updateSection(nextSectionKey, gptResponse.choices[0].message.content);
            } else {
              torObject.updateSection(nextSectionKey, `OpenAI call failed`);
            }
          } catch (error) {
            console.warn("OpenAI API call failed, using fallback:", error);
            torObject.updateSection(nextSectionKey, `Fallback response: ${getRandomNumber()}. Test 1. Test2.`);
          }
        } else {
          // Fallback response if callEndpoint is false
          torObject.updateSection(nextSectionKey, `Fallback response: ${getRandomNumber()}. Test 1. Test2.`);
        }
      }
      sections = torObject.getSectionsForRendering();

      return res.json({
        success: true,
        message: "Filtered sections based on selected parameters.",
        nextSection: nextSection,
        sections: sections,
      });
    }

    if (index < 0 || index >= sections.length) {
      return res.status(400).json({ success: false, message: `Invalid section index ${index}.` });
    }

    const currentSection = sections[index];
    const currentSectionKey = currentSection.NAME.toLowerCase().replace(/ /g, "");
    const nextSectionKey = nextSection ? nextSection.NAME.toLowerCase().replace(/ /g, "") : null;

    if (nextSectionKey) {
      const prompt = `${nextSection.prompt}`;
      if (nextSectionKey === "durationofevaluationprocess") {
        if (callEndpoint) {
          try {
            const gptResponse = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { role: "user", content: `Here is the document text for reference:\n\n${documentText}` },
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt },
              ],
            });
            if (gptResponse.choices && gptResponse.choices.length > 0) {
              torObject.updateSection(nextSectionKey, gptResponse.choices[0].message.content);
            } else {
              torObject.updateSection(nextSectionKey, `OpenAI call failed`);
            }
          } catch (error) {
            console.warn("OpenAI API call failed, using fallback:", error);
            torObject.updateSection(nextSectionKey, `Fallback response: ${getRandomNumber()}. Test 1. Test2.`);
          }
        } else {
          torObject.updateSection(nextSectionKey, `Fallback response: ${getRandomNumber()}. Test 1. Test2.`);
        }
      } else {
        if (callEndpoint) {
          try {
            const gptResponse = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { role: "user", content: `Here is the document text for reference:\n\n${documentText}` },
                { role: "user", content: prompt },
              ],
            });

            if (gptResponse.choices && gptResponse.choices.length > 0) {
              torObject.updateSection(nextSectionKey, gptResponse.choices[0].message.content);
            } else {
              torObject.updateSection(nextSectionKey, `OpenAI call failed`);
            }
          } catch (error) {
            console.warn("OpenAI API call failed, using fallback:", error);
            torObject.updateSection(nextSectionKey, `Fallback response: ${getRandomNumber()}. Test 1. Test2.`);
          }
        }
      }

      return res.json({
        success: true,
        message: "Section processed successfully.",
        nextSection: nextSection,
        sections: torObject.getSectionsForRendering(),
      });
    } else {
      return res.json({
        success: false,
        message: "No more sections to process",
        nextSection: null,
        sections: torObject.getSectionsForRendering(),
      });
    }
  } catch (error) {
    console.error("Error processing next section:", error);
    res.status(500).json({ success: false, message: error });
  }
});

app.post("/save-start-date", (req, res) => {
  try {
    const startingDate = req.body.startDate; // Match this with the client-side field
    if (!torObject) {
      return res
        .status(400)
        .json({ success: false, message: "TORObject is not initialized." });
    }

    torObject.setStartingDate(startingDate); // Assume setStartingDate is defined on torObject
    res.json({
      success: true,
      message: "Starting date saved successfully.",
      additionalInfo: torObject.getAdditionalInfoForRendering(),
    });
  } catch (error) {
    console.error("Error saving starting date:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});
app.post("/save-evaluation-type", (req, res) => {
  try {
    const evaluationType = req.body.evaluationType; // Match this with the client-side field
    if (!torObject) {
      return res
        .status(400)
        .json({ success: false, message: "TORObject is not initialized." });
    }

    torObject.setTypeOfEvaluation(evaluationType); // Assume setTypeOfEvaluation is defined on torObject
    res.json({
      success: true,
      message: "Evaluation type saved successfully.",
      sections: torObject.getSectionsForRendering(),
    });

    torObject.updateSystemPrompt();
  } catch (error) {
    console.error("Error saving evaluation type:", error);
    res.status(500).json({ success: false, message: error });
  }
});

// Update TOR Section
app.post("/update-tor/:index", (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const updatedValue = req.body.value;
    const isTextField = req.body.isTextField === "true"; // Ensure correct boolean value

    if (!torObject) {
      return res
        .status(400)
        .json({ success: false, message: "TORObject is not initialized." });
    }

    const sections = torObject.getSectionsForRendering();

    if (sections[index]) {
      const sectionKey = sections[index].NAME.toLowerCase().replace(/ /g, "");

      // Check if the value has changed before updating
      if (sections[index].VALUE !== updatedValue) {
        torObject.updateSection(sectionKey, updatedValue, isTextField);
      }
      res.json({
        success: true,
        message: `Section ${index + 1} updated successfully.`,
        updatedSection: torObject.getSectionsForRendering()[index],
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: `Section ${index + 1} not found.` });
    }
  } catch (error) {
    console.error("Error updating TOR section:", error);
    res.status(500).json({ success: false, message: error });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
// File upload and initial section processing
// app.post("/upload", upload.single("file"), async (req, res) => {
//     try {
//       let documentText = "";

//       // Parse the uploaded file
//       if (req.file.mimetype === "application/pdf") {
//         const pdfData = await pdfParse(req.file.buffer);
//         documentText = pdfData.text;
//       } else {
//         documentText = await new Promise((resolve, reject) => {
//           textract.fromBufferWithName(
//             req.file.originalname,
//             req.file.buffer,
//             (error, text) => {
//               if (error) reject(`Textract error: ${error.message}`);
//               else resolve(text);
//             }
//           );
//         });
//       }

//       // Initialize TORObject and get sections
//       torObject = new TORObject();
//       const sections = torObject.getSectionsForRendering();

//       // Process the first section
//       if (sections.length > 0) {
//         const firstSection = sections[0];
//         const sectionKey = firstSection.NAME.toLowerCase().replace(/ /g, "");
//         const prompt = `${firstSection.prompt}: ${documentText}`;

//         try {
//           // Uncomment the OpenAI API code to process the first section dynamically
//           // const gptResponse = await openai.chat.completions.create({
//           //     model: "gpt-4",
//           //     messages: [
//           //         { role: "system", content: "This is a conversation with a user uploading a document for analysis." },
//           //         { role: "user", content: prompt }
//           //     ]
//           // });

//           // torObject.updateSection(sectionKey, gptResponse.choices[0].message.content);

//           // For now, use fallback response
//           torObject.updateSection(
//             sectionKey,
//             `Fallback response: ${getRandomNumber()}`
//           );
//         } catch (error) {
//           console.warn("OpenAI API call failed, using fallback:", error);
//           torObject.updateSection(
//             sectionKey,
//             `OpenAI API call failed`
//           );
//         }

//         // Render the first section to the user for acceptance
//         res.render("result", { sections: torObject.getSectionsForRendering() });
//       } else {
//         res.status(400).send("No sections found.");
//       }
//     } catch (error) {
//       console.error("Error processing the request:", error);
//       res.status(500).send("An error occurred while processing your request.");
//     }
//   });

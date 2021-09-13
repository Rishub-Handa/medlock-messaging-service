const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { main } = require("./src/index");
const { registerPatient, beginStudy } = require("./src/patientLogistics");
const { inboundMsgHandler } = require("./src/inbound");
const { qText } = require("./src/outbound");

// Connect to MongoDB
const db = process.env.DB_URL;

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("MongoDB Connected. ");
  })
  .catch((err) => {
    console.log(err);
  });

// Handling incoming requests

const app = express();
const PORT = 5000;

// Body Parsers Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handle incoming text
app.post("/sms", function (req, res) {
  const phoneNum = req.body.From;
  const msg = req.body.Body;
  console.log(`${phoneNum}: ${msg}`);
  inboundMsgHandler(phoneNum, msg);
  res.writeHead(200);
});

// Handle request to register patient
app.post("/api/registerPt", async function (req, res) {
  console.log("registering pt. ");
  console.log(req.body);
  await registerPatient(
    req.body.name,
    req.body.phoneNum,
    req.body.reminderTimes,
    req.body.followUpTime,
    req.body.finalReminderTime,
    req.body.emergencyContact
  );
  res.send("Registered, thank you. ");
});

// Handle request to begin study for a patient
app.post("/api/beginStudy", async function (req, res) {
  console.log(`starting study for ${req.body.phoneNum}. `);
  await beginStudy(req.body.phoneNum);
  res.send("Starting the study, thank you. ");
});

// Send patient a specific custom text
app.post("/api/customText", function (req, res) {
  console.log(`Sending custom text to: ${req.body.phoneNum}`);
  qText(req.body.phoneNum, req.body.msg);
  res.send("Sent custom text, thank you. ");
});

// Testing async cron jobs

// On startup
main();

// Listen for requests on PORT
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Process started on port ${PORT}.`);
});

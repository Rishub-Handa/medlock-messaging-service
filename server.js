const express = require('express')
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose'); 
const { main } = require('./src/index'); 
const { registerPatient, beginStudy } = require('./src/patientLogistics'); 
const { inboundMsgHandler } = require('./src/inbound'); 

// Connect to MongoDB 
const db = 'mongodb+srv://chase:chase123@patient-data-4fcpy.mongodb.net/patient-datadb?retryWrites=true&w=majority'

mongoose.connect(db, {
    useNewUrlParser: true, 
    useCreateIndex: true 
    }) 
        .then(() => {
            console.log("MongoDB Connected. "); 
        }) 
        .catch(err => {
            console.log(err); 
        }); 


// Handling incoming requests 

const app = express()
const PORT = 5000

// Body Parsers Middleware 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());

// Handle incoming text 
app.post('/sms', function(req, res) {
    const phoneNum = req.body.From; 
    const msg = req.body.Body; 
    console.log(`${phoneNum}: ${msg}`); 
    inboundMsgHandler(phoneNum, msg); 
    res.writeHead(200);
});

// Handle request to register patient 
app.post('/api/registerPt', function(req, res) {
    console.log("registering pt. "); 
    console.log(req.body); 
    registerPatient(req.body.name, 
                    req.body.phoneNum, 
                    req.body.reminderTimes, 
                    req.body.followUpTime, 
                    req.body.finalReminderTime, 
                    req.body.emergencyContact); 
    res.send("Registered, thank you. "); 
}); 

// Handle request to begin study for a patient 
app.post('/api/beginStudy', function(req, res) {
    console.log(`starting study for ${req.body.phoneNum}. `); 
    beginStudy(req.body.phoneNum)
    res.send("Starting the study, thank you. "); 
}); 


// On startup 
main(); 

// Listen for requests on PORT 
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Process started on port ${PORT}.`); 
}); 
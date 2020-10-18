const express = require('express')
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose'); 
const { main } = require('./src/index'); 

// TODO: REFACTOR ALL NESTED PROMISES 

// DEBUG: 
const { qText } = require('./src/outbound');


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
    const msg = req.body.Body
    console.log(msg)
    res.writeHead(200);
});

// Handle request to register patient 
app.post('/api/registerPt', function(req, res) {
    console.log("registering pt. "); 
    console.log(req.body); 
    res.send("Registered, thank you. "); 
}); 

// Handle request to begin study for a patient 
app.post('/api/beginStudy', function(req, res) {
    console.log("starting study. "); 
    console.log(req.body); 

    res.send("Starting the study, thank you. "); 
}); 



// DEBUG: testing queue 

function test_q() {
    qText("+17326667043", "test1"); 
    qText("+17326667043", "test2"); 

    qText("+15713517342‬", "test1"); 
    qText("+15713517342‬", "test2"); 

    qText("+17326667043", "test3"); 
    qText("+17326667043", "test4"); 

    qText("+15713421983", "test1"); 
    qText("+15713421983", "test2"); 
}

// test_q()


// On startup 
main(); 



// Listen for requests on PORT 
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Process started on port ${PORT}.`); 
}); 
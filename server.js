const express = require('express')
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose'); 
const axios = require('axios'); 
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const CronJobManager = require('cron-job-manager'); 

// DEBUG: 
const { sendText, qText, dQ, isQEmpty } = require('./src/outbound');
const { response } = require('express');


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
app.post('/api/inbound', function(req, res) {
    console.log("incoming text. "); 
    console.log(req.body); 



    res.send("Received, thank you. "); 
}); 

// Handle request to register patient 
app.post('/api/registerPt', function(req, res) {
    console.log("registering pt. "); 
    console.log(req.body); 
    res.send("Registered, thank you. "); 
}); 

app.post('/sms', function(req, res) {
    const msg = req.body.Body
    console.log(msg)
    res.writeHead(200);
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

// Start a cron job that checks the message queue every two seconds 
const sendMsgManager = new CronJobManager() 
sendMsgManager.add('sendMsgManager', '*/2 * * * * *', () => {
    console.log("running send message cron job. "); 
    
    // If the message queue isn't empy 
    if(!isQEmpty()) {
        // Dequeue a message and send it 
        const qMsg = dQ(); 
        console.log(qMsg.phoneNum); 
        console.log(qMsg.msg); 
        sendText(qMsg.phoneNum, qMsg.msg); 

    }

}); 

sendMsgManager.start('sendMsgManager'); 

 





// Listen for requests on PORT 
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Process started on port ${PORT}.`); 
}); 
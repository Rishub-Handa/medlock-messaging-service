const express = require('express')
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose'); 


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
app.post('/api/incomingText', function(req, res) {
    console.log("incoming text. "); 
    console.log(req.body); 
    res.send("Received, thank you. "); 


})

// Handle request to register patient 
app.post('/api/registerPt', function(req, res) {
    console.log("registering pt. "); 
    console.log(req.body); 
    res.send("Registered, thank you. "); 
})



// Listen for requests on PORT 
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Process started on port ${PORT}.`); 
}); 
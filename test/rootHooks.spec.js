const { registerPatient } = require('../src/patientLogistics'); 
const mongoose = require('mongoose')




before("connect to mongoDB and register test patient", async function() {
    this.timeout(0); 
    const db = 'mongodb+srv://chase:chase123@patient-data-4fcpy.mongodb.net/patient-datadb?retryWrites=true&w=majority'

    await mongoose.connect(db, {
        useNewUrlParser: true, 
        useCreateIndex: true 
        })
        .then(() => console.log("connected to mongoDB")); 

    // First create patient; patient should be created successfully 
    await registerPatient("Rishub Handa", "+17326667043", "10:00", "18:00", "20:00", "Mom (phone number)"); 
    console.log("finished registering test patient.")
}); 

after("delete test patients", async function() {
    await Patient.deleteOne({ 'personalData.phone': "+17326667043" })
            .catch(err => console.log(err));
    console.log("deleting patients. "); 
}); 

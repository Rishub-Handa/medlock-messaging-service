const { hasTakenMeds, isCompliant, getRiskScore, getSentMsgs, isExpectingResponse } = require('../src/patientInfo'); 
const { inCrisis } = require('../src/patientActions'); 
const { resetTookMedsToday } = require('../src/patientActions'); 
const { inboundMsgHandler } = require('../src/inbound');
const { registerPatient } = require('../src/patientLogistics'); 

const mongoose = require('mongoose'); 
const assert = require('assert'); 



describe('patientInfo', function() {

    describe('#hasTakenMeds, #isCompliant', function() {

        before("reset if patient took meds today", async function() {
            await resetTookMedsToday("+17326667043"); 
        }); 

        it("it should correctly return if the patient has NOT taken medications today", async function() {
            const res = await hasTakenMeds("+17326667043"); 
            assert.strictEqual(res,  false); 

            const pt = await Patient.findOne({ 'personalData.phone': "+17326667043" })
                .catch(err => console.log(err)); 

            assert.strictEqual(isCompliant(pt.medicalData.textData.dispenses), false); 

        }); 

        it("it should correctly return if the patient has taken medications today", async function() {
            await inboundMsgHandler("+17326667043", "MED 5"); 
            const res = await hasTakenMeds("+17326667043"); 
            assert.strictEqual(res, true); 

            const pt = await Patient.findOne({ 'personalData.phone': "+17326667043" })
                .catch(err => console.log(err)); 

            assert.strictEqual(isCompliant(pt.medicalData.textData.dispenses), true); 

        }); 

    }); 

    describe('#getRiskScore', function(){
        before('reset test patient', async function() {
            this.timeout(0);

            // Delete current patient 
            await Patient.deleteOne({ 'personalData.phone': "+17326667043" })
                .catch(err => console.log(err));
            console.log("deleting patients. "); 

            // Create new patient 
            const db = 'mongodb+srv://chase:chase123@patient-data-4fcpy.mongodb.net/patient-datadb?retryWrites=true&w=majority'

            await mongoose.connect(db, {
                useNewUrlParser: true, 
                useCreateIndex: true 
                })
                .then(() => console.log("connected to mongoDB")); 

            // First create patient; patient should be created successfully 
            await registerPatient("Rishub Handa", "+17326667043", ["10:00"], "18:00", "20:00", "Mom (phone number)"); 
            console.log("finished registering test patient.")
        }); 

        it("should return medium risk if no data", async function(){
            const score = await getRiskScore("+17326667043"); 
            assert.strictEqual(score, 3); 
        }); 

        it("should return crisis if in crisis mode", async function(){
            const phoneNum = "+17326667043"; 
            await inCrisis(phoneNum); 
            const score = await getRiskScore(phoneNum); 
            assert.strictEqual(score, 6); 
        }); 
        
        it("should return an average over the last three days", async function() {
            const phoneNum = "+17326667043"; 
            await inboundMsgHandler(phoneNum, "med 5"); 
            await inboundMsgHandler(phoneNum, "my cravings are a 4"); 
            await inboundMsgHandler(phoneNum, "I'm doing better today. Cravings are 1. "); 

            const score = await getRiskScore(phoneNum); 
            assert.strictEqual(score, 4); 
        }); 

        after('reset test patient', async function() {
            // Delete current patient 
            await Patient.deleteOne({ 'personalData.phone': "+17326667043" })
                .catch(err => console.log(err));
            console.log("deleting patients. "); 

            // Create new patient 
            const db = 'mongodb+srv://chase:chase123@patient-data-4fcpy.mongodb.net/patient-datadb?retryWrites=true&w=majority'

            await mongoose.connect(db, {
                useNewUrlParser: true, 
                useCreateIndex: true 
                })
                .then(() => console.log("connected to mongoDB")); 

            // First create patient; patient should be created successfully 
            await registerPatient("Rishub Handa", "+17326667043", ["10:00"], "18:00", "20:00", "Mom (phone number)"); 
            console.log("finished registering test patient.")

        }); 
    }); 


    
    



})






const { inboundMsgHandler, 
        textHasMedData, 
        textHasCravingsData } = require('../src/inbound'); 
const { registerPatient } = require('../src/patientLogistics'); 
const { updateExpectingResponse } = require('../src/patientActions'); 
const { lastQElem } = require('../src/outbound'); 

const mongoose = require('mongoose')
const assert = require('assert'); 
const textBank = require('../msgBank/textBank.json'); 
const specialTexts = require('../msgBank/specialTexts.json'); 


describe('inbound', function() {

    before("receive a few messages with medication, cravings, and other data", async function(){

        const phoneNum = "+17326667043"; 

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
        await registerPatient("Rishub Handa", "+17326667043", "10:00", "18:00", "20:00", "Mom (phone number)"); 
        console.log("finished registering test patient.")

        await inboundMsgHandler(phoneNum, "MED 5"); 
        await inboundMsgHandler(phoneNum, "My favorite hobby is snowboarding. "); 
        await inboundMsgHandler(phoneNum, "I took my medications today"); 
        await inboundMsgHandler(phoneNum, "My cravings are at 3"); 

    }); 


    describe('#inboundMsgHandler', function() {
        
        it("should store patient message in database", async function() {
            const pt = await Patient.findOne({ 'personalData.phone': "+17326667043" })
                .catch(err => console.log(err)); 
            
            const msgHistory = pt.medicalData.textHistory; 
            let msg1Saved = false; 
            let msg2Saved = false; 
            let msg3Saved = false; 
            let msg4Saved = false; 

            msgHistory.forEach(msg => {
                if((msg.sender == "Pt") && (msg.body == "MED 5"))msg1Saved = true; 
                if((msg.sender == "Pt") && (msg.body == "I took my medications today")) msg2Saved = true; 
                if((msg.sender == "Pt") && (msg.body == "My cravings are at 3")) msg3Saved = true; 
                if((msg.sender == "Pt") && (msg.body == "My favorite hobby is snowboarding. ")) msg4Saved = true; 

            })

            assert.strictEqual(msg1Saved, true); 
            assert.strictEqual(msg2Saved, true); 
            assert.strictEqual(msg3Saved, true); 
            assert.strictEqual(msg4Saved, true); 

        }); 
        

        it("should add to dispenses and cravings in database if it has med and cravings data", async function() {
            const pt = await Patient.findOne({ 'personalData.phone': "+17326667043" })
                .catch(err => console.log(err)); 
            
            const dispenses = pt.medicalData.textData.dispenses; 
            const cravings = pt.medicalData.textData.cravings; 

            assert.strictEqual(dispenses.length, 2); 
            assert.strictEqual(cravings.length, 2); 

        }); 

        it("should handle texts when expecting a response", async function() {
            const phoneNum = "+17326667043"; 

            // Incoming response to intro msg 
            await updateExpectingResponse(phoneNum, -2);
            await inboundMsgHandler(phoneNum, "yes"); 
            assert.strictEqual(lastQElem().msg, specialTexts.introductoryMsgFollowUp[0]); 

            // Incoming response to follow up msg 
            await updateExpectingResponse(phoneNum, 3);
            await inboundMsgHandler(phoneNum, "some topic"); 
            assert.strictEqual(lastQElem().msg, textBank[3].responses[0].replace("TOPIC", "some topic")); 

            await updateExpectingResponse(phoneNum, 3);
            await inboundMsgHandler(phoneNum, "n"); 
            assert.strictEqual(lastQElem().msg, textBank[3].followUpResponses[1]); 

            // Incoming response to no follow up msg 
            await updateExpectingResponse(phoneNum, 11);
            await inboundMsgHandler(phoneNum, "n"); 
            assert.strictEqual(lastQElem().msg, textBank[11].responses[1]); 

        }); 

        it("should handle unanticipated response from patients", async function() {
            const phoneNum = "+17326667043"; 
            await updateExpectingResponse(phoneNum, -1); 
            await inboundMsgHandler(phoneNum, "some random text"); 
            assert.strictEqual(lastQElem().msg, "Sorry, I didn\'t get that. Send \'med\' when you take your medication and text a number from 1-5 to track your cravings. ");         

        }); 


    })



    describe('#textHasMedData', function() {
        it("should correctly return if the message has or doesn't have medication data", function() {

            // The messaging service will NOT context for full sentences 
            const msg1 = "I took my meds. My cravings are 5"; 
            const msg2 = "Medication"; 
            const msg3 = "med"; 
            const msg4 = "MED"; 
            const msg5 = "subs"; 
            const msg6 = "I took my suboxone or methadone"; 
            const msg7 = "I didn't take my meds today"; 
            const msg8 = "I'll take my medication later"; 
            const msg9 = "I went to the clinic today"; 

            assert.strictEqual(textHasMedData(msg1), true); 
            assert.strictEqual(textHasMedData(msg2), true); 
            assert.strictEqual(textHasMedData(msg3), true); 
            assert.strictEqual(textHasMedData(msg4), true); 
            assert.strictEqual(textHasMedData(msg5), false); 
            assert.strictEqual(textHasMedData(msg6), false); 
            assert.strictEqual(textHasMedData(msg7), true); 
            assert.strictEqual(textHasMedData(msg8), true); 
            assert.strictEqual(textHasMedData(msg9), false); 

        }); 

    }); 

    describe('#textHasCravingsData', function() {
        it("should correctly return if the text has or does not have cravings data", function() {

            const msg1 = "I took my meds. My cravings are 5"; 
            const msg2 = "Medication"; 
            const msg3 = "med 1"; 
            const msg4 = "my cravings are a 12"; 
            const msg5 = "MED 2"; 
            const msg6 = "I need help. My cravings are a 6"; 
            const msg7 = "I'm doing better today. Cravings are 2. "; 



            assert.strictEqual(textHasCravingsData(msg1), 5); 
            assert.strictEqual(textHasCravingsData(msg2), null); 
            assert.strictEqual(textHasCravingsData(msg3), 1); 
            assert.strictEqual(textHasCravingsData(msg4), 1); 
            assert.strictEqual(textHasCravingsData(msg5), 2); 
            assert.strictEqual(textHasCravingsData(msg6), null); 
            assert.strictEqual(textHasCravingsData(msg7), 2); 


        })

    }); 

    after("reset the patient ", async function() {
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
        await registerPatient("Rishub Handa", "+17326667043", "10:00", "18:00", "20:00", "Mom (phone number)"); 
        console.log("finished registering test patient.")

    }); 







}); 
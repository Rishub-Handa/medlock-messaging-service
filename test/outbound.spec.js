const { getAllTextsByPhone, 
        saveTextFromPatient, 
        saveTextFromServer } = require('../src/outbound'); 
const assert = require('assert');
const mongoose = require('mongoose')

describe('outbound', function() {
    

    before("save text from patient and server", async function() {
        console.log("saving texts from patient and server"); 
        await saveTextFromPatient("+17326667043", "my first message"); 
        await saveTextFromServer("+17326667043", "message from server"); 
    }); 

    describe('#saveTextFromPatient', function() {

        it("should correctly save text from patient to text history", async function() {
            const pt = await Patient.findOne({ 'personalData.phone': "+17326667043" })
                .catch(err => console.log(err));
            const text = pt.medicalData.textHistory[0]; 
            assert.strictEqual(text.sender, "Pt"); 
            assert.strictEqual(text.body, "my first message"); 

        }); 

    }); 

    describe('#saveTextFromServer', function() {

        it("should correctly save text from server to text history", async function() {
            const pt = await Patient.findOne({ 'personalData.phone': "+17326667043" })
                .catch(err => console.log(err));
            const text = pt.medicalData.textHistory[1]; 
            assert.strictEqual(text.sender, "Ms"); 
            assert.strictEqual(text.body, "message from server"); 

        }); 
    }); 

    describe('#getAllTextsByPhone', function() {
        it("should correctly retrieve text history with phone number", async function() {
            const textHistory = await getAllTextsByPhone("+17326667043"); 
            assert.strictEqual(textHistory.length, 2); 

        }); 
    }); 


}); 

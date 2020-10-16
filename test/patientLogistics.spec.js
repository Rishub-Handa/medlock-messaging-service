
const assert = require('assert');
const mongoose = require('mongoose')

describe('Patient', function() {

    describe('#registerPatient', function() {

        it("should successfully create patient with required fields", async function() {            

            // Query for patient; patient should have correct fields 
            
            const pt = await Patient.findOne({ 'personalData.phone': "+17326667043" })
                .catch(err => console.log(err));
            
            assert.strictEqual(pt.personalData.name, "Rishub Handa"); 
            assert.strictEqual(pt.personalData.phone, "+17326667043"); 

            const remTime = pt.medicalData.textData.medReminderTime[0]; 
            const remHour = remTime.hour; 
            const remMin = remTime.minute; 

            assert.strictEqual(remHour, 10); 
            assert.strictEqual(remMin, 0); 

            const followTime = pt.medicalData.textData.followUpTime; 
            const followHour = followTime.hour; 
            const followMin = followTime.minute; 

            assert.strictEqual(followHour, 18); 
            assert.strictEqual(followMin, 0); 

            assert.strictEqual(pt.medicalData.textData.emergencyContact, "Mom (phone number)"); 
            
        }); 

    }); 

}); 
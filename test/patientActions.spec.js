const { updateSentMsgs, updateExpectingResponse, inCrisis } = require('../src/patientActions'); 
const { getSentMsgs, isExpectingResponse, getRiskScore } = require('../src/patientInfo'); 
const assert = require('assert'); 
const Patient = require('../src/models/Patient'); 

describe('patientActions', function() {

    describe('#updateSentMsgs', function() {
        it("should be able to update messages sent to patient with msgID", async function() {
            const phoneNum = "+17326667043"
            let initialMsgs = await getSentMsgs(phoneNum); 
            await updateSentMsgs(phoneNum, 1); 
            await updateSentMsgs(phoneNum, 9); 
            const finalMsgs = await getSentMsgs(phoneNum);

            assert.ok(JSON.stringify(finalMsgs) === JSON.stringify(initialMsgs.concat([1, 9]))); 
        }); 

    }); 

    describe('#updateExpectingResponse', function() {
        it("should be able to update if the service is expecting a response from the patient", async function() {
            const phoneNum = "+17326667043"
            let expRes = await isExpectingResponse(phoneNum); 
            assert.strictEqual(expRes, -2); 
            await updateExpectingResponse(phoneNum, 2); 
            expRes = await isExpectingResponse(phoneNum); 
            assert.strictEqual(expRes, 2); 
        }); 

        // IMPLEMENT: test that once patient responds as expected, isExpectingResponse is -1? 

    }); 

    describe('#inCrisis', function() {
        it("should update patient to crisis mode and return the number of daysInCrisis", async function() {
            const phoneNum = "+17326667043"

            // Update patient to crisis mode and risk score to 6 
            let daysInCrisis = await inCrisis(phoneNum)
            assert.strictEqual(daysInCrisis, 1); 
            const riskScore = await getRiskScore(phoneNum); 
            assert.strictEqual(riskScore, 6); 

            // If patient is already in crisis mode, daysInCrisis should increase by 1 
            const pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
            let tmpCrisisStartDate = new Date(); 
            tmpCrisisStartDate.setDate(tmpCrisisStartDate.getDate() - 2); 
            tmpCrisisStartDate.setHours(0, 0, 0, 0); 
            pt.medicalData.textData.crisisStartDate = tmpCrisisStartDate; 
            await pt.save(); 

            daysInCrisis = await inCrisis(phoneNum)
            assert.strictEqual(daysInCrisis, 3); 

        }); 



    }); 

}); 


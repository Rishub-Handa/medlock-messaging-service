const { getFollowUpManager, doesFollowUpJobExist, 
        handleExpectedResponse, introMsgResponse, expectedResponsesNoFollowUp, getFolUpMessage, expectedResponsesWithFollowUp, 
        sendMedResponse, pickMedResponse, getTextWithRiskLevel, parseNAME } = require('../src/textResponse'); 
const { isExpectingResponse } = require('../src/patientInfo'); 
const { dQ, isQEmpty, printQ, lastQElem } = require('../src/outbound'); 
const assert = require('assert'); 
const textBank = require('../msgBank/textBank.json'); 
const specialTexts = require('../msgBank/specialTexts.json'); 

describe('textResponse', function() {
    this.timeout(0); 

    describe('#handleExpectedResponse', function() {

        it("should correctly handle interactive messages", async function() {
            const phoneNum = "+17326667043"; 

            const introMsg1 = await handleExpectedResponse(phoneNum, "yes", -2); 
            assert.strictEqual(introMsg1, specialTexts.introductoryMsgFollowUp[0]); 
            const introMsg2 = await handleExpectedResponse(phoneNum, "n", -2); 
            assert.strictEqual(introMsg2, specialTexts.introductoryMsgFollowUp[1]); 

            const wFollowUp1 = await handleExpectedResponse(phoneNum, "home", 29); 
            assert.strictEqual(wFollowUp1, textBank[29].responses[0].replace("LOCATION", "home")); 

            const wFollowUp2 = await handleExpectedResponse(phoneNum, "Y", 29); 
            assert.strictEqual(wFollowUp2, textBank[29].followUpResponses[0]); 

            const noFollowUp1 = await handleExpectedResponse(phoneNum, "Y", 26); 
            assert.strictEqual(noFollowUp1, textBank[26].responses[0]); 

            const noFollowUp2 = await handleExpectedResponse(phoneNum, "mom", 2); 
            assert.strictEqual(noFollowUp2, textBank[2].responses[0]); 

            const expRes = await isExpectingResponse(phoneNum); 
            assert.strictEqual(expRes, -1); 
    
            printQ(); 
            console.log(`Follow Up Response Cron Jobs: ${getFollowUpManager().listCrons()}`); 

        }); 

    }); 



    describe('#introMsgResponse', function() {
        it("should reply correctly to patient response to introductory message", function() {
            let res = introMsgResponse("y"); 
            assert.strictEqual(res, specialTexts.introductoryMsgFollowUp[0]); 

            res = introMsgResponse("yes"); 
            assert.strictEqual(res, specialTexts.introductoryMsgFollowUp[0]); 

            res = introMsgResponse("YES"); 
            assert.strictEqual(res, specialTexts.introductoryMsgFollowUp[0]); 

            res = introMsgResponse("N"); 
            assert.strictEqual(res, specialTexts.introductoryMsgFollowUp[1]); 

            res = introMsgResponse("No"); 
            assert.strictEqual(res, specialTexts.introductoryMsgFollowUp[1]); 

            res = introMsgResponse("nah"); 
            assert.strictEqual(res, null); 

        }); 

    }); 

    describe('#expectedResponsesNoFollowUp', function() {
        this.timeout(0); 

        before("reset sentMsgs for test patient", async function() {
            const phoneNum = "+17326667043"; 
            const pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
            pt.medicalData.textData.sentMsgs = []; 
            await pt.save(); 
        }); 

        it("should respond correctly to yes or no questions", async function() {
            const phoneNum = "+17326667043"; 

            // Pick a YN interactive msg 
            const YNMsgs = textBank.filter(msg => msg.interactive == "YN"); 
            const msgIdx = Math.floor(Math.random() * YNMsgs.length); 
            let msg = YNMsgs[msgIdx]; 
            
            let expRes = expectedResponsesNoFollowUp(msg.interactive, "Y", msg.id); 
            assert.strictEqual(expRes, msg.responses[0]); 

            expRes = expectedResponsesNoFollowUp(msg.interactive, "yes", msg.id); 
            assert.strictEqual(expRes, msg.responses[0]); 

            expRes = expectedResponsesNoFollowUp(msg.interactive, "n", msg.id); 
            assert.strictEqual(expRes, msg.responses[1]); 

            expRes = expectedResponsesNoFollowUp(msg.interactive, "no", msg.id); 
            assert.strictEqual(expRes, msg.responses[1]); 

            expRes = expectedResponsesNoFollowUp(msg.interactive, "random response", msg.id); 
            assert.strictEqual(expRes, null); 

        }); 

        it("should properly response to PERSON, TRIGGER, and GOAL response types", function() {
            const personMsg = textBank.filter(msg => msg.interactive == "PERSON")[0]; 
            let expRes = expectedResponsesNoFollowUp(personMsg.interactive, "mom", personMsg.id); 
            assert.strictEqual(expRes, personMsg.responses[0]); 

            const triggerMsg = textBank.filter(msg => msg.interactive == "TRIGGER")[0]; 
            expRes = expectedResponsesNoFollowUp(triggerMsg.interactive, "some location", triggerMsg.id); 
            assert.strictEqual(expRes, triggerMsg.responses[0]); 

            const goalMsg = textBank.filter(msg => msg.interactive == "GOAL")[0]; 
            expRes = expectedResponsesNoFollowUp(goalMsg.interactive, "some location", goalMsg.id); 
            assert.strictEqual(expRes, goalMsg.responses[0]); 

        }); 

    }); 

    describe('#expectedResponsesWithFollowUp', function() {
        this.timeout(0); 

        it("should be able to respond to YN patient follow up response", async function() {
            const phoneNum = "+17326667043"; 

            const locationMsg = textBank.filter(msg => msg.interactive == "LOCATION")[0]; 
            const hobbyMsg = textBank.filter(msg => msg.interactive == "HOBBY")[0]; 
            const topicMsg = textBank.filter(msg => msg.interactive == "TOPIC")[0]; 

            let expRes = await expectedResponsesWithFollowUp(phoneNum, locationMsg.interactive, "y", locationMsg.id); 
            assert.strictEqual(expRes, locationMsg.followUpResponses[0]); 

            expRes = await expectedResponsesWithFollowUp(phoneNum, hobbyMsg.interactive, "Yes", hobbyMsg.id); 
            assert.strictEqual(expRes, hobbyMsg.followUpResponses[0]); 

            expRes = await expectedResponsesWithFollowUp(phoneNum, topicMsg.interactive, "N", topicMsg.id); 
            assert.strictEqual(expRes, topicMsg.followUpResponses[1]); 

            expRes = await expectedResponsesWithFollowUp(phoneNum, topicMsg.interactive, "no", topicMsg.id); 
            assert.strictEqual(expRes, topicMsg.followUpResponses[1]); 

        }); 

        it("should be able to respond to the answer to the original question and schedule follow up cron job", async function() {
            const phoneNum = "+17326667043"; 

            const locationMsg = textBank.filter(msg => msg.interactive == "LOCATION")[0]; 
            const hobbyMsg = textBank.filter(msg => msg.interactive == "HOBBY")[0]; 
            const topicMsg = textBank.filter(msg => msg.interactive == "TOPIC")[0]; 

            // Response to patient's initial text 
            const locationRes = await expectedResponsesWithFollowUp(phoneNum, locationMsg.interactive, "home", locationMsg.id); 
            assert.strictEqual(locationRes, locationMsg.responses[0].replace("LOCATION", "home")); 

            const hobbyRes = await expectedResponsesWithFollowUp(phoneNum, hobbyMsg.interactive, "snowboard", hobbyMsg.id); 
            assert.strictEqual(hobbyRes, hobbyMsg.responses[0].replace("HOBBY", "snowboard")); 

            const topicRes = await expectedResponsesWithFollowUp(phoneNum, topicMsg.interactive, "some topic", topicMsg.id); 
            assert.strictEqual(topicRes, topicMsg.responses[0].replace("TOPIC", "some topic")); 

            // Cron Job for the follow up text 
            const manager = getFollowUpManager(); 
            console.log(`Follow Up Manager: ${manager.listCrons()}`);

            let jobExists = doesFollowUpJobExist(`expResFolUp-${phoneNum}-${locationMsg.id}`); 
            assert.strictEqual(jobExists, true); 
            jobExists = doesFollowUpJobExist(`expResFolUp-${phoneNum}-${hobbyMsg.id}`); 
            assert.strictEqual(jobExists, true); 
            jobExists = doesFollowUpJobExist(`expResFolUp-${phoneNum}-${topicMsg.id}`); 
            assert.strictEqual(jobExists, true); 

            // Follow up text should be correct 
            const locationFolUpMsg = getFolUpMessage(locationMsg.id, "LOCATION", "home"); 
            assert.strictEqual(locationFolUpMsg, textBank[locationMsg.id].followUpText.replace("LOCATION", "home")); 

            const hobbyFolUpMsg = getFolUpMessage(hobbyMsg.id, "HOBBY", "snowboard"); 
            assert.strictEqual(hobbyFolUpMsg, textBank[hobbyMsg.id].followUpText.replace("HOBBY", "snowboard")); 

            const topicFolUpMsg = getFolUpMessage(topicMsg.id, "TOPIC", "some topic"); 
            assert.strictEqual(topicFolUpMsg, textBank[topicMsg.id].followUpText.replace("TOPIC", "some topic")); 

        }); 

    }); 









    describe('#pickMedResponse', function() {

        it("should correctly pick a message based on cravings level", async function() {
            const phoneNum = "+17326667043"; 

            // Set cravings level to low 
            let pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
            pt.medicalData.textData.cravings = [{score: 1, date: new Date()}, {score: 2, date: new Date()}]; 
            await pt.save(); 

            // Message should be low risk 
            let msg = await pickMedResponse(phoneNum); 
            assert.strictEqual(msg.riskLevel, 1); 

            // Set cravings level to medium 
            pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
            pt.medicalData.textData.cravings = [{score: 3, date: new Date()}, {score: 4, date: new Date()}]; 
            await pt.save(); 

            // Message should be medium risk 
            msg = await pickMedResponse(phoneNum); 
            assert.strictEqual(msg.riskLevel, 2); 

            // Set cravings level to high 
            pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
            pt.medicalData.textData.cravings = [{score: 4, date: new Date()}, {score: 5, date: new Date()}]; 
            await pt.save(); 

            // Message should be high risk 
            msg = await pickMedResponse(phoneNum); 
            assert.strictEqual(msg.riskLevel, 3);

        }); 

        it("should correctly choose the second available risk level if needed", async function() {
            const phoneNum = "+17326667043"; 

            // Set cravings level to low 
            let pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
            pt.medicalData.textData.cravings = [{score: 1, date: new Date()}, {score: 2, date: new Date()}]; 
            await pt.save(); 

            // Message should be low risk 
            let msg = await pickMedResponse(phoneNum); 
            assert.strictEqual(msg.riskLevel, 1); 

            // Get all level one messages 
            const lvl1Msgs = textBank.filter(msg => msg.riskLevel == 1); 
            const lvl1MsgIDs = lvl1Msgs.map(msg => msg.id); 

            // Save them to patient sentMsgs 
            pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
            pt.medicalData.textData.sentMsgs = lvl1MsgIDs; 
            await pt.save(); 

            // Message should be medium risk 
            msg = await pickMedResponse(phoneNum); 
            console.log(`Message: ${msg}`); 
            assert.strictEqual(msg.riskLevel, 2); 

            // Get all level two messages 
            const lvl2Msgs = textBank.filter(msg => msg.riskLevel == 2); 
            const lvl2MsgIDs = lvl2Msgs.map(msg => msg.id); 

            // Save them to patient sentMsgs 
            pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
            pt.medicalData.textData.sentMsgs = pt.medicalData.textData.sentMsgs.concat(lvl2MsgIDs); 
            await pt.save(); 

            // Message should be high risk 
            msg = await pickMedResponse(phoneNum); 
            console.log(`Message: ${msg}`); 
            assert.strictEqual(msg.riskLevel, 3); 

        }); 
        
    }); 

    describe('#sendMedResponse', function() {

        it("should correctly queue up next message to send and update sentMsgs", async function() {
            const phoneNum = "+17326667043"; 

            // Pick any message 
            let msg = await pickMedResponse(phoneNum); 
            await sendMedResponse(phoneNum, msg); 

            // Check if text was correctly queued 
            // printQ(); 
            // console.log(lastQElem()); 
            let lastQMsg = lastQElem().msg; 
            assert.strictEqual(lastQMsg, msg.text); 

            // Check if sentMsgs were updated 
            const pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
            const lastMsgID = pt.medicalData.textData.sentMsgs.pop(); 
            assert.strictEqual(lastMsgID, msg.id); 

        }); 

        it("should update if service is expecting response if message is interactive", async function() {
            const phoneNum = "+17326667043"; 

            // Pick an uninteractive msg 
            const uninteractiveMsgs = textBank.filter(msg => !msg.interactive); 
            let msgIdx = Math.floor(Math.random() * uninteractiveMsgs.length); 
            let msg = uninteractiveMsgs[msgIdx]; 

            // Should expect -1 response msgID 
            await sendMedResponse(phoneNum, msg); 
            let expRes = await isExpectingResponse(phoneNum); 
            assert.strictEqual(expRes, -1); 

            // Pick an interactive msg 
            const interactiveMsg = textBank.filter(msg => msg.interactive); 
            msgIdx = Math.floor(Math.random() * interactiveMsg.length); 
            msg = interactiveMsg[msgIdx];

            // Should expect response to msgID 
            await sendMedResponse(phoneNum, msg); 
            expRes = await isExpectingResponse(phoneNum); 
            assert.strictEqual(expRes, msg.id); 

        }); 



    }); 

    describe('#getTextWithRiskLevel', function() {
        this.timeout(0); 

        before('reset sentMsgs for test patient', async function() {
            const phoneNum = "+17326667043"; 

            const pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
            pt.medicalData.textData.sentMsgs = []; 
            await pt.save(); 

        }); 

        it("should return a text from the correct risk category", async function() {
            const phoneNum = "+17326667043"; 
            const msg1 = await getTextWithRiskLevel(phoneNum, 1); 
            const msg2 = await getTextWithRiskLevel(phoneNum, 2); 
            const msg3 = await getTextWithRiskLevel(phoneNum, 3); 
            assert.strictEqual(msg1.riskLevel, 1); 
            assert.strictEqual(msg2.riskLevel, 2); 
            assert.strictEqual(msg3.riskLevel, 3); 

        }); 

        it("should return null if there are no more texts from that category", async function() {
            const phoneNum = "+17326667043"; 

            // Get all level one messages 
            const lvl1Msgs = textBank.filter(msg => msg.riskLevel == 1); 
            const lvl1MsgIDs = lvl1Msgs.map(msg => msg.id); 

            // Save them to patient sentMsgs 
            let pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
            pt.medicalData.textData.sentMsgs = lvl1MsgIDs; 
            await pt.save(); 

            // No more level 1 messages, but levels 2 and 3 should return a message 
            let msg1 = await getTextWithRiskLevel(phoneNum, 1); 
            let msg2 = await getTextWithRiskLevel(phoneNum, 2); 
            let msg3 = await getTextWithRiskLevel(phoneNum, 3); 

            assert.strictEqual(msg1, null); 
            assert.strictEqual(msg2.riskLevel, 2); 
            assert.strictEqual(msg3.riskLevel, 3); 

            
            // Get all level two messages 
            const lvl2Msgs = textBank.filter(msg => msg.riskLevel == 2); 
            const lvl2MsgIDs = lvl2Msgs.map(msg => msg.id); 

            // Save them to patient sentMsgs 
            pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
            pt.medicalData.textData.sentMsgs = pt.medicalData.textData.sentMsgs.concat(lvl2MsgIDs); 
            await pt.save(); 


            // No more level 1 and 2 messages, but level 3 should return a message 
            msg1 = await getTextWithRiskLevel(phoneNum, 1); 
            msg2 = await getTextWithRiskLevel(phoneNum, 2); 
            msg3 = await getTextWithRiskLevel(phoneNum, 3); 

            assert.strictEqual(msg1, null); 
            assert.strictEqual(msg2, null); 
            assert.strictEqual(msg3.riskLevel, 3); 

            
            // Get all level three messages 
            const lvl3Msgs = textBank.filter(msg => msg.riskLevel == 3); 
            const lvl3MsgIDs = lvl3Msgs.map(msg => msg.id); 

            // Save them to patient sentMsgs 
            pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
            pt.medicalData.textData.sentMsgs = pt.medicalData.textData.sentMsgs.concat(lvl3MsgIDs); 
            await pt.save(); 


            // No more level 1 and 2 messages, but level 3 should return a message 
            msg1 = await getTextWithRiskLevel(phoneNum, 1); 
            msg2 = await getTextWithRiskLevel(phoneNum, 2); 
            msg3 = await getTextWithRiskLevel(phoneNum, 3); 

            assert.strictEqual(msg1, null); 
            assert.strictEqual(msg2, null); 
            assert.strictEqual(msg3, null); 

        }); 


    }); 

    describe('#parseNAME', function() {
        it("should replace the text NAME with the emergency contact of the patient if the text has NAME", async function() {
            const msg1 = "Your cravings have been high lately. Try reaching out to NAME to get some help."; 
            const msg2 = "Have you tried talking to NAME?"; 
            const msg3 = "Try out HOBBY; you'll feel a lot better. "; 

            const res1 = await parseNAME("+17326667043", msg1)
            const res2 = await parseNAME("+17326667043", msg2)
            const res3 = await parseNAME("+17326667043", msg3)

            assert.strictEqual(res1, "Your cravings have been high lately. Try reaching out to Mom (phone number) to get some help."); 
            assert.strictEqual(res2, "Have you tried talking to Mom (phone number)?"); 
            assert.strictEqual(res3, "Try out HOBBY; you'll feel a lot better. "); 
        }); 

    }); 






}); 

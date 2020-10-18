const { getPtJobsManager, 
        doesJobExist, 
        scheduleReminders, 
        scheduleFollowUps, 
        scheduleFinalFollowUps, 
        resetDaily } = require('../src/patientJobs'); 
const assert = require('assert'); 

describe('patientJobs', function() {


    describe('#scheduleReminders', function() {
        it("should schedule cron job to send a reminder at the correct time", async function() {

            const phoneNum = "+17326667043"; 
            const pt = await Patient.findOne({ 'personalData.phone': phoneNum })
                .catch(err => console.log(err));
            
            // Schedule a reminder based on patient data 
            const remTime = pt.medicalData.textData.medReminderTime[0]; 
            const remHour = remTime.hour; 
            const remMin = remTime.minute; 
            scheduleReminders(phoneNum, remHour, remMin); 

            // Two ways to verify if the job exists 
            const key = `${phoneNum}-medRemJob`; 
            assert.strictEqual(doesJobExist(key), true); 

            const manager = getPtJobsManager(); 
            assert.strictEqual(manager.exists(key), true); 

        }); 
    }); 

    describe('#scheduleFollowUps', function() {
        it("should schedule cron job to send a follow up at the correct time", async function() {

            const phoneNum = "+17326667043"; 
            const pt = await Patient.findOne({ 'personalData.phone': phoneNum })
                .catch(err => console.log(err));
            
            // Schedule a follow up based on patient data 
            const followTime = pt.medicalData.textData.followUpTime; 
            const followHour = followTime.hour; 
            const followMin = followTime.minute; 
            scheduleFollowUps(phoneNum, followHour, followMin); 

            // Two ways to verify if the job exists 
            const key = `${phoneNum}-folRemJob`; 
            assert.strictEqual(doesJobExist(key), true); 

            const manager = getPtJobsManager(); 
            assert.strictEqual(manager.exists(key), true); 

        }); 
    }); 

    describe('#scheduleFinalFollowUps', function() {
        it("should schedule cron job to send a final follow up at the correct time", async function() {

            const phoneNum = "+17326667043"; 
            const pt = await Patient.findOne({ 'personalData.phone': phoneNum })
                .catch(err => console.log(err));
            
            // Schedule a follow up based on patient data 
            const finalTime = pt.medicalData.textData.finalReminderTime; 
            const finalHour = finalTime.hour; 
            const finalMin = finalTime.minute; 
            scheduleFinalFollowUps(phoneNum, finalHour, finalMin); 

            // Two ways to verify if the job exists 
            const key = `${phoneNum}-finalRemJob`; 
            assert.strictEqual(doesJobExist(key), true); 

            const manager = getPtJobsManager(); 
            assert.strictEqual(manager.exists(key), true); 

        }); 
    }); 

    describe('#resetDaily', function() {
        it("should schedule cron job to reset if patient took medications daily", async function() {
            const phoneNum = "+17326667043"; 
            resetDaily(phoneNum); 

            // Two ways to verify if the job exists 
            const key = `${phoneNum}-dailyReset`; 
            assert.strictEqual(doesJobExist(key), true); 

            const manager = getPtJobsManager(); 
            assert.strictEqual(manager.exists(key), true); 


        }); 

    }); 





}); 
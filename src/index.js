const CronJobManager = require('cron-job-manager'); 
const { sendText, dQ, isQEmpty } = require('./outbound');


// Startup sequence 
//      Schedule redundancy checks 
//      Check if there were any previous cron jobs that should have been scheduled 
//      Schedule cron job to verify that other cron jobs are active 

// IMPLEMENT: 
function main() {

    scheduleMsgSender(); 




}

/*
 * Start a cron job that checks the message queue every two seconds 
 */ 
function scheduleMsgSender() {

    const sendMsgManager = new CronJobManager() 
    sendMsgManager.add('sendMsgManager', '*/2 * * * * *', () => {
        // console.log("running send message cron job. "); 
        
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

}


module.exports = { main }
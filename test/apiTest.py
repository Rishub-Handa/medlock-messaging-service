import requests 


url = "http://localhost:5000/api/registerPt" 
data = {"name": "Rishub Handa", "phoneNum": "+17326667043", "reminderTimes": "10:00", "followUpTime": "18:00", "finalReminderTime": "20:00", "emergencyContact": "Mom (phone number)"} 
requests.post(url, data) 

url = "http://localhost:5000/api/beginStudy"
data = {"phoneNum": "+17326667043"}
requests.post(url, data) 

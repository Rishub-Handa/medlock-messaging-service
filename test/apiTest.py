import requests 

# Rishub 
url = "http://li641-251.members.linode.com:5000/api/registerPt" 
data = {"name": "Rishub Handa", "phoneNum": "+17326667043", "reminderTimes": "10:00", "followUpTime": "18:00", "finalReminderTime": "20:00", "emergencyContact": "Mom (phone number)"} 
requests.post(url, data) 

url = "http://li641-251.members.linode.com:5000/api/beginStudy"
data = {"phoneNum": "+17326667043"}
requests.post(url, data) 

# Aditya 
url = "http://li641-251.members.linode.com:5000/api/registerPt" 
data = {"name": "Aditya Narayan", "phoneNum": "+17039159597", "reminderTimes": "10:00", "followUpTime": "18:00", "finalReminderTime": "20:00", "emergencyContact": "Mom (phone number)"} 
requests.post(url, data) 

url = "http://li641-251.members.linode.com:5000/api/beginStudy"
data = {"phoneNum": "+17039159597"}
requests.post(url, data) 

# Anthony Schiller 
url = "http://li641-251.members.linode.com:5000/api/registerPt" 
data = {"name": "Anthony Schiller", "phoneNum": "+16165025018", "reminderTimes": "09:30", "followUpTime": "18:00", "finalReminderTime": "21:00", "emergencyContact": "Brooke"} 
requests.post(url, data) 

url = "http://li641-251.members.linode.com:5000/api/beginStudy"
data = {"phoneNum": "+16165025018"}
requests.post(url, data) 

# Stephanie Webb 
url = "http://li641-251.members.linode.com:5000/api/registerPt" 
data = {"name": "Stephanie Webb", "phoneNum": "+12317947428", "reminderTimes": "08:00", "followUpTime": "18:00", "finalReminderTime": "21:00", "emergencyContact": "Courtney"} 
requests.post(url, data) 

url = "http://li641-251.members.linode.com:5000/api/beginStudy"
data = {"phoneNum": "+12317947428"}
requests.post(url, data) 

# Sean Williams
url = "http://li641-251.members.linode.com:5000/api/registerPt" 
data = {"name": "Sean Williams", "phoneNum": "+16168896176", "reminderTimes": "09:00", "followUpTime": "18:00", "finalReminderTime": "21:00", "emergencyContact": "Susie"} 
requests.post(url, data) 

url = "http://li641-251.members.linode.com:5000/api/beginStudy"
data = {"phoneNum": "+16168896176"}
requests.post(url, data) 

# Richard Martin 
url = "http://li641-251.members.linode.com:5000/api/registerPt" 
data = {"name": "Richard Martin", "phoneNum": "+16162980230", "reminderTimes": "06:00", "followUpTime": "18:00", "finalReminderTime": "21:00", "emergencyContact": "Jeff"} 
requests.post(url, data) 

url = "http://li641-251.members.linode.com:5000/api/beginStudy"
data = {"phoneNum": "+16162980230"}
requests.post(url, data) 

# John Gaitan 
url = "http://li641-251.members.linode.com:5000/api/registerPt" 
data = {"name": "John Gaitan", "phoneNum": "+16164035363", "reminderTimes": "08:00", "followUpTime": "18:00", "finalReminderTime": "21:00", "emergencyContact": "your Wife"} 
requests.post(url, data) 

url = "http://li641-251.members.linode.com:5000/api/beginStudy"
data = {"phoneNum": "+16164035363"}
requests.post(url, data) 







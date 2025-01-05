import json

with open('gameRecordsDataAnon.json', 'r') as f:
    json_data = f.readline()

# print(json_data[0:4])

json_data = json.loads(json_data)

print(json_data[0])
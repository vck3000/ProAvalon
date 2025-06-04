import json
# from pprint import pprint

with open('gameRecordsDataAnon_orig.json', 'r') as f:
    json_data: str = f.readline()

# fix the json
json_data = json_data.replace('][][', ', ')  # fix
json_data = json_data.replace('][', ', ')  # fix

json_data = json.loads(json_data)

print('complete cleaning!')
# pprint(json_data)

with open('gameRecordsDataAnon.json', 'w') as f:
    f.write(json.dumps(json_data))

import json
import pandas as pd
# from pprint import pprint

# read the file
with open('gameRecordsDataAnon_orig.json', 'r') as f:
    json_data: str = f.readline()

# fix the json
json_data = json_data.replace('][][', ', ')  # fix
json_data = json_data.replace('][', ', ')  # fix

json_data = json.loads(json_data)

print('complete cleaning!')
print('==========')
# pprint(json_data)

with open('gameRecordsDataAnon.json', 'w') as f:
    f.write(str(json_data))

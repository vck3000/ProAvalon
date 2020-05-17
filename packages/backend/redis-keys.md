# Simple file to keep loose track of the redis keys used:

Type:           Key:                            Value:
String          user:<username>                 <socket id>
Sorted Set      onlineplayers                   <displayUsernames>[]

List            games:open                      <game numbers open>[]
String          games:nextNum                   <next game number>

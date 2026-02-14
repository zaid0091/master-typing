import urllib.request
import json

data = json.dumps({'username': 'zaid', 'password': 'test123'}).encode()
req = urllib.request.Request(
    'https://zaid00987.pythonanywhere.com/api/auth/login/',
    data=data,
    headers={'Content-Type': 'application/json'},
    method='POST'
)
try:
    with urllib.request.urlopen(req) as resp:
        print(resp.status, resp.read().decode())
except urllib.error.HTTPError as e:
    print(e.code, e.read().decode())

import requests
import json

response = requests.get("http://localhost:4040/api/tunnels")
data = response.json()

ngrokURLs = {}
msg = ''
for tunnel in data['tunnels']:
  ngrokURLs[tunnel['name']] = tunnel['public_url']

print(json.dumps(ngrokURLs, indent=4))
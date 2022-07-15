import requests
from os import path

def getURLDict() -> dict[str, str]:
  """
  Returns a dictionary containing the ngrok URLs that are forwarding 
  requests to localhost ports.
  """
  response = requests.get("http://localhost:4040/api/tunnels")
  data = response.json()

  ngrokURLs = {}
  for tunnel in data['tunnels']:
    ngrokURLs[tunnel['name']] = tunnel['public_url']

  return ngrokURLs

def addURLsToEnv(ngrokURLs: dict[str, str], envPath: str, prefix: str): 
  """
  Adds the given ngrokURLs to packages/webapp/.env
  """
  readEnv = open(envPath, 'r')
  lines = readEnv.readlines()
  keysAddedToEnv = []

  for i in range(0, len(lines)):
    for key in ngrokURLs: 
      if key not in keysAddedToEnv and lines[i].startswith(prefix + key.upper()):
        lines[i] = prefix + key.upper() + '=' + ngrokURLs[key] + '\n'
        keysAddedToEnv.append(key)
  
  readEnv.close()
  
  writeEnv = open(envPath, 'w')
  writeEnv.writelines(lines)
  writeEnv.close()

  appendEnv = open(envPath, 'a')

  if not lines[-1].endswith('\n'):
    appendEnv.write('\n')

  for key in ngrokURLs:
    if key not in keysAddedToEnv:
      appendEnv.write(prefix + key.upper() + '=' + ngrokURLs[key])
      appendEnv.write('\n')
  
  appendEnv.close()
  

if __name__ == '__main__':
  ngrokURLs = getURLDict()

  basepath = path.dirname(__file__)
  webappEnvPath = path.abspath(path.join(basepath, '..', "packages/webapp/.env"))
  apiEnvPath = path.abspath(path.join(basepath, '..', "packages/api/.env"))

  addURLsToEnv(ngrokURLs, webappEnvPath, 'VITE_NGROK_')
  addURLsToEnv(ngrokURLs, apiEnvPath, 'NGROK_')

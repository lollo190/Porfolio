import urllib.request
import re

url = 'https://free-game.virgilabloh.com/css/style.css'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    css = resp.read().decode('utf-8', errors='ignore')

for var in re.findall(r'--[a-zA-Z0-9_-]+\s*:[^;]+;', css):
    if 'toc' in var:
        print(var)

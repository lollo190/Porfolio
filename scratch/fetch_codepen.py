import urllib.request
import json
import re

url = 'https://codepen.io/ooblek/pen/vYxYomx'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        with open('scratch/codepen_raw.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print('Saved scratch/codepen_raw.html, length:', len(content))
except Exception as e:
    print('Error:', e)

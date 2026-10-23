import re
import html

with open('scratch/codepen_embed.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract pre 0 and pre 1
pres = re.findall(r'<pre[^>]*>(.*?)</pre>', text, re.DOTALL)

for i, p in enumerate(pres):
    # remove all html tags
    clean = re.sub(r'<[^>]+>', '', p)
    clean = html.unescape(clean)
    print(f"==================== SECTION {i} ====================")
    print(clean)

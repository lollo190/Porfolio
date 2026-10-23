import re
import json

with open('scratch/codepen_page.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's search for "css":"..." or similar JSON patterns
# In CodePen, the editor state or pen object has css, html, js
# Let's find matches
print("Page length:", len(text))

# Let's search for SVG filters or noise or canvas or film-grain in text
keywords = ['grain', 'noise', 'feTurbulence', 'film', 'ooblek']
for kw in keywords:
    matches = [m.start() for m in re.finditer(kw, text, re.IGNORECASE)]
    print(f"Keyword '{kw}': {len(matches)} occurrences")

# Find snippets around matches of feTurbulence or grain
for m in re.finditer(r'(?:grain|feTurbulence|ooblek)', text, re.IGNORECASE):
    idx = m.start()
    snippet = text[max(0, idx - 100):min(len(text), idx + 200)]
    print("--- SNIPPET ---")
    print(snippet.replace('\n', ' '))
    break

# Let's search for pen code blocks in the HTML
matches = re.findall(r'"(css|html|js)":"([^"]+)"', text)
for k, v in matches:
    try:
        decoded = v.encode().decode('unicode-escape')
        if len(decoded) > 30 and ('grain' in decoded.lower() or 'body' in decoded.lower() or 'filter' in decoded.lower() or 'canvas' in decoded.lower()):
            print(f"=== DECODED {k.upper()} ===")
            print(decoded)
    except Exception:
        pass

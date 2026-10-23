import re

with open('scratch/codepen_embed.html', 'r', encoding='utf-8') as f:
    text = f.read()

print("File length:", len(text))

# Search for pre tags
pres = re.findall(r'<pre[^>]*>(.*?)</pre>', text, re.DOTALL)
print(f"Found {len(pres)} pre tags")
for i, p in enumerate(pres):
    print(f"--- PRE {i} ---")
    print(p[:500])

# Search for URLs or iframes
iframes = re.findall(r'<iframe[^>]*src=["\']([^"\']+)["\']', text)
print("Iframes:", iframes)

# Search for code elements
codes = re.findall(r'<code[^>]*>(.*?)</code>', text, re.DOTALL)
print(f"Found {len(codes)} code elements")
for i, c in enumerate(codes):
    print(f"--- CODE {i} ---")
    print(c[:500])

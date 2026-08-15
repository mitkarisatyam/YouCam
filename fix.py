import os
files = ['app/hair-studio/page.tsx', 'app/shopping-assistant/page.tsx', 'app/test-look/page.tsx']
for f in files:
    content = open(f, 'r', encoding='utf-8').read()
    content = content.replace('\\`', '`')
    open(f, 'w', encoding='utf-8').write(content)

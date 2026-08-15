import os

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content.replace('\\`', '`').replace('\\${', '${')
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed {filepath}")
    except Exception as e:
        pass

for root, dirs, files in os.walk('app'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            fix_file(os.path.join(root, file))

for root, dirs, files in os.walk('components'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            fix_file(os.path.join(root, file))

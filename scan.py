import os, re
pattern = re.compile(r'(?:table|from_)\([\'\"]([a-zA-Z0-9_\-]+)[\'\"]')
pattern2 = re.compile(r'\.from\([\'\"]([a-zA-Z0-9_\-]+)[\'\"]')
found = set()
for root, _, files in os.walk('.'):
    # ignore .agent, .git, node_modules, etc.
    if '.git' in root or 'node_modules' in root or '.venv' in root or 'dist' in root or '.next' in root:
        continue
    for f in files:
        if f.endswith('.py') or f.endswith('.tsx') or f.endswith('.ts'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
                matches = pattern.findall(content)
                matches2 = pattern2.findall(content)
                for m in matches + matches2:
                    found.add(f'{m} (in {f})')
                    
print("--- ALL EXTRACTED TABLES ---")
for i in sorted(list(found)):
    print(i)

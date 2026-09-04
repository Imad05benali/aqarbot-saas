import sys

filepath = 'app/api/endpoints/whatsapp.py'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
target_indent = "                    " # 20 spaces
replacement = "                " # 16 spaces

dedent_active = False

for i, line in enumerate(lines):
    if line.startswith(target_indent + 'if "messages" in value and value["messages"]:') and not dedent_active:
        dedent_active = True
        
    if dedent_active:
        # Dedent by 4 spaces
        if line.startswith(target_indent):
            new_lines.append(line.replace(target_indent, replacement, 1))
        elif line.startswith('                        '):
            new_lines.append(line.replace('                        ', '                    ', 1))
        elif line.startswith('                            '):
            new_lines.append(line.replace('                            ', '                        ', 1))
        elif line.startswith('                                '):
            new_lines.append(line.replace('                                ', '                            ', 1))
        elif line.strip() == '':
            new_lines.append(line)
        else:
            if line.startswith('        logger.info'):
                dedent_active = False
            
            if dedent_active:
                # Blindly remove 4 spaces for anything else that is deeply indented
                if line.startswith('    '):
                    new_lines.append(line[4:])
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)
    else:
        new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

import re

with open('backend/src/main.rs', 'r') as f:
    content = f.read()

if 'mod plugin;' not in content:
    content = content.replace('mod benchmark;', 'mod benchmark;\nmod plugin;')

with open('backend/src/main.rs', 'w') as f:
    f.write(content)

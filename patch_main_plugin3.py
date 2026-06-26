with open('backend/src/main.rs', 'r') as f:
    content = f.read()

content = content.replace('mod spatial;', 'mod spatial;\nmod plugin;')

with open('backend/src/main.rs', 'w') as f:
    f.write(content)

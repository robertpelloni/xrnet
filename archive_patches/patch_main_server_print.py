import re

with open('backend/src/main.rs', 'r') as f:
    content = f.read()

content = content.replace(
    'println!("Server running on http://localhost:3000");',
    'println!("[API] Server listening on http://0.0.0.0:3000");'
)

with open('backend/src/main.rs', 'w') as f:
    f.write(content)

import re

with open('backend/src/api/plugin.rs', 'r') as f:
    content = f.read()

content = content.replace(
    'extract::{Json, State},',
    'extract::Json,'
)

with open('backend/src/api/plugin.rs', 'w') as f:
    f.write(content)

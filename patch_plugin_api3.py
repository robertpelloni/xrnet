import re

with open('backend/src/api/plugin.rs', 'r') as f:
    content = f.read()

content = content.replace(
    'extract::{Json, Path, State},',
    'extract::{Json, Path},'
)

with open('backend/src/api/plugin.rs', 'w') as f:
    f.write(content)

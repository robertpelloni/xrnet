import re

with open('frontend/src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<SocialMatchPanel />',
    '<SocialMatchPanel />\n        <PluginPanel />'
)

with open('frontend/src/App.tsx', 'w') as f:
    f.write(content)

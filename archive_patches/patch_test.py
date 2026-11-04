import re

with open('tests/e2e_integration.py', 'r') as f:
    content = f.read()

content = content.replace('8080', '3000')

with open('tests/e2e_integration.py', 'w') as f:
    f.write(content)

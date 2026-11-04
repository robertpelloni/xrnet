import re

with open('tests/e2e_integration.py', 'r') as f:
    content = f.read()

content = content.replace(
    'response = requests.post("http://127.0.0.1:3000/api/system/protocol", timeout=60)',
    'response = requests.post("http://127.0.0.1:3000/api/system/protocol", json={}, timeout=60)'
)

with open('tests/e2e_integration.py', 'w') as f:
    f.write(content)

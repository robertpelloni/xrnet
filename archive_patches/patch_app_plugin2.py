import re

with open('frontend/src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "<SpatialAIPanel />\n        <PluginPanel />",
    "<SpatialAIPanel />\n        <PluginPanel />\n"
)

# wait the replace might have failed because I didn't match it correctly
# let's look at the file

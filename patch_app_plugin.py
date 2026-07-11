import re

with open('frontend/src/App.tsx', 'r') as f:
    content = f.read()

if 'import { PluginPanel } from \'./components/PluginPanel\';' not in content:
    content = content.replace(
        "import { SocialMatchPanel } from './components/SocialMatchPanel'",
        "import { SocialMatchPanel } from './components/SocialMatchPanel'\nimport { PluginPanel } from './components/PluginPanel'"
    )
    content = content.replace(
        "<SpatialAIPanel />",
        "<SpatialAIPanel />\n        <PluginPanel />"
    )

with open('frontend/src/App.tsx', 'w') as f:
    f.write(content)

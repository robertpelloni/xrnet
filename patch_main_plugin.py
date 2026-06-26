import re

with open('backend/src/main.rs', 'r') as f:
    content = f.read()

if 'pub mod plugin;' not in content:
    content = content.replace('pub mod benchmark;', 'pub mod benchmark;\npub mod plugin;')

if 'pub plugin_manager: Arc<Mutex<plugin::PluginManager>>,' not in content:
    content = re.sub(
        r'pub spatial_manager: Arc<Mutex<spatial::SpatialManager>>,\n}',
        r'pub spatial_manager: Arc<Mutex<spatial::SpatialManager>>,\n    pub plugin_manager: Arc<Mutex<plugin::PluginManager>>,\n}',
        content
    )

if 'plugin_manager: Arc::new(Mutex::new(plugin::PluginManager::new())),' not in content:
    content = re.sub(
        r'spatial_manager: Arc::new\(Mutex::new\(spatial::SpatialManager::new\(\)\)\),\n\s*}\);',
        r'spatial_manager: Arc::new(Mutex::new(spatial::SpatialManager::new())),\n        plugin_manager: Arc::new(Mutex::new(plugin::PluginManager::new())),\n    });',
        content
    )

with open('backend/src/main.rs', 'w') as f:
    f.write(content)

with open('backend/src/api/mod.rs', 'r') as f:
    content = f.read()

if 'mod plugin;' not in content:
    content = content.replace('mod spatial;', 'mod spatial;\nmod plugin;')

if '.merge(plugin::routes(Arc::clone(&state)))' not in content:
    content = content.replace('.merge(spatial::routes(Arc::clone(&state)))', '.merge(spatial::routes(Arc::clone(&state)))\n        .merge(plugin::routes(Arc::clone(&state)))')

with open('backend/src/api/mod.rs', 'w') as f:
    f.write(content)

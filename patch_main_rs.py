import re

with open('backend/src/main.rs', 'r') as f:
    content = f.read()

content = content.replace(
    '.layer(Extension(state)).into_make_service_with_connect_info::<std::net::SocketAddr>();',
    '.layer(Extension(state)).into_make_service();'
)

with open('backend/src/main.rs', 'w') as f:
    f.write(content)

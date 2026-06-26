import re

with open('backend/src/main.rs', 'r') as f:
    content = f.read()

content = content.replace(
    '.layer(Extension(state));',
    '.layer(Extension(state))\n        .into_make_service_with_connect_info::<std::net::SocketAddr>();'
)

content = content.replace(
    'axum::serve(listener, app).await.unwrap();',
    'axum::serve(listener, app).await.unwrap();'
)

with open('backend/src/main.rs', 'w') as f:
    f.write(content)

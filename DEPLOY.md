# DEPLOY: xrnet Deployment & Setup

## Development Environment
- **Platform:** Aiming for cross-platform support with a focus on AR/XR hardware compatibility.
- **Core Stack:** (Proposed) Rust for core protocol logic, TypeScript/React for UI, Python/C++ for spatial AI components.

## Setup Instructions
1. Clone the repository recursively: `git clone --recursive https://github.com/robertpelloni/xrnet`
2. Initialize submodules: `git submodule update --init --recursive`
3. Install dependencies: (Pending tech stack finalization)

## Building and Running
- **Build all components:**
  ```bash
  ./build.sh
  ```
- **Start the application:**
  ```bash
  ./start.sh
  ```

## Testing
- **Run E2E tests:**
  ```bash
  python3 tests/e2e_integration.py
  ```
- **Validate repository integrity:**
  ```bash
  python3 scripts/validate_integrity.py
  ```

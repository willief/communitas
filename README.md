# Communitas - Decentralized P2P Collaboration Platform

*Empowering Private, Decentralised Collaboration*

Communitas rethinks online collaboration from the ground up. It combines messaging, voice and video calling, screen sharing and collaborative file storage into a single desktop application. Instead of relying on corporate servers, every connection is peer-to-peer and every identity is human-readable. With Communitas you chat, call and work together without surrendering your data to a third party. It's the privacy-first alternative to WhatsApp, Slack and Dropbox.

## 🌟 Key Features

### Human-Friendly Addresses
At the heart of Communitas is a four-word identity system. Each user, organisation or project is identified by a unique combination of four words—such as `ocean-forest-mountain-river`—that map to a secure record in a distributed hash table. No more cryptic hashes or email-style usernames: sharing your address is as easy as sharing a memorable phrase.

### Your Data, Your Control
Communitas stores your files in a two-stage backup system:
- **Local shards**: Data is split and distributed among your friends or colleagues
- **Network storage**: Shards are published to the Saorsa network's decentralized storage using trust-weighted DHT and erasure coding

Everything is encrypted end-to-end, and only you and your chosen collaborators can decrypt it.

### Markdown-Powered Web
Every storage container has a built-in web directory with Markdown files. Write your project plan in `home.md`, add images or videos, and publish it under your four-word address. Others can link to your pages using the same simple four-word format. It's a return to a text-first internet, free from ads and trackers.

### Secure Communication
- **Messaging Layer Security** with post-quantum keys
- **Voice and video calls** over modern QUIC streams
- **Screen sharing and file transfers** built-in
- **End-to-end encryption** for all communications

## 🚀 Quick Start - Local Development

### Prerequisites
- Rust 1.85+ with Tauri CLI
- Node.js 18+ with npm
- Docker (optional, for containerized bootstrap)

### 1. Clone and Setup
```bash
git clone https://github.com/dirvine/communitas.git
cd communitas
npm install
```

### 2. Start Local Bootstrap Node
```bash
# Option A: Using Docker (Recommended)
docker run -d \
  --name communitas-bootstrap \
  -p 9001:9001 \
  -p 9100:9100 \
  -p 9110:9110 \
  -p 9120:9120 \
  saorsa/bootstrap-node:latest

# Option B: Using local Rust bootstrap (if available)
cargo run --bin bootstrap-node -- --port 9001
```

### 3. Configure Environment
```bash
# Set local bootstrap address
export COMMUNITAS_LOCAL_BOOTSTRAP="127.0.0.1:9001"

# Optional: Set local data directory
export COMMUNITAS_DATA_DIR="./communitas-test-data"
```

### 4. Run the Application
```bash
# Development mode
npm run tauri dev

# Or build and run
npm run tauri build
npm run tauri dev
```

## 🏗️ Setting Up a Local Testnet

### Architecture Overview
```
┌─────────────────┐    ┌─────────────────┐
│   Bootstrap     │────│     Node 1      │
│   Node (Port    │    │   (Port 9002)   │
│    9001)        │    └─────────────────┘
└─────────────────┘             │
         │                     │
         │                     │
         │              ┌─────────────────┐
         └──────────────│     Node 2      │
                        │   (Port 9003)   │
                        └─────────────────┘
```

### Bootstrap Node Setup

#### Option 1: Docker Container
```bash
# Build bootstrap image
docker build -f Dockerfile.bootstrap -t communitas-bootstrap .

# Run bootstrap node
docker run -d \
  --name communitas-bootstrap \
  -p 9001:9001 \
  -p 9100:9100 \
  -p 9110:9110 \
  -p 9120:9120 \
  -e RUST_LOG=info \
  communitas-bootstrap
```

#### Option 2: Local Bootstrap Node
```rust
// Create a simple bootstrap node
use std::net::SocketAddr;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "127.0.0.1:9001".parse::<SocketAddr>()?;
    let listener = TcpListener::bind(addr).await?;

    println!("Bootstrap node listening on {}", addr);

    loop {
        let (socket, peer_addr) = listener.accept().await?;
        println!("New connection from {}", peer_addr);

        // Handle P2P handshake
        tokio::spawn(async move {
            // Implement basic P2P protocol handling
            handle_peer_connection(socket).await;
        });
    }
}
```

### Multiple Node Setup

#### Node 1 Configuration
```bash
# Terminal 1
export COMMUNITAS_LOCAL_BOOTSTRAP="127.0.0.1:9001"
export COMMUNITAS_P2P_PORT="9002"
export COMMUNITAS_DATA_DIR="./node1-data"

npm run tauri dev
```

#### Node 2 Configuration
```bash
# Terminal 2
export COMMUNITAS_LOCAL_BOOTSTRAP="127.0.0.1:9001"
export COMMUNITAS_P2P_PORT="9003"
export COMMUNITAS_DATA_DIR="./node2-data"

npm run tauri dev
```

#### Node 3 Configuration
```bash
# Terminal 3
export COMMUNITAS_LOCAL_BOOTSTRAP="127.0.0.1:9001"
export COMMUNITAS_P2P_PORT="9004"
export COMMUNITAS_DATA_DIR="./node3-data"

npm run tauri dev
```

## 🏛️ System Architecture

### Core Components
Communitas is built on the Saorsa ecosystem with the following key components:

- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Rust with Tauri v2 for cross-platform desktop app
- **P2P Network**: Saorsa Core with trust-weighted Kademlia DHT
- **Cryptography**: Post-quantum cryptography (ML-KEM/ML-DSA)
- **Storage**: Content-addressed storage with Reed-Solomon erasure coding
- **Communication**: QUIC transport with PQC channel binding

### Entity Types
Communitas treats entities as first-class citizens:
- **Individuals**: Single users with personal identity and storage
- **Organisations**: Groupings of individuals with hierarchical structure
- **Groups**: Small sets of identities (friends, colleagues)
- **Channels**: Topic-based spaces within organisations
- **Projects**: Containers for specific work items

### Storage System
- **Two-stage backup**: Local shards + network DHT storage
- **Policy-based encryption**: Different security levels per use case
- **Content addressing**: BLAKE3 hashing with optimal chunking
- **Erasure coding**: Reed-Solomon FEC for data durability

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `COMMUNITAS_LOCAL_BOOTSTRAP` | Bootstrap node address | Production bootstrap |
| `COMMUNITAS_P2P_PORT` | P2P listening port | Auto-assigned |
| `COMMUNITAS_DATA_DIR` | Data storage directory | `./communitas-data` |
| `RUST_LOG` | Logging level | `info` |
| `COMMUNITAS_TESTNET` | Enable testnet mode | `false` |

## 🧪 Testing the Testnet

### 1. Health Check
```bash
curl http://localhost:1420/health
```

### 2. Network Status
```bash
# Check peer connections
curl http://localhost:1420/api/network/status
```

### 3. Create Test Data
```bash
# Create a test organization
curl -X POST http://localhost:1420/api/organizations \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Organization", "description": "Local testnet org"}'
```

### 4. Verify P2P Connectivity
```bash
# Check if nodes can discover each other
curl http://localhost:1420/api/network/peers
```

## 🐳 Docker Compose Setup

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  bootstrap:
    build:
      context: .
      dockerfile: Dockerfile.bootstrap
    ports:
      - "9001:9001"
      - "9100:9100"
      - "9110:9110"
      - "9120:9120"
    environment:
      - RUST_LOG=info

  node1:
    build: .
    depends_on:
      - bootstrap
    environment:
      - COMMUNITAS_LOCAL_BOOTSTRAP=bootstrap:9001
      - COMMUNITAS_P2P_PORT=9002
      - COMMUNITAS_DATA_DIR=/app/node1-data
    volumes:
      - ./node1-data:/app/node1-data

  node2:
    build: .
    depends_on:
      - bootstrap
    environment:
      - COMMUNITAS_LOCAL_BOOTSTRAP=bootstrap:9001
      - COMMUNITAS_P2P_PORT=9003
      - COMMUNITAS_DATA_DIR=/app/node2-data
    volumes:
      - ./node2-data:/app/node2-data
```

Run with:
```bash
docker-compose up -d
```

## 🔍 Monitoring & Debugging

### Logs
```bash
# View application logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f bootstrap
```

### Network Inspection
```bash
# Check container networking
docker network ls
docker inspect communitas_default

# Test connectivity between containers
docker exec communitas_node1 curl http://bootstrap:9001/health
```

### Performance Monitoring
```bash
# Monitor resource usage
docker stats

# Check health endpoints
curl http://localhost:1420/health
curl http://localhost:1421/health  # Node 2
curl http://localhost:1422/health  # Node 3
```

## 🛠️ Troubleshooting

### Common Issues

#### Bootstrap Node Not Starting
```bash
# Check bootstrap logs
docker-compose logs bootstrap

# Verify port binding
netstat -tlnp | grep 9001
```

#### Nodes Can't Connect
```bash
# Check network connectivity
docker exec communitas_node1 ping bootstrap

# Verify environment variables
docker exec communitas_node1 env | grep COMMUNITAS
```

#### Port Conflicts
```bash
# Find conflicting processes
lsof -i :9001

# Kill conflicting process
kill $(lsof -t -i :9001)
```

### Debug Mode
```bash
# Enable debug logging
export RUST_LOG=debug,communitas=trace,saorsa_core=debug

# Run with debug symbols
npm run tauri dev -- --debug
```

## 📊 Testnet Metrics

Monitor these key metrics:
- **Peer Count**: Number of connected nodes
- **Message Latency**: Average message delivery time
- **Storage Operations**: DHT put/get success rates
- **Network Health**: Connection stability and uptime

## 🗺️ Roadmap & Future Features

### Current Status
- ✅ Basic Tauri application structure
- ✅ React frontend with TypeScript
- ✅ Rust backend integration
- ✅ Development environment setup
- 🚧 Core UI component library
- 📅 User authentication system
- 📅 Real-time messaging
- 📅 File sharing capabilities

### Upcoming Features
- **Real-time Collaboration**: Yjs CRDTs for collaborative editing
- **Voice/Video Calling**: WebRTC integration with PQC
- **Local AI Integration**: On-device language model for assistance
- **Mobile Applications**: Native iOS/Android clients
- **Storage Market**: Paid storage for large public datasets
- **Federated Search**: Search across four-word identities

### Long-term Vision
- **Plugin System**: Extensible architecture for third-party integrations
- **Advanced Collaboration**: Real-time collaborative document editing
- **Cross-platform Sync**: Seamless experience across all devices
- **Decentralized Governance**: Community-driven feature development

## 🎯 Next Steps

1. **Scale Testing**: Add more nodes to test scalability
2. **Load Testing**: Simulate high message volumes
3. **Security Testing**: Test encryption and authentication
4. **Performance Optimization**: Monitor and optimize resource usage

## 📞 Support

For issues with local testnet setup:
1. Check the troubleshooting section above
2. Review container logs: `docker-compose logs`
3. Verify network connectivity between containers
4. Ensure all required ports are available

---

**Happy testing! 🎉**
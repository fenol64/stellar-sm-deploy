#!/bin/bash

# Build script for Stellar Smart Contract Deployer

set -e

echo "🐳 Building Stellar Smart Contract Deployer Docker image..."

# Build the Docker image from the scripts directory
cd /home/fnascime/stellar-sm-deploy/scripts
docker build -t stellar-deployer:latest .

echo "✅ Docker image built successfully!"
echo ""
echo "📖 Usage examples:"
echo ""
echo "  # Deploy a smart contract:"
echo "  docker run --rm stellar-deployer:latest \\"
echo "    'https://github.com/fenol64/hello-world-stellar.git' \\"
echo "    'SCSWCWAH3ZOCOLTK375JMOUQ2DPKJOMDAPHGL6RNVQE5D6QNWA2UH67M' \\"
echo "    'testnet'"
echo ""
echo "  # Interactive shell mode:"
echo "  docker run --rm -it --entrypoint /bin/bash stellar-deployer:latest"
echo ""
echo "  # Mount a local directory for development:"
echo "  docker run --rm -v \$(pwd):/workspace stellar-deployer:latest \\"
echo "    'https://github.com/fenol64/hello-world-stellar.git' \\"
echo "    'ACCOUNT_ID' \\"
echo "    'testnet'"

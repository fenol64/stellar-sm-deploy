#!/bin/bash

# Example script demonstrating how to use the Stellar Deployer Docker image

set -e

echo "🔧 Building the Docker image..."
./build-docker.sh

echo ""
echo "🧪 Testing the deployment..."

# Example deployment (replace with your actual values)
GIT_URL="https://github.com/fenol64/hello-world-stellar.git"
ACCOUNT="SA7UZ5KSJZPSPHUUDI2BCAJ4RQLYL6JFLSMEVUC5YCQNSS2FG6GEQSE7"
NETWORK="testnet"  # Only testnet is supported

echo "Deploying contract from: $GIT_URL"
echo "Using account: $ACCOUNT"
echo "Target network: $NETWORK (only testnet supported)"
echo ""

# Run the deployment
docker run --rm \
  -v "$(pwd)/workspace:/workspace" \
  stellar-deployer:latest \
  "$GIT_URL" \
  "$ACCOUNT" \
  "$NETWORK"

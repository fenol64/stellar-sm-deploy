# Deployment and Automation Scripts

This directory contains scripts and Dockerfiles for building and running the Stellar Smart Contract Deployer, a tool that automates the deployment of Soroban smart contracts.

## 🐋 Docker Setup

The primary way to use these scripts is through the provided Docker containers. There are two main Dockerfiles:

- `Dockerfile.deploy`: Builds a container image named `stellar-deployer:latest`. This container is responsible for cloning a Git repository, compiling the Soroban smart contract to WASM, and deploying it to the Stellar network.
- `Dockerfile.gensdk`: Builds a container image named `gensdk:latest`. This container generates a TypeScript client SDK from a deployed contract ID.

### Building the Images

A convenience script is provided to build both Docker images.

```bash
# Make sure the script is executable
chmod +x build-docker.sh

# Run the build script
./build-docker.sh
```

## Core Scripts

- **`deploy.ts`**: The main deployment script. It performs the following steps:
  1. Clones a specified Git repository.
  2. Compiles the Rust smart contract to a WASM file.
  3. (Optional) Funds the target testnet account using Stellar's friendbot.
  4. Deploys the WASM file to the Stellar network using the provided account.
  5. Outputs the final contract address.

- **`generate-sdk.ts`**: This script generates a TypeScript SDK for a given contract ID. It uses the `stellar contract bindings typescript` command, zips the resulting SDK, and outputs it as a base64 string.

- **`commands.ts`**: A helper module that exports functions to generate the necessary shell commands used by `deploy.ts` and `generate-sdk.ts`.

## 🚀 Usage

### Deploying a Contract

Once the `stellar-deployer:latest` image is built, you can run it to deploy a contract.

```bash
docker run --rm stellar-deployer:latest \
  "<GIT_REPOSITORY_URL>" \
  "<YOUR_STELLAR_SECRET_KEY>" \
  "testnet"
```

- **`<GIT_REPOSITORY_URL>`**: The URL of the Git repository containing the Soroban smart contract.
- **`<YOUR_STELLAR_SECRET_KEY>`**: The secret key of the Stellar account that will deploy the contract.
- **`network`**: The target network. Currently, only `testnet` is supported for security.

See `example-deploy.sh` for a practical example.

### Generating a Client SDK

Once the `gensdk:latest` image is built, you can use it to generate an SDK from a contract address.

```bash
docker run --rm gensdk:latest "testnet" "<YOUR_CONTRACT_ID>"
```

- **`network`**: The network where the contract is deployed (e.g., `testnet`).
- **`<YOUR_CONTRACT_ID>`**: The address of the deployed smart contract.

The container will output a base64-encoded zip file containing the TypeScript SDK.

## 🛠️ Development

To work on the scripts directly, you can run a container in interactive mode with a mounted volume.

```bash
docker run --rm -it \
  -v $(pwd):/app \
  --entrypoint /bin/bash \
  stellar-deployer:latest
```

Inside the container, you can run the TypeScript scripts directly using `tsx`:

```bash
# Run the deployment script with arguments
tsx deploy.ts <git_url> <account> <network>

# Run the SDK generation script
tsx generate-sdk.ts <network> <contract_id>
```

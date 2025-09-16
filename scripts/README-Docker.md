# Stellar Smart Contract Deployer - Docker

Este Docker container automatiza o processo de deploy de smart contracts Stellar/Soroban.

## 🚀 Como usar

### 1. Construir a imagem Docker

```bash
./build-docker.sh
```

### 2. Executar o deploy

```bash
docker run --rm stellar-deployer:latest \
  "https://github.com/user/stellar-contract.git" \
  "SCSWCWAH3ZOCOLTK375JMOUQ2DPKJOMDAPHGL6RNVQE5D6QNWA2UH67M" \
  "testnet"
```

### 3. Variáveis de ambiente (opcional)

```bash
docker run --rm \
  -e STELLAR_ACCOUNT="SCSWCWAH3ZOCOLTK375JMOUQ2DPKJOMDAPHGL6RNVQE5D6QNWA2UH67M" \
  -e STELLAR_NETWORK="testnet" \
  stellar-deployer:latest \
  "https://github.com/user/stellar-contract.git"
```

## 📋 Pré-requisitos

O container inclui todas as dependências necessárias:
- Node.js 20
- Rust e Cargo
- Stellar CLI
- Target wasm32-unknown-unknown

## 🛠️ Desenvolvimento

Para desenvolvimento, você pode montar um volume local:

```bash
docker run --rm -it \
  -v $(pwd)/workspace:/workspace \
  --entrypoint /bin/bash \
  stellar-deployer:latest
```

## 📖 Argumentos

1. **git_url**: URL do repositório Git contendo o smart contract
2. **account**: ID da conta Stellar para deploy
3. **network**: Rede de destino (testnet, mainnet)

## 🎯 Exemplo completo

```bash
# Construir a imagem
./build-docker.sh

# Executar deploy
docker run --rm \
  -v $(pwd)/output:/workspace \
  stellar-deployer:latest \
  "https://github.com/fenol64/hello-world-stellar.git" \
  "SCSWCWAH3ZOCOLTK375JMOUQ2DPKJOMDAPHGL6RNVQE5D6QNWA2UH67M" \
  "testnet"
```

## 🐞 Troubleshooting

Para debug, execute em modo interativo:

```bash
docker run --rm -it --entrypoint /bin/bash stellar-deployer:latest
```

Dentro do container, você pode executar:

```bash
# Testar se as ferramentas estão instaladas
stellar --version
cargo --version
node --version

# Executar o script manualmente
tsx /app/deploy.ts --help
```

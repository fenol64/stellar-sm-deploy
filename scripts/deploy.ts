import { execSync } from "node:child_process";

import * as fs from "node:fs";

import * as path from "node:path";

import { addTarget, cloneRepository, compileToWasm, deploy, fundAccount } from "./commands.js";

export const exec = async (url: string, account: string, network: string) => {
	try {
		const cloneCmd = cloneRepository(url);
		console.log(`Executando: ${cloneCmd}`);
		execSync(cloneCmd, { stdio: "inherit" });

		const parts = url.split("/").pop();
		const repositoryName = parts?.split(".")[0];

		if (!repositoryName) {
			throw new Error("Não foi possível extrair o nome do repositório");
		}

		const projectPath = `./${repositoryName}`;
		const cargoTomlPath = path.join(projectPath, "Cargo.toml");

		if (!fs.existsSync(cargoTomlPath)) {
			throw new Error(`Cargo.toml não encontrado em ${projectPath}`);
		}

		execSync(addTarget(), { stdio: "inherit" });

		const compileCmd = compileToWasm("", projectPath);
		execSync(compileCmd, { stdio: "inherit", cwd: process.cwd() });

		const wasmPath = path.join(
			projectPath,
			"target/wasm32-unknown-unknown/release",
		);
		const wasmFiles = fs
			.readdirSync(wasmPath)
			.filter((file) => file.endsWith(".wasm"));

		if (wasmFiles.length === 0) {
			throw new Error("Nenhum arquivo WASM encontrado após a compilação");
		}

		const wasmFile = path.join(wasmPath, wasmFiles[0]);
		console.log(`Arquivo WASM gerado: ${wasmFile}`);

		// Fund account on testnet if needed
		if (network === 'testnet') {
			try {
				console.log(`💰 Financiando conta ${account} no testnet...`);
				const fundCmd = fundAccount(account, network);
				console.log(`Executando: ${fundCmd}`);
				execSync(fundCmd, { stdio: "inherit" });
				console.log(`✅ Conta financiada com sucesso!`);
			} catch (fundError) {
				console.log(`⚠️ Aviso: Falha ao financiar conta (pode já estar financiada): ${fundError}`);
				// Continue even if funding fails - account might already be funded
			}
		}

		const deployCmd = deploy(wasmFile, account, network, repositoryName, "");
		console.log(`Executando: ${deployCmd}`);

		// Capture contract address from deploy output
		let contractAddress = '';
		try {
			const deployOutput = execSync(deployCmd, { encoding: 'utf8' });
			console.log('Deploy output:', deployOutput);

			// Try to extract contract address from output
			const addressMatch = deployOutput.match(/Contract deployed successfully with address: ([A-Z0-9]+)/i) ||
			                    deployOutput.match(/Address: ([A-Z0-9]+)/i) ||
			                    deployOutput.match(/([A-Z0-9]{56})/); // Standard Stellar contract address format

			if (addressMatch) {
				contractAddress = addressMatch[1];
				console.log(`📄 Contract Address: ${contractAddress}`);
			}
		} catch (error) {
			console.error('Failed to capture contract address:', error);
			throw error;
		}

		console.log(`✅ Deploy concluído com sucesso para ${repositoryName}!`);

		return {
			success: true,
			repositoryName,
			wasmPath: wasmFile,
			contractAlias: repositoryName,
			contractAddress: contractAddress || 'N/A'
		};
	} catch (error) {
		console.error(`❌ Erro durante o processo de deploy:`, error);
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
};

// CLI interface for Docker container
const main = async () => {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
		console.log(`
🚀 Stellar Smart Contract Deployer

Usage: tsx deploy.ts <git_url> <account> <network>

Arguments:
  git_url    Git repository URL containing the Stellar smart contract
  account    Stellar account ID for deployment
  network    Network to deploy to (testnet only)

Examples:
  tsx deploy.ts https://github.com/user/stellar-contract.git SCSWC...H67M testnet

Environment Variables:
  STELLAR_ACCOUNT - Default account ID if not provided as argument
  STELLAR_NETWORK - Default network if not provided as argument (defaults to testnet)

Note: Mainnet deployments are disabled for security. Only testnet is supported.
		`);
		process.exit(0);
	}

	const gitUrl = args[0] || process.env.GIT_URL;
	const account = args[1] || process.env.STELLAR_ACCOUNT;
	const network = args[2] || process.env.STELLAR_NETWORK || 'testnet';

	// Force testnet for security
	if (network !== 'testnet') {
		console.error('❌ Erro: Apenas deployments para testnet são suportados');
		console.error('⚠️ Deployments para mainnet foram desabilitados por segurança');
		process.exit(1);
	}

	if (!gitUrl || !account) {
		console.error('❌ Erro: URL do repositório e conta são obrigatórios');
		console.error('Use --help para ver as opções disponíveis');
		process.exit(1);
	}

	console.log(`🚀 Iniciando deploy do contrato...`);
	console.log(`📁 Repositório: ${gitUrl}`);
	console.log(`👤 Conta: ${account}`);
	console.log(`🌐 Rede: ${network}`);
	console.log('');

	const result = await exec(gitUrl, account, network);

	if (result.success) {
		console.log(`\n🎉 Deploy realizado com sucesso!`);
		console.log(`📦 Contrato: ${result.contractAlias}`);
		console.log(`📄 WASM: ${result.wasmPath}`);
		process.exit(0);
	} else {
		console.error(`\n💥 Falha no deploy: ${result.error}`);
		process.exit(1);
	}
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error('❌ Erro inesperado:', error);
		process.exit(1);
	});
}

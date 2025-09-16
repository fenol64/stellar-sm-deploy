import { execSync } from "node:child_process";

import * as fs from "node:fs";

import * as path from "node:path";

import { addTarget, cloneRepository, compileToWasm, deploy } from "./commands.js";

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

		const deployCmd = deploy(wasmFile, account, network, repositoryName, "");
		console.log(`Executando: ${deployCmd}`);
		execSync(deployCmd, { stdio: "inherit" });

		console.log(`✅ Deploy concluído com sucesso para ${repositoryName}!`);

		return {
			success: true,
			repositoryName,
			wasmPath: wasmFile,
			contractAlias: repositoryName,
		};
	} catch (error) {
		console.error(`❌ Erro durante o processo de deploy:`, error);
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
};

console.log(exec("git@github.com:fenol64/hello-world-stellar.git", "SCSWCWAH3ZOCOLTK375JMOUQ2DPKJOMDAPHGL6RNVQE5D6QNWA2UH67M", "testnet"))

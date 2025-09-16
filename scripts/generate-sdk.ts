import { execSync } from "node:child_process";
import * as fs from "node:fs";
import { sdk } from "./commands.js";

export const execSdk = async (network: string, contractId: string) => {
  const sdkDir = './sdk';
  const zipFile = 'sdk.zip';

  try {
    console.error("1. Gerando comando SDK...");
    const command = sdk(network, contractId);
    console.error(`Comando: ${command}`);

    console.error("2. Executando geração do SDK...");
    execSync(command, { stdio: "inherit" }); // This should print stellar-cli output
    console.error("✅ SDK gerado.");

    console.error("3. Verificando se o diretório '${sdkDir}' foi criado...");
    if (!fs.existsSync(sdkDir)) {
        console.error(`❌ O diretório '${sdkDir}' não foi encontrado após a geração do SDK.`);
        throw new Error("Diretório do SDK não criado.");
    }
    const files = fs.readdirSync(sdkDir);
    console.error(`Conteúdo do diretório '${sdkDir}':`, files);
    if (files.length === 0) {
        console.error(`⚠️  Atenção: O diretório '${sdkDir}' está vazio.`);
    }

    console.error("4. Compactando o diretório '${sdkDir}'...");
    execSync(`zip -r ${zipFile} ${sdkDir} >&2`, { stdio: 'inherit' });
    console.error(`✅ Pasta ${sdkDir} zipada.`);

    console.error("5. Verificando se o arquivo '${zipFile}' foi criado...");
    if (!fs.existsSync(zipFile)) {
        console.error(`❌ O arquivo '${zipFile}' não foi encontrado após a compactação.`);
        throw new Error("Arquivo zip não criado.");
    }
    const stats = fs.statSync(zipFile);
    console.error(`Tamanho do arquivo '${zipFile}': ${stats.size} bytes.`);


    console.error("6. Lendo o arquivo zip e codificando para base64...");
    const zipBuffer = fs.readFileSync(zipFile);
    const base64Data = zipBuffer.toString('base64');
    console.error("✅ Arquivo zip codificado.");

    return {
			success: true,
      base64: base64Data,
		};
  } catch (error) {
    console.error(`❌ Erro durante o processo de gerar o sdk:`, error);
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
  }
}

// CLI interface for Docker container
const main = async () => {
	const args = process.argv.slice(2);

	if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
		console.error(`
⚙️  Stellar Contract SDK Generator

Usage:
  node dist/generate-sdk.js <network> <contract_id>

Arguments:
  network      Stellar network (e.g., testnet, futurenet)
  contract_id  The ID of the contract to generate the SDK for

Examples:
  node dist/generate-sdk.js testnet CA3D5KGRY6E524252F5XVCF33ON6VZM2PASSCH5B5L5V5Y3EXS6G533B

Description:
  This script generates a TypeScript SDK from a Stellar smart contract,
  zips it, and outputs the base64 encoded zip file to stdout.
  All progress messages are written to stderr.
		`);
		process.exit(0);
	}

	const [network, contractId] = args;

	if (!network || !contractId) {
		console.error('❌ Erro: Network e Contract ID são obrigatórios');
		console.error('Use --help para ver as opções disponíveis');
		process.exit(1);
	}

	console.error(`⚙️  Iniciando geração de SDK...`);
	console.error(`🌐 Rede: ${network}`);
	console.error(`📄 Contrato: ${contractId}`);
	console.error('');

	const result = await execSdk(network, contractId);

	if (result.success && result.base64) {
    console.error(`\n🎉 Processo concluído. Tamanho do base64: ${result.base64.length}`);
    console.error(`Escrevendo base64 para stdout...`);
    process.stdout.write(result.base64);
    console.error(`✅ Escrita para stdout concluída.`);
		process.exit(0);
	} else {
		console.error(`
💥 Falha ao gerar SDK: ${result.error || 'Erro desconhecido'}`);
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

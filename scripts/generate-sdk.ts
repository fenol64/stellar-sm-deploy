import { execSync } from "node:child_process";
import { sdk } from "./commands";

export const execSdk = async (network: string, contractId: string) => {
  try {
    const command = sdk(network, contractId)
    execSync(command, { stdio: "inherit" });
    console.log("✅ SDK gerado com sucesso!");
    return {
			success: true,
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
		console.log(`
⚙️  Stellar Contract SDK Generator

Usage:
  node dist/generate-sdk.js <network> <contract_id>

Arguments:
  network      Stellar network (e.g., testnet, futurenet)
  contract_id  The ID of the contract to generate the SDK for

Examples:
  node dist/generate-sdk.js testnet CA3D5KGRY6E524252F5XVCF33ON6VZM2PASSCH5B5L5V5Y3EXS6G533B
		`);
		process.exit(0);
	}

	const [network, contractId] = args;

	if (!network || !contractId) {
		console.error('❌ Erro: Network e Contract ID são obrigatórios');
		console.error('Use --help para ver as opções disponíveis');
		process.exit(1);
	}

	console.log(`⚙️  Iniciando geração de SDK...`);
	console.log(`🌐 Rede: ${network}`);
	console.log(`📄 Contrato: ${contractId}`);
	console.log('');

	const result = await execSdk(network, contractId);

	if (result.success) {
		console.log(`
🎉 SDK gerado com sucesso!`);
		process.exit(0);
	} else {
		console.error(`
💥 Falha ao gerar SDK: ${result.error}`);
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

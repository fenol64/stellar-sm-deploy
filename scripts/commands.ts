export const cloneRepository = (url: string) => {
	return `git clone ${url}`
}

export const addTarget = () => {
	return `rustup target add wasm32-unknown-unknown`
}

export const compileToWasm = (params: string, path: string) => {
	return `cargo build --target wasm32-unknown-unknown --release --manifest-path ${path}/Cargo.toml ${params}`;
}

export const fundAccount = (account: string, network: string) => {
	return `stellar account fund ${account} --network ${network}`
}

export const deploy = (
	path: string,
	account: string,
	network: string,
	alias: string,
	params: string,
) => {
	return `stellar contract deploy \
    --wasm ${path} \
    --source-account ${account} \
    --network ${network} \
    --alias ${alias} \
    ${params}`
}

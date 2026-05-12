# Soroban contract build and deployment Makefile

.PHONY: build test clean deploy

# Default network
NETWORK ?= standalone

# Contract names
VISIBILITY_CONTRACT ?= visibility_contract
ATTESTATION_CONTRACT ?= attestation_contract
SETTLEMENT_CONTRACT ?= settlement_contract

build:
	@echo "Building Soroban contracts..."
	cargo build --target wasm32-unknown-unknown --release
	@echo "Contracts built successfully"

test:
	@echo "Running contract tests..."
	cargo test
	@echo "Tests completed"

clean:
	@echo "Cleaning build artifacts..."
	cargo clean
	rm -f *.wasm
	@echo "Clean completed"

deploy-visibility:
	@echo "Deploying visibility contract..."
	soroban contract deploy \
		--wasm target/wasm32-unknown-unknown/release/$(VISIBILITY_CONTRACT).wasm \
		--source $(SOURCE_ACCOUNT) \
		--network $(NETWORK)

deploy-attestation:
	@echo "Deploying attestation contract..."
	soroban contract deploy \
		--wasm target/wasm32-unknown-unknown/release/$(ATTESTATION_CONTRACT).wasm \
		--source $(SOURCE_ACCOUNT) \
		--network $(NETWORK)

deploy-settlement:
	@echo "Deploying settlement contract..."
	soroban contract deploy \
		--wasm target/wasm32-unknown-unknown/release/$(SETTLEMENT_CONTRACT).wasm \
		--source $(SOURCE_ACCOUNT) \
		--network $(NETWORK)

deploy-all: deploy-visibility deploy-attestation deploy-settlement

# Initialize development environment
init:
	@echo "Initializing Soroban development environment..."
	soroban network standalone
	@echo "Environment initialized"

# Show contract addresses
show-addresses:
	@echo "Contract addresses:"
	@echo "Visibility: $(VISIBILITY_CONTRACT_ADDRESS)"
	@echo "Attestation: $(ATTESTATION_CONTRACT_ADDRESS)"
	@echo "Settlement: $(SETTLEMENT_CONTRACT_ADDRESS)"

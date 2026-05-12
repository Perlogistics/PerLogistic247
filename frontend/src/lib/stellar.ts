import * as StellarSdk from '@stellar/stellar-sdk';
import { Address, Transaction, SorobanDataBuilder } from '@soroban-react/soroban-react';

export class StellarService {
  private server: StellarSdk.Horizon.Server;
  private network: string;
  private rpcUrl: string;

  constructor(network: string, rpcUrl: string) {
    this.network = network;
    this.rpcUrl = rpcUrl;
    
    // Configure Horizon server based on network
    if (network === 'mainnet') {
      this.server = new StellarSdk.Horizon.Server('https://horizon.stellar.org');
    } else if (network === 'testnet') {
      this.server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    } else {
      // standalone/futurenet
      this.server = new StellarSdk.Horizon.Server('http://localhost:8000');
    }
  }

  // Account management
  async createAccount(): Promise<{ publicKey: string; secretKey: string }> {
    const keypair = StellarSdk.Keypair.random();
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }

  async getAccount(publicKey: string): Promise<StellarSdk.Horizon.Account> {
    return await this.server.loadAccount(publicKey);
  }

  async fundAccount(publicKey: string): Promise<void> {
    if (this.network === 'standalone') {
      // Use friendbot for standalone network
      const response = await fetch(`http://localhost:8000/friendbot?addr=${publicKey}`);
      if (!response.ok) {
        throw new Error('Failed to fund account');
      }
    } else if (this.network === 'testnet') {
      // Use testnet friendbot
      const response = await fetch(`https://friendbot.stellar.org/?addr=${publicKey}`);
      if (!response.ok) {
        throw new Error('Failed to fund account');
      }
    } else {
      throw new Error('Account funding not available on mainnet');
    }
  }

  // Transaction operations
  async buildTransaction(
    sourcePublicKey: string,
    operations: StellarSdk.Operation[],
    memo?: string
  ): Promise<StellarSdk.Transaction> {
    const account = await this.getAccount(sourcePublicKey);
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.getNetworkPassphrase(),
    });

    operations.forEach(op => transaction.addOperation(op));

    if (memo) {
      transaction.addMemo(StellarSdk.Memo.text(memo));
    }

    return transaction.setTimeout(StellarSdk.TimeoutInfinite).build();
  }

  async signTransaction(transaction: StellarSdk.Transaction, secretKey: string): Promise<StellarSdk.Transaction> {
    const keypair = StellarSdk.Keypair.fromSecret(secretKey);
    transaction.sign(keypair);
    return transaction;
  }

  async submitTransaction(transaction: StellarSdk.Transaction): Promise<StellarSdk.Horizon.SubmitTransactionResponse> {
    return await this.server.submitTransaction(transaction);
  }

  // Soroban contract operations
  async deployContract(wasm: Buffer, sourcePublicKey: string, secretKey: string): Promise<string> {
    const account = await this.getAccount(sourcePublicKey);
    
    // Create deploy contract operation
    const deployOp = StellarSdk.Operation.deployContractWasm({
      wasm: wasm,
    });

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.getNetworkPassphrase(),
    })
      .addOperation(deployOp)
      .setTimeout(StellarSdk.TimeoutInfinite)
      .build();

    const signedTx = await this.signTransaction(transaction, secretKey);
    const result = await this.submitTransaction(signedTx);

    // Extract contract address from result
    const contractId = result.resultMetaXdr?.v3()?.operations?.[0]?.deployContractWasm?.contractId;
    if (!contractId) {
      throw new Error('Failed to extract contract address');
    }

    return StellarSdk.StrKey.encodeContract(contractId);
  }

  async invokeContract(
    contractAddress: string,
    functionName: string,
    args: any[],
    sourcePublicKey: string,
    secretKey: string
  ): Promise<any> {
    const account = await this.getAccount(sourcePublicKey);
    
    // Create contract address object
    const contract = new StellarSdk.Address(contractAddress);
    
    // Build invocation operation
    const invokeOp = StellarSdk.Operation.invokeContractFunction({
      contract: contract,
      function: functionName,
      args: args,
    });

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.getNetworkPassphrase(),
    })
      .addOperation(invokeOp)
      .setTimeout(StellarSdk.TimeoutInfinite)
      .build();

    const signedTx = await this.signTransaction(transaction, secretKey);
    const result = await this.submitTransaction(signedTx);

    return result.resultMetaXdr;
  }

  // Payment operations
  async sendPayment(
    sourcePublicKey: string,
    destinationPublicKey: string,
    amount: string,
    asset: StellarSdk.Asset = StellarSdk.Asset.native(),
    secretKey: string
  ): Promise<StellarSdk.Horizon.SubmitTransactionResponse> {
    const paymentOp = StellarSdk.Operation.payment({
      destination: destinationPublicKey,
      asset: asset,
      amount: amount,
    });

    const transaction = await this.buildTransaction(sourcePublicKey, [paymentOp]);
    const signedTx = await this.signTransaction(transaction, secretKey);
    return await this.submitTransaction(signedTx);
  }

  // Trust line operations
  async createTrustLine(
    sourcePublicKey: string,
    asset: StellarSdk.Asset,
    secretKey: string
  ): Promise<StellarSdk.Horizon.SubmitTransactionResponse> {
    const trustOp = StellarSdk.Operation.changeTrust({
      asset: asset,
    });

    const transaction = await this.buildTransaction(sourcePublicKey, [trustOp]);
    const signedTx = await this.signTransaction(transaction, secretKey);
    return await this.submitTransaction(signedTx);
  }

  // Balance operations
  async getBalances(publicKey: string): Promise<StellarSdk.Horizon.BalanceLine[]> {
    const account = await this.getAccount(publicKey);
    return account.balances;
  }

  // Transaction history
  async getTransactions(publicKey: string, limit: number = 10): Promise<StellarSdk.Horizon.OperationRecord[]> {
    const operations = await this.server
      .operations()
      .forAccount(publicKey)
      .limit(limit)
      .order('desc')
      .call();

    return operations.records;
  }

  // Utility methods
  private getNetworkPassphrase(): string {
    switch (this.network) {
      case 'mainnet':
        return 'Public Global Stellar Network ; September 2015';
      case 'testnet':
        return 'Test SDF Network ; September 2015';
      case 'futurenet':
        return 'Test SDF Future Network ; October 2022';
      case 'standalone':
        return 'Standalone Network ; February 2017';
      default:
        throw new Error(`Unknown network: ${this.network}`);
    }
  }

  validateAddress(address: string): boolean {
    try {
      StellarSdk.StrKey.decodeEd25519PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  validateContractAddress(address: string): boolean {
    try {
      StellarSdk.StrKey.decodeContract(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Asset creation
  createAsset(code: string, issuer: string): StellarSdk.Asset {
    return new StellarSdk.Asset(code, issuer);
  }

  // Fee estimation
  async estimateFee(operations: StellarSdk.Operation[]): Promise<string> {
    // Base fee estimation - in production, this should be more sophisticated
    const baseFee = StellarSdk.BASE_FEE;
    const totalFee = (baseFee * operations.length).toString();
    return totalFee;
  }

  // Multi-signature operations
  async addSigner(
    sourcePublicKey: string,
    signerPublicKey: string,
    weight: number,
    secretKey: string
  ): Promise<StellarSdk.Horizon.SubmitTransactionResponse> {
    const setOptionsOp = StellarSdk.Operation.setOptions({
      signer: {
        ed25519PublicKey: signerPublicKey,
        weight: weight,
      },
    });

    const transaction = await this.buildTransaction(sourcePublicKey, [setOptionsOp]);
    const signedTx = await this.signTransaction(transaction, secretKey);
    return await this.submitTransaction(signedTx);
  }

  // Streaming operations
  streamTransactions(accountId: string, callback: (transaction: StellarSdk.Horizon.TransactionResponse) => void): () => void {
    const es = this.server
      .transactions()
      .forAccount(accountId)
      .stream({
        onmessage: callback,
      });

    return () => es.close();
  }

  streamOperations(accountId: string, callback: (operation: StellarSdk.Horizon.OperationRecord) => void): () => void {
    const es = this.server
      .operations()
      .forAccount(accountId)
      .stream({
        onmessage: callback,
      });

    return () => es.close();
  }
}

// Create singleton instance
export const stellarService = new StellarService(
  process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'standalone',
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'http://localhost:8001'
);

export default stellarService;

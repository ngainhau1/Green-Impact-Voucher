import * as StellarSdk from "@stellar/stellar-sdk";
import {
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";

export const NETWORK = {
  name: "TESTNET",
  rpcUrl: "https://soroban-testnet.stellar.org",
  passphrase: "Test SDF Network ; September 2015",
  explorerUrl: "https://stellar.expert/explorer/testnet",
};

export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || "";
export const DEFAULT_PAYMENT_TOKEN = import.meta.env.VITE_PAYMENT_TOKEN_ID || "";

export function isContractConfigured() {
  return CONTRACT_ID.startsWith("C") && CONTRACT_ID.length > 20;
}

export function stroopsToXlm(value) {
  const amount = Number(value || 0) / 10_000_000;
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export function shortAddress(address) {
  if (!address || typeof address !== "string") return "Not connected";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-5)}`;
}

export function explorerTx(hash) {
  return `${NETWORK.explorerUrl}/tx/${hash}`;
}

export function explorerContract(id = CONTRACT_ID) {
  return `${NETWORK.explorerUrl}/contract/${id}`;
}

function getServer() {
  const Server = StellarSdk.rpc?.Server;
  if (!Server) {
    throw new Error("Installed Stellar SDK does not expose an RPC server.");
  }
  return new Server(NETWORK.rpcUrl);
}

function getContract() {
  if (!isContractConfigured()) {
    throw new Error("Set VITE_CONTRACT_ID before calling the contract.");
  }
  return new StellarSdk.Contract(CONTRACT_ID);
}

export async function connectWallet() {
  const connection = await isConnected();
  if (connection.error) {
    throw new Error(connection.error.message || "Freighter connection failed.");
  }
  if (!connection.isConnected) {
    throw new Error("Freighter is not installed or not available in this browser.");
  }

  const access = await requestAccess();
  if (access.error) {
    throw new Error(access.error.message || "Wallet access was rejected.");
  }
  return access.address;
}

export async function submitContractCall(address, functionName, args) {
  const server = getServer();
  const contract = getContract();
  const account = await server.getAccount(address);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK.passphrase,
  })
    .addOperation(contract.call(functionName, ...args))
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  const signed = await signTransaction(prepared.toXDR(), {
    network: NETWORK.name,
    networkPassphrase: NETWORK.passphrase,
    address,
  });

  if (signed.error) {
    throw new Error(signed.error.message || "Transaction signing failed.");
  }

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signed.signedTxXdr,
    NETWORK.passphrase,
  );
  const response = await server.sendTransaction(signedTx);

  if (response.errorResultXdr) {
    throw new Error(`Transaction rejected: ${response.status}`);
  }

  if (response.status !== "PENDING") {
    return { ...response, hash: response.hash };
  }

  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const result = await server.getTransaction(response.hash);
    if (result.status !== "NOT_FOUND") {
      return { ...result, hash: response.hash };
    }
  }

  throw new Error("Timed out waiting for transaction confirmation.");
}

export async function simulateContractRead(sourceAddress, functionName, args) {
  const server = getServer();
  const contract = getContract();
  const account = await server.getAccount(sourceAddress);
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK.passphrase,
  })
    .addOperation(contract.call(functionName, ...args))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);
  if (result.error) {
    throw new Error(result.error);
  }
  if (!result.result?.retval) {
    return null;
  }
  return StellarSdk.scValToNative(result.result.retval);
}

export const arg = {
  address(value) {
    return new StellarSdk.Address(value).toScVal();
  },
  u32(value) {
    return StellarSdk.xdr.ScVal.scvU32(Number(value));
  },
  u64(value) {
    return StellarSdk.nativeToScVal(BigInt(value), { type: "u64" });
  },
  i128(value) {
    return StellarSdk.nativeToScVal(BigInt(value), { type: "i128" });
  },
  string(value) {
    return StellarSdk.nativeToScVal(String(value), { type: "string" });
  },
};

export async function fetchProject(address, projectId) {
  return simulateContractRead(address, "project", [arg.u32(projectId)]);
}

export async function fetchHolding(address, projectId) {
  return simulateContractRead(address, "holding", [
    arg.u32(projectId),
    arg.address(address),
  ]);
}

export async function createProject(address, form) {
  return submitContractCall(address, "create_project", [
    arg.address(address),
    arg.u32(form.projectId),
    arg.string(form.title),
    arg.string(form.impactUnit),
    arg.i128(form.pricePerVoucher),
    arg.u32(form.unitPerVoucher),
    arg.address(form.paymentToken),
    arg.string(form.metadataHash),
    arg.u64(form.verificationDeadline),
  ]);
}

export async function buyVoucher(address, projectId, quantity) {
  return submitContractCall(address, "buy_voucher", [
    arg.address(address),
    arg.u32(projectId),
    arg.u32(quantity),
  ]);
}

export async function verifyProject(address, projectId, verifiedUnits, reportHash) {
  return submitContractCall(address, "verify_project", [
    arg.address(address),
    arg.u32(projectId),
    arg.u32(verifiedUnits),
    arg.string(reportHash),
  ]);
}

export async function retireVoucher(address, voucherId) {
  return submitContractCall(address, "retire_voucher", [
    arg.address(address),
    arg.u64(voucherId),
  ]);
}

export async function refundVoucher(address, voucherId) {
  return submitContractCall(address, "refund_voucher", [
    arg.address(address),
    arg.u64(voucherId),
  ]);
}

export async function withdrawFunds(address, projectId, amount) {
  return submitContractCall(address, "withdraw_funds", [
    arg.address(address),
    arg.u32(projectId),
    arg.i128(amount),
  ]);
}

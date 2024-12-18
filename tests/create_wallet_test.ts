import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Smartwallet } from "./../target/types/smartwallet";
import idl from "./../target/idl/smartwallet.json";
const { Keypair, ConfirmOptions, PublicKey } = require("@solana/web3.js");

async function main() {
  // solana provider & wallet
  const url = anchor.web3.clusterApiUrl("devnet");
  console.log("solana url: ", url);
  const connection = new anchor.web3.Connection(url, "confirmed");
  let secretKey = Uint8Array.from([234, 212, 57, 137, 35, 17, 232, 92, 120, 194, 143, 102, 216, 107, 48, 229, 155, 18, 246, 139, 38, 132, 236, 183, 25, 228, 86, 109, 124, 165, 211, 146, 23, 45, 150, 153, 8, 189, 1, 79, 184, 11, 125, 231, 105, 235, 59, 26, 41, 206, 213, 116, 40, 183, 164, 59, 78, 149, 216, 16, 213, 29, 179, 178]);
  let keypair = Keypair.fromSecretKey(secretKey);
  const wallet = new anchor.Wallet(keypair);
  console.log("solana payer address: ", wallet.publicKey.toBase58());
  const privKeyHex = Buffer.from(wallet.payer.secretKey).toString('hex')
  const pubKeyHex = Buffer.from(wallet.publicKey.toBytes()).toString('hex')
  console.log('solana payer public key: ', pubKeyHex)
  console.log('solana payer private key: ', privKeyHex)
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);

  // program
  const programAddress = new PublicKey('C7iFDZry7Kdg7gc829qBCPEPKKdDkf1gRMxNxDEqeYUX');
  let program = anchor.workspace.Smartwallet as Program<Smartwallet>;

  //
  const owner = Buffer.from('024e1e9e0de1a665cbbcaaa4c3e9388e5900adc9ff5b9676f3b973dbe8b2b3aa', 'hex');
  const systemProgarmAddress = anchor.web3.SystemProgram.programId;

  let [smartWalletAddress, bump] = await PublicKey.findProgramAddress(
    ['wallet', 'config', owner],
    programAddress,
  );
  console.log('smart config wallet address: ', smartWalletAddress)
  console.log('smart config wallet bump: ', bump)
  const tx = await program.methods
    .walletCreate({
      owner: owner,
    })
    .accounts({
      wallet: smartWalletAddress,
      creator: wallet.publicKey,
      systemProgram: systemProgarmAddress,
    })
    .signers([wallet.payer])
    .rpc();
  console.log("transaction signature", tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

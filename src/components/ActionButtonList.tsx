const viemChains = await import("viem/chains");
const { optimismSepolia, sepolia } = viemChains;
const opActions = await import("@eth-optimism/viem/actions");
const { depositERC20 } = opActions;
import { useState } from "react";
import {
  useAccount,
  useWalletClient,
} from "wagmi";
import { parseEther } from "viem";

export const ActionButtonList = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient({ chainId: sepolia.id });

  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const l1Token = "0x0000000000000000000000000000000000000000";
  const l2Token = "0x0000000000000000000000000000000000000000";
  const oneToken = parseEther("1");

  const deposit = async () => {
    if (!walletClient || !address) return;

    try {
      const depositTx = await depositERC20(walletClient, {
        tokenAddress: l1Token,
        remoteTokenAddress: l2Token,
        amount: oneToken,
        targetChain: optimismSepolia,
        to: address,
        minGasLimit: 200000,
      });

      console.log(`Deposit transaction hash: ${depositTx}`);
      setTxHash(depositTx);
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  return (
    isConnected && (
      <>
        <div>
          <button onClick={deposit}>Deposit</button>
        </div>
        <div>
          {txHash && (
            <div>
              <p>Transaction Hash: {txHash}</p>
            </div>
          )}
        </div>
      </>
    )
  )
};

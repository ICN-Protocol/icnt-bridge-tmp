import {base, mainnet} from "viem/chains";

const opActions = await import("@eth-optimism/viem/actions");
const { depositERC20, withdrawOptimismERC20 } = opActions;
import { useState } from "react";
import {
  useAccount,
  useWalletClient,
} from "wagmi";
import { parseEther } from "viem";

export const ActionButtonList = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient({ chainId: base.id });

  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const l1Token = "0xe5e0b73380181273abCfD88695F52C4D0C825661";
  const l2Token = "0xE0Cd4cAcDdcBF4f36e845407CE53E87717b6601d";
  const oneToken = parseEther("1");

  const deposit = async () => {
    if (!walletClient || !address) return;

    try {
      const depositTx = await depositERC20(walletClient, {
        tokenAddress: l1Token,
        remoteTokenAddress: l2Token,
        amount: oneToken,
        targetChain: base,
        to: address,
        minGasLimit: 200000,
      });

      console.log(`Deposit transaction hash: ${depositTx}`);
      setTxHash(depositTx);
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const withdraw = async () => {
    if (!walletClient || !address) return;
    try {
      const withdrawTx = await withdrawOptimismERC20(walletClient, {
        tokenAddress: l2Token,
        amount: oneToken,
        to: address,
        minGasLimit: 200000,
      });

      console.log(`Withdrawal transaction hash: ${withdrawTx}`);
      setTxHash(withdrawTx);
    }
    catch (error) {
      console.error("Withdrawal failed:", error);
    }
  }

  return (
    isConnected && (
      <>
        <div>
          <button onClick={deposit}>Deposit</button>
          <button onClick={withdraw}>Withdraw</button>
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

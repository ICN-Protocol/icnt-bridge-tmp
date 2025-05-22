import { base, mainnet, optimism } from "viem/chains";

const opActions = await import("@eth-optimism/viem/actions");
const { depositERC20, withdrawOptimismERC20 } = opActions;
import { useEffect, useState } from "react";
import { useAccount, useSwitchChain, useWalletClient, usePublicClient } from "wagmi";
import { parseEther } from "viem";
import { erc20ABI } from "./erc20ABI";

export const ActionButtonList = () => {
  const { address, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const switchChainResult = useSwitchChain();
  const [balanceOf, setBalanceOf] = useState<bigint>(BigInt(0));
  const [isApproved, setIsApproved] = useState(false);

  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const l1Token = "0xe5e0b73380181273abCfD88695F52C4D0C825661";
  const l2Token = "0xE0Cd4cAcDdcBF4f36e845407CE53E87717b6601d";
  const oneToken = parseEther("1");
  const bridgeAddress = optimism.contracts.l1StandardBridge[mainnet.id].address;

  const approve = async () => {
    if (!walletClient || !address) return;
    try {
      const approveTx = await walletClient.writeContract({
        address: l1Token,
        abi: erc20ABI,
        functionName: "approve",
        args: [bridgeAddress, oneToken],
      });
      console.log("Approval transaction:", approveTx);
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicClient || !address) return;
      try {
        const balance = await publicClient.readContract({
          address: chain?.id === mainnet.id ? l1Token : l2Token,
          abi: erc20ABI,
          functionName: "balanceOf",
          args: [address],
        });
        setBalanceOf(balance);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    };
    const checkApproval = async () => {
      if (!publicClient || !address) return;
      try {
        const allowance = await publicClient.readContract({
          address: l1Token,
          abi: erc20ABI,
          functionName: "allowance",
          args: [address, bridgeAddress],
        });
        setIsApproved(allowance >= oneToken);
      } catch (error) {
        console.error("Failed to check approval:", error);
      }
    };
    fetchBalance();
    if (chain?.id === mainnet.id) {
      checkApproval();
    }
  }, [publicClient, address, chain?.id, bridgeAddress, oneToken]);
    
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
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };

  const handleSwitchChain = async () => {
    if (!walletClient || !address) return;
    if (chain?.id !== base.id) {
      if (switchChainResult.switchChain) {
        switchChainResult.switchChain({ chainId: base.id });
      }
      return;
    }
    if (chain?.id === base.id) {
      if (switchChainResult.switchChain) {
        switchChainResult.switchChain({ chainId: mainnet.id });
      }
      return;
    }
  };

  const getSwitchNetworkButtonText = () => {
    if (chain?.id === mainnet.id) {
      return "Switch to Base";
    } else if (chain?.id === base.id) {
      return "Switch to Ethereum";
    } else {
      return "Switch Network";
    }
  };

  return (
    isConnected && (
      <>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "12px" }}>
          {balanceOf ? (
            <div>
              <p>Balance: {balanceOf.toString()}</p>
              {chain?.id === mainnet.id && (
                <>
                  <button onClick={approve} disabled={isApproved}>
                    {isApproved ? "Approved" : "Approve"}
                  </button>
                  <button 
                    onClick={deposit} 
                    disabled={!isApproved}
                    style={{
                      cursor: isApproved ? 'pointer' : 'not-allowed',
                      opacity: isApproved ? 1 : 0.5,
                      backgroundColor: isApproved ? '#4a5568' : '#cbd5e0',
                      color: isApproved ? 'white' : '#718096',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      border: 'none',
                      transition: 'background-color 0.3s'
                    }}
                  >
                    Deposit
                  </button>                </>
              )}
              {chain?.id === base.id && (
                <button onClick={withdraw}>Withdraw</button>
              )}
            </div>
          ) : (
            <p>No ICNT available</p>
          )}
          <button onClick={handleSwitchChain}>
            {getSwitchNetworkButtonText()}
          </button>
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
  );
};

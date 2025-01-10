/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { AlertCircle, ArrowRight, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "./glass-card";

const ADDRESSES = {
  //op
  weth: "0x4200000000000000000000000000000000000006",
  acrossOP: "0x4e8E101924eDE233C13e2D8622DC8aED2872d505",
  generateMessage: "0x8567f1ae02dc151eba08cf50225f2e25ba176667",
  
  //arb
  //   uniswapPositionManager: "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2",
  multicallHandler: "0x924a9f036260DdD5808007E1AA95f08eD08aA569",
  aave: "0x82405D1a189bd6cE4667809C35B37fBE136A4c5B",
  arbitrumChainId: "421614",
  acrossArb: "0x7E63A5f1a8F0B4d0934B2f2327DAED3F6bb2ee75",
    arbWeth: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
};

const MESSAGE_GENERATOR_ABI = [
  "function generateMessageForMulticallHandler(address userAddress,address aavePool,uint256 depositAmount,address depositCurrency,uint16 aaveReferralCode) external pure returns (bytes memory)",
];

export default function Liquidity() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState<string>("0");
  const [fetchingBalance, setFetchingBalance] = useState(false);

  //   const TICK_SPACING = 60
  //   const currentTick = 0 // Should fetch current pool tick
  //   const tickLower = Math.floor(currentTick / TICK_SPACING) * TICK_SPACING - TICK_SPACING
  //   const tickUpper = Math.floor(currentTick / TICK_SPACING) * TICK_SPACING + TICK_SPACING

  async function getwethBalance() {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed");
      return;
    }

    try {
      setFetchingBalance(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log(provider);
      const wethContract = new ethers.Contract(
        ADDRESSES.weth,
        ["function balanceOf(address) view returns (uint256)"],
        provider
      );
      const signer = provider.getSigner();
      const address = (await signer).getAddress();
      const balanceWei = await wethContract.balanceOf(address);
      const balanceweth = ethers.formatUnits(balanceWei, 18); // weth has 18 decimals
      setBalance(balanceweth);
    } catch (error) {
      console.error("Error fetching weth balance:", error);
      setBalance("0");
      setError("Failed to fetch weth balance");
    } finally {
      setFetchingBalance(false);
    }
  }

  

  useEffect(() => {
    if (connected) {
      getwethBalance();
    }
  }, [connected]);

  async function connectWallet() {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      setConnected(true);
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Failed to connect wallet");
    }
  }

  function handleMaxAmount() {
    setAmount(balance);
  }

  async function addLiquidity() {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      setError("Insufficient weth balance");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = (await signer).getAddress();

      const generateMessage = new ethers.Contract(
          ADDRESSES.generateMessage,
          MESSAGE_GENERATOR_ABI,
          await signer
      );

      const amountIn = ethers.parseUnits(amount, 18); // weth has 18 decimals
     
        const message = await generateMessage.generateMessageForMulticallHandler(
          userAddress,
          ADDRESSES.aave,
          amountIn,
          ADDRESSES.weth,
          0
        );

        console.log("message", message+"1dc0de");

      const quoteResponse = await fetch(
        `https://testnet.across.to/api/suggested-fees?${new URLSearchParams(
          {
            inputToken: ADDRESSES.weth,
            inputAmount: amountIn.toString(),
            outputToken: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
            destinationChainId: ADDRESSES.arbitrumChainId,
            recipient: ADDRESSES.multicallHandler,
          }
        )}`
      );
      const quote = await quoteResponse.json();
      console.log(quote);

      const acrossArbContract = new ethers.Contract(
        ADDRESSES.acrossArb,
        [
          "function depositV3(address,address,address,address,uint256,uint256,uint256,address,uint256,uint256,uint256,bytes) payable",
        ],
        await signer
      );
      //   message = message+toB
      const tx = await acrossArbContract.depositV3(
        userAddress,
        ADDRESSES.multicallHandler,
        ADDRESSES.weth,
        ADDRESSES.arbWeth,
        amountIn,
        quote.outputAmount,
        ADDRESSES.arbitrumChainId,
        ethers.ZeroAddress,
        quote.quoteTimestamp,
        quote.fillDeadline,
        0,
        message
      );

      await tx.wait();
      setSuccess(true);
      getwethBalance(); // Refresh balance after successful liquidity addition
    } catch (error) {
      console.error(error);
      setError("Error adding liquidity. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <div className="w-full bg-white/5 backdrop-blur-sm">
        
      </div>

      <div className="container mx-auto max-w-lg px-4 py-12">
        <GlassCard className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Cross-chain Aave Deposit
            </h2>
            <p className="text-sm text-gray-400">
              Add Weth liquidity from Optimism to Arbitrum
            </p>
          </div>

          {connected ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-200">
                    Weth Amount
                  </label>
                  <span className="flex items-center gap-2 text-xs text-gray-400">
                    {fetchingBalance ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>Balance: {parseFloat(balance).toFixed(2)} weth</>
                    )}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    min="0"
                    step="0.01"
                    className="h-14 border-white/10 bg-white/5 px-4 pr-24 text-lg backdrop-blur-xl placeholder:text-gray-500"
                  />
                  <div className="absolute right-2 top-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleMaxAmount}
                      className="h-10 bg-white/10 text-xs font-semibold text-emerald-400 hover:bg-white/20"
                      disabled={fetchingBalance || parseFloat(balance) <= 0}
                    >
                      MAX
                    </Button>
                  </div>
                  <span className="absolute right-20 top-4 text-sm font-medium text-gray-400">
                    weth
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-white/5 p-4 text-sm">
                <h3 className="mb-2 font-semibold">Liquidity Range</h3>
                {/* <p className="text-gray-400">
                  Your liquidity will be added within ±{TICK_SPACING / 100}% of the current price.
                </p> */}
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-400">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <p>
                      Liquidity addition initiated! Your position will be
                      created on Optimism soon.
                    </p>
                  </div>
                </div>
              )}

              <Button
                className="h-14 w-full bg-gradient-to-r from-emerald-600 to-emerald-400 text-base font-medium hover:from-emerald-500 hover:to-emerald-300"
                onClick={addLiquidity}
                disabled={
                  loading ||
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  parseFloat(amount) > parseFloat(balance)
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adding Liquidity
                  </>
                ) : (
                  <>
                    Add Liquidity
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              className="h-14 w-full bg-gradient-to-r from-emerald-600 to-emerald-400 text-base font-medium hover:from-emerald-500 hover:to-emerald-300"
              onClick={connectWallet}
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>
          )}
        </GlassCard>

      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function TokenForm() {
  const { connected, account } = useWallet();
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState("");
  const [tokenSupply, setTokenSupply] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    setIsDeploying(true);

    try {
      const response = await fetch("http://localhost:3001/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: tokenName,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          supply: tokenSupply,
          ownerAddress: account.address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Deployment successful! Transaction: ${data.transaction}`);
      } else {
        alert(`Deployment failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Deployment error:", error);
      alert("An error occurred during deployment. Check the console for details.");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div>
      <h2>Create Fungible Token</h2>
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          placeholder="e.g., MyToken"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Symbol</label>
        <input
          type="text"
          placeholder="e.g., MYT"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Decimals</label>
        <input
          type="number"
          placeholder="e.g., 6"
          value={tokenDecimals}
          onChange={(e) => setTokenDecimals(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Initial Supply</label>
        <input
          type="number"
          placeholder="e.g., 1000000"
          value={tokenSupply}
          onChange={(e) => setTokenSupply(e.target.value)}
        />
      </div>
      <button className="primary" onClick={handleDeploy} disabled={isDeploying}>
        {isDeploying ? "Deploying..." : "Deploy Token"}
      </button>
    </div>
  );
}

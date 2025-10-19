import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function StakingForm() {
  const { connected } = useWallet();
  const [tokenModuleAddress, setTokenModuleAddress] = useState("");

  const handleDeploy = async () => {
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    const stakingData = {
      tokenModuleAddress,
    };

    console.log("Deploying staking contract with data:", stakingData);
    alert("Check the console for the staking data. Backend integration is the next step.");
    // TODO: Send this data to the backend for deployment
  };

  return (
    <div>
      <h2>Create Staking Contract</h2>
      <div className="form-group">
        <label>Token Module Address</label>
        <input
          type="text"
          placeholder="Enter the address of the token to be staked"
          value={tokenModuleAddress}
          onChange={(e) => setTokenModuleAddress(e.target.value)}
        />
      </div>
      <button className="primary" onClick={handleDeploy}>Deploy Staking Contract</button>
    </div>
  );
}

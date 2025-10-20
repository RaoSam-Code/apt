import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function DAOForm() {
  const { connected, account } = useWallet();
  const [daoName, setDaoName] = useState("");
  const [proposalDelay, setProposalDelay] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    setIsDeploying(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/deploy-dao`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: daoName,
          delay: proposalDelay,
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
      <h2>Create DAO</h2>
      <div className="form-group">
        <label>DAO Name</label>
        <input
          type="text"
          placeholder="e.g., My DAO"
          value={daoName}
          onChange={(e) => setDaoName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Proposal Creation Delay (seconds)</label>
        <input
          type="number"
          placeholder="e.g., 86400"
          value={proposalDelay}
          onChange={(e) => setProposalDelay(e.target.value)}
        />
      </div>
      <button className="primary" onClick={handleDeploy} disabled={isDeploying}>
        {isDeploying ? "Deploying..." : "Deploy DAO"}
      </button>
    </div>
  );
}

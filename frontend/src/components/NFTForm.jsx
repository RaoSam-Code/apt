import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function NFTForm() {
  const { connected, account } = useWallet();
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [collectionUri, setCollectionUri] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    setIsDeploying(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/deploy-nft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: collectionName,
          description: collectionDescription,
          uri: collectionUri,
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
      <h2>Create NFT Collection</h2>
      <div className="form-group">
        <label>Collection Name</label>
        <input
          type="text"
          placeholder="e.g., My NFT Collection"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          placeholder="e.g., A collection of my favorite NFTs"
          value={collectionDescription}
          onChange={(e) => setCollectionDescription(e.g.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Collection URI</label>
        <input
          type="text"
          placeholder="e.g., https://my-nft-collection.com"
          value={collectionUri}
          onChange={(e) => setCollectionUri(e.target.value)}
        />
      </div>
      <button className="primary" onClick={handleDeploy} disabled={isDeploying}>
        {isDeploying ? "Deploying..." : "Deploy NFT Collection"}
      </button>
    </div>
  );
}

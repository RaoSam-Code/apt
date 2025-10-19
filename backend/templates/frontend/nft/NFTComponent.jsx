import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from "aptos";

const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");
const MODULE_ADDRESS = "{{MODULE_ADDRESS}}";

export default function NFTComponent() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [tokenUri, setTokenUri] = useState("");

  const handleMint = async () => {
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::my_nft::mint`,
      type_arguments: [],
      arguments: [tokenName, tokenDescription, tokenUri],
    };
    await signAndSubmitTransaction({ payload });
  };

  return (
    <div>
      <h2>{{COLLECTION_NAME}}</h2>
      <div className="form-group">
        <label>Token Name</label>
        <input
          type="text"
          placeholder="e.g., My First NFT"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Token Description</label>
        <input
          type="text"
          placeholder="e.g., A description of my NFT"
          value={tokenDescription}
          onChange={(e) => setTokenDescription(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Token URI</label>
        <input
          type="text"
          placeholder="e.g., https://my-nft.com/metadata.json"
          value={tokenUri}
          onChange={(e) => setTokenUri(e.target.value)}
        />
      </div>
      <button onClick={handleMint}>Mint NFT</button>
    </div>
  );
}

import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from "aptos";

const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");
const MODULE_ADDRESS = "{{MODULE_ADDRESS}}";

export default function DAOComponent() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [proposalHash, setProposalHash] = useState("");
  const [proposalId, setProposalId] = useState("");
  const [vote, setVote] = useState(false);

  const handleCreateProposal = async () => {
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::my_dao::create_proposal`,
      type_arguments: [],
      arguments: [proposalHash],
    };
    await signAndSubmitTransaction({ payload });
  };

  const handleVote = async () => {
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::my_dao::vote`,
      type_arguments: [],
      arguments: [proposalId, vote],
    };
    await signAndSubmitTransaction({ payload });
  };

  return (
    <div>
      <h2>{{DAO_NAME}}</h2>
      <div className="form-group">
        <h3>Create Proposal</h3>
        <label>Execution Hash</label>
        <input
          type="text"
          placeholder="e.g., 0x123..."
          value={proposalHash}
          onChange={(e) => setProposalHash(e.target.value)}
        />
        <button onClick={handleCreateProposal}>Create Proposal</button>
      </div>
      <div className="form-group">
        <h3>Vote on Proposal</h3>
        <label>Proposal ID</label>
        <input
          type="number"
          placeholder="e.g., 1"
          value={proposalId}
          onChange={(e) => setProposalId(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={vote}
            onChange={(e) => setVote(e.target.checked)}
          />
          Approve
        </label>
        <button onClick={handleVote}>Vote</button>
      </div>
    </div>
  );
}

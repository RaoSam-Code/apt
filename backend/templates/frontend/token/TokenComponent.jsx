import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from "aptos";

const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");
const MODULE_ADDRESS = "{{MODULE_ADDRESS}}";

export default function TokenComponent() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [amount, setAmount] = useState("");

  const handleMint = async () => {
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::my_token::mint`,
      type_arguments: [],
      arguments: [account.address, amount],
    };
    await signAndSubmitTransaction({ payload });
  };

  return (
    <div>
      <h2>{{TOKEN_NAME}} ({{TOKEN_SYMBOL}})</h2>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleMint}>Mint</button>
    </div>
  );
}

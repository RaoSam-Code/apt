import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from "aptos";

const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");

export default function BalanceChecker() {
  const { account, connected } = useWallet();
  const [balance, setBalance] = useState(null);
  const [moduleAddress, setModuleAddress] = useState("");

  const fetchBalance = async () => {
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!moduleAddress) {
      alert("Please enter a module address");
      return;
    }

    try {
      const coinStore = await client.getAccountResource(
        account.address,
        `0x1::coin::CoinStore<${moduleAddress}::my_token::MyToken>`
      );

      setBalance(coinStore.data.coin.value);
    } catch (err) {
      console.error("Error fetching balance:", err);
      alert("Could not fetch balance. Make sure the module address is correct.");
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Check Token Balance</h3>
      <div className="form-group">
        <label>Module Address</label>
        <input
          type="text"
          placeholder="Enter module address"
          value={moduleAddress}
          onChange={(e) => setModuleAddress(e.target.value)}
        />
      </div>
      <button onClick={fetchBalance} className="primary">Get Balance</button>
      {balance !== null && <p>Your balance: {balance}</p>}
    </div>
  );
}

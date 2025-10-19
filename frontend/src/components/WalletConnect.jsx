import React from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function WalletConnect() {
  const { connect, disconnect, account, connected } = useWallet();

  return (
    <div style={{ marginBottom: "20px" }}>
      {connected ? (
        <div>
          <p>Connected: {account?.address?.toString()}</p>
          <button className="danger" onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button className="primary" onClick={() => connect("Petra")}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}

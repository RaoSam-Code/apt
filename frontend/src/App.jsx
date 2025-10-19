import React, { useState } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import WalletConnect from "./components/WalletConnect";
import TokenForm from "./components/TokenForm";
import NFTForm from "./components/NFTForm";
import DAOForm from "./components/DAOForm";
import StakingForm from "./components/StakingForm";
import BalanceChecker from "./components/BalanceChecker";
import Dashboard from "./components/Dashboard";
import VisualBuilder from "./components/VisualBuilder";

function App() {
  const wallets = [new PetraWallet(), new MartianWallet(), new FewchaWallet()];
  const [activeTab, setActiveTab] = useState("token");
  const [isVisualBuilder, setIsVisualBuilder] = useState(true);

  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <div className="container">
        <h1>No-Code Aptos dApp Builder</h1>
        <WalletConnect />

        <div className="builder-toggle">
          <label>
            <input
              type="checkbox"
              checked={isVisualBuilder}
              onChange={() => setIsVisualBuilder(!isVisualBuilder)}
            />
            Visual Builder
          </label>
        </div>

        {isVisualBuilder ? (
          <VisualBuilder />
        ) : (
          <>
            <div className="tabs">
              <button onClick={() => setActiveTab("token")} className={activeTab === "token" ? "active" : ""}>
                Fungible Token
              </button>
              <button onClick={() => setActiveTab("nft")} className={activeTab === "nft" ? "active" : ""}>
                NFT Collection
              </button>
              <button onClick={() => setActiveTab("dao")} className={activeTab === "dao" ? "active" : ""}>
                DAO
              </button>
              <button onClick={() => setActiveTab("staking")} className={activeTab === "staking" ? "active" : ""}>
                Staking
              </button>
            </div>

            <div className="tab-content">
              {activeTab === "token" && <TokenForm />}
              {activeTab === "nft" && <NFTForm />}
              {activeTab === "dao" && <DAOForm />}
              {activeTab === "staking" && <StakingForm />}
            </div>
          </>
        )}

        <BalanceChecker />
        <Dashboard />
      </div>
    </AptosWalletAdapterProvider>
  );
}

export default App;

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
import logo from "./assets/logo.svg"; // Import the logo SVG

function App() {
  const wallets = [new PetraWallet(), new MartianWallet(), new FewchaWallet()];
  const [activeTab, setActiveTab] = useState("token");
  const [isVisualBuilder, setIsVisualBuilder] = useState(true);

  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <div className="app-wrapper"> {/* New wrapper for full page */}
        <header className="app-header">
          <div className="logo-container">
            <img src={logo} className="app-logo" alt="logo" />
            <h1>Aptos dApp Builder</h1>
          </div>
          <WalletConnect />
        </header>

        <div className="container"> {/* Main content container */}
          <h2 className="text-center">No-Code Visual Builder</h2>

          <div className="builder-toggle">
            <label>
              <input
                type="checkbox"
                checked={isVisualBuilder}
                onChange={() => setIsVisualBuilder(!isVisualBuilder)}
              />
              Visual Builder Mode
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

          <div className="form-section mt-4">
            <BalanceChecker />
          </div>

          <div className="form-section mt-4">
            <Dashboard />
          </div>
        </div>
      </div>
    </AptosWalletAdapterProvider>
  );
}

export default App;

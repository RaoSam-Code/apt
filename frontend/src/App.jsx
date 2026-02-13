import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import Layout from './components/Layout';
import { BuilderProvider } from './context/BuilderContext';

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";

function App() {
  const wallets = [new PetraWallet(), new MartianWallet(), new FewchaWallet()];

  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <ReactFlowProvider>
        <BuilderProvider>
          <Layout />
        </BuilderProvider>
      </ReactFlowProvider>
    </AptosWalletAdapterProvider>
  );
}

export default App;

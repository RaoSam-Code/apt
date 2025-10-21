import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import Draggable from './Draggable';
import Droppable from './Droppable';

const templates = [
  "Fungible Token", "NFT Collection", "DAO", "Staking", "Vesting Contract", "Yield Farm", "Liquidity Pool", "Lottery", "Escrow", "Multi-sig Wallet",
  "Crowdsale", "Auction", "Governance Token", "Utility Token", "Security Token", "Stablecoin", "Wrapped Asset", "Decentralized Exchange (DEX)", "Automated Market Maker (AMM)", "Lending Protocol",
  "Borrowing Protocol", "Insurance Protocol", "Prediction Market", "Identity Management", "Reputation System", "Voting System", "Registry", "Notary", "Time-locking", "Asset Tokenization",
  "Real Estate Token", "Art Token", "Music NFT", "Gaming NFT", "Collectible NFT", "Domain Name Service", "Decentralized Storage", "Decentralized Cloud Computing", "Social Media Platform", "Messaging App",
  "Supply Chain Management", "Healthcare Records", "Digital Will", "Charity/Donation System", "Subscription Service", "Loyalty Program", "Ticketing System", "Coupon System", "Referral Program", "Affiliate Program",
  "Bounty Program", "Job Market", "Freelance Platform", "Review System", "Decentralized Identity", "Know Your Customer (KYC)", "Anti-Money Laundering (AML)", "Credit Scoring", "Microloans",
  "Peer-to-Peer Lending", "Index Fund", "Portfolio Management", "Asset Management", "Derivatives Trading", "Options Trading", "Futures Trading", "Synthetic Assets", "Oracles", "Bridges",
  "Cross-chain Swaps", "Layer 2 Scaling", "State Channels", "Sidechains", "Plasma", "Rollups", "Zero-knowledge Proofs", "Privacy Coin", "Mixer", "Confidential Transactions",
  "Decentralized Autonomous Organization (DAO) Tooling", "Proposal Management", "Treasury Management", "Token Curated Registry", "Flash Loans", "Rebalancing Pool", "Impermanent Loss Protection", "NFT Marketplace", "NFT Minting", "NFT Fractionalization",
  "NFT Lending", "NFT Staking", "Generative Art", "Interactive NFT", "Dynamic NFT", "Music Streaming", "Video Streaming", "Decentralized Science (DeSci)", "Research Funding", "Intellectual Property (IP) Management"
];

export default function VisualBuilder() {
  const { connected, account } = useWallet();
  const [droppedItems, setDroppedItems] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDragEnd = (event) => {
    if (event.over) {
      setDroppedItems((prev) => [...prev, event.active.id]);
    }
  };

  const handleDeploy = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    setIsDeploying(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/deploy-visual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          components: droppedItems,
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
      console.error('Deployment error:', error);
      alert('An error occurred during deployment. Check the console for details.');
    } finally {
      setIsDeploying(false);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="visual-builder">
        <div className="sidebar">
          <h3>Components</h3>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar"
          />
          {filteredTemplates.map(template => (
            <Draggable key={template} id={template}>
              <div className="draggable-item">{template}</div>
            </Draggable>
          ))}
        </div>
        <Droppable id="canvas">
          <div className="canvas">
            <h3>Canvas</h3>
            {droppedItems.map((item, index) => (
              <div key={index} className="dropped-item">
                {item}
              </div>
            ))}
          </div>
        </Droppable>
      </div>
      <button className="primary" onClick={handleDeploy} disabled={isDeploying}>
        {isDeploying ? 'Deploying...' : 'Deploy Contract'}
      </button>
    </DndContext>
  );
}

import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import Draggable from './Draggable';
import Droppable from './Droppable';

export default function VisualBuilder() {
  const { connected, account } = useWallet();
  const [droppedItems, setDroppedItems] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);

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
      const response = await fetch('http://localhost:3001/deploy-visual', {
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

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="visual-builder">
        <div className="sidebar">
          <h3>Components</h3>
          <Draggable id="Fungible Token">
            <div className="draggable-item">Fungible Token</div>
          </Draggable>
          <Draggable id="NFT Collection">
            <div className="draggable-item">NFT Collection</div>
          </Draggable>
          <Draggable id="DAO">
            <div className="draggable-item">DAO</div>
          </Draggable>
          <Draggable id="Staking">
            <div className="draggable-item">Staking</div>
          </Draggable>
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

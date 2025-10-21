import React, { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function Dashboard() {
  const { connected, account } = useWallet();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (connected) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/projects/${account.address}`)
        .then((res) => res.json())
        .then((data) => setProjects(data))
        .catch((err) => console.error("Error fetching projects:", err));
    }
  }, [connected, account]);

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>My Deployed dApps</h3>
      {projects.length > 0 ? (
        <ul className="dashboard-list">
          {projects.map((project) => (
            <li key={project.id}>
              <strong>{project.name}</strong> ({project.type}) -{" "}
              <a
                href={`https://explorer.aptoslabs.com/txn/${project.transactionHash}?network=testnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Transaction
              </a>
              <button 
                className="primary"
                onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL}/generate-frontend/${project.id}`}
              >
                Download Frontend
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't deployed any dApps yet.</p>
      )}
    </div>
  );
}

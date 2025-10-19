# No-Code Aptos dApp Builder

A web platform where non-technical users can visually configure and deploy Aptos dApps (tokens, NFTs, DAOs) without writing Move code or using the CLI.

## Architecture

- **Frontend**: React + Vite
- **Backend**: Node.js/Express
- **Blockchain**: Aptos testnet
- **Database**: SQLite

## Features

- **Authentication & Wallet**: Connect Aptos wallets (Petra, Martian, Fewcha).
- **Visual Builder**: Form-based UI for fungible tokens, NFTs, and DAOs.
- **Smart Contract Templates**: Pre-built Move modules with placeholders.
- **Frontend Generator**: Auto-generate React components for interacting with deployed contracts.
- **Dashboard**: List all deployed dApps per user.

## Setup Instructions

1.  **Prerequisites**:
    -   Node.js (v16 or later)
    -   npm
    -   Aptos CLI

2.  **Installation**:
    -   Clone the repository.
    -   Install frontend dependencies: `cd frontend && npm install`
    -   Install backend dependencies: `cd backend && npm install`

## How to Run Locally

1.  **Open a new terminal** and start the backend server:
    ```powershell
    cd backend
    npm start
    ```
2.  **Open a second terminal** and start the frontend development server:
    ```powershell
    cd frontend
    npm run dev
    ```
3.  Open your browser and navigate to `http://localhost:5173` (or the address shown in the frontend terminal).

## How to Deploy to Testnet

1.  Connect your Aptos wallet.
2.  Fill out the form for the dApp you want to create.
3.  Click the "Deploy" button.
4.  Approve the transaction in your wallet.
5.  The dApp will be deployed to the Aptos testnet.

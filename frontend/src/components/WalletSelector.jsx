import React, { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Wallet, ChevronDown, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WalletSelector() {
    const { connected, account, connect, disconnect, wallets } = useWallet();
    const [isOpen, setIsOpen] = useState(false);

    const handleConnect = (walletName) => {
        connect(walletName);
        setIsOpen(false);
    };

    const handleDisconnect = () => {
        disconnect();
        setIsOpen(false);
    };

    if (connected && account) {
        return (
            <div className="wallet-container">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="btn btn-ghost"
                    style={{ border: '1px solid var(--border-color)' }}
                >
                    <Wallet style={{ width: '16px', height: '16px', color: 'var(--primary)' }} />
                    <span className="text-sm font-mono">
                        {account?.address?.toString()?.slice(0, 6)}...{account?.address?.toString()?.slice(-4)}
                    </span>
                    <ChevronDown style={{ width: '12px', height: '12px', color: 'var(--text-muted)' }} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="wallet-dropdown"
                        >
                            <button
                                onClick={handleDisconnect}
                                className="wallet-item"
                                style={{ color: 'var(--danger)' }}
                            >
                                <LogOut style={{ width: '16px', height: '16px' }} />
                                Disconnect
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="wallet-container">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-ghost"
            >
                <Wallet style={{ width: '16px', height: '16px' }} />
                Connect Wallet
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="wallet-dropdown"
                        style={{ width: '250px' }}
                    >
                        <div className="text-xs font-semibold uppercase text-muted mb-2 px-2" style={{ letterSpacing: '0.05em' }}>
                            Select Wallet
                        </div>
                        {wallets?.map((wallet) => (
                            <button
                                key={wallet.name}
                                onClick={() => handleConnect(wallet.name)}
                                className="wallet-item"
                            >
                                <img src={wallet.icon} alt={wallet.name} className="rounded-full" style={{ width: '20px', height: '20px' }} />
                                <span className="font-medium">{wallet.name}</span>
                                {wallet.readyState === 'Installed' && (
                                    <span style={{
                                        marginLeft: 'auto',
                                        fontSize: '10px',
                                        background: 'rgba(34, 197, 94, 0.1)',
                                        color: 'var(--success)',
                                        padding: '0.125rem 0.375rem',
                                        borderRadius: '4px'
                                    }}>
                                        Detected
                                    </span>
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

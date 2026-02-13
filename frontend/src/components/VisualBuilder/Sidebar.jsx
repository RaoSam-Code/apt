import React from 'react';
import { Box, Coins, Vote, Layers, Lock, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
    const NodeConfig = [
        { type: 'module', label: 'Token', icon: Coins, color: 'text-blue-400' },
        { type: 'module', label: 'NFT Collection', icon: Layers, color: 'text-purple-400' },
        { type: 'module', label: 'DAO', icon: Vote, color: 'text-green-400' },
        { type: 'module', label: 'Staking', icon: Lock, color: 'text-orange-400' },
    ];

    const onDragStart = (event, nodeType, label) => {
        event.dataTransfer.setData('application/reactflow/type', nodeType);
        event.dataTransfer.setData('application/reactflow/label', label);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="sidebar">
            <div className="text-xs font-semibold uppercase text-muted mb-4" style={{ letterSpacing: '0.05em' }}>
                Components
            </div>
            <div className="flex flex-col gap-2">
                {NodeConfig.map((node) => (
                    <motion.div
                        key={node.label}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className="sidebar-item"
                        onDragStart={(event) => onDragStart(event, node.type, node.label)}
                        draggable
                    >
                        <node.icon style={{ width: '18px', height: '18px' }} className={node.color} />
                        <span className="text-sm font-medium">{node.label}</span>
                    </motion.div>
                ))}
            </div>

            <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <h4 className="text-sm font-bold text-primary" style={{ marginBottom: '0.25rem' }}>AI Assistant</h4>
                <p className="text-xs text-muted">
                    Drag nodes or ask AI to build for you.
                </p>
            </div>
        </aside>
    );
}

import React from 'react';
import FlowBuilder from './VisualBuilder/FlowBuilder';
import ChatInterface from './AIAssistant/ChatInterface';
import NodeConfigModal from './VisualBuilder/NodeConfigModal';
import WalletSelector from './WalletSelector';
import { Sparkles } from 'lucide-react';

import { useBuilder } from '../context/BuilderContext';

export default function Layout() {
    const { deployProject, isDeploying } = useBuilder();
    return (
        <div className="app-container">
            {/* Header */}
            <header className="header">
                <div className="flex items-center gap-2">
                    <div className="glass-panel p-2 rounded-lg display-flex items-center justify-center">
                        <Sparkles style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
                    </div>
                    <span className="font-bold text-lg" style={{ background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Aptos Builder
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <WalletSelector />
                    <button
                        onClick={deployProject}
                        disabled={isDeploying}
                        className="btn btn-primary">
                        {isDeploying ? 'Deploying...' : 'Deploy'}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <FlowBuilder />
                <ChatInterface />
                <NodeConfigModal />
            </main>
        </div>
    );
}

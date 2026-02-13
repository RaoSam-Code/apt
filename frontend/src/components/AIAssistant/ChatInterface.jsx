import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles } from 'lucide-react';

export default function ChatInterface() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, role: 'assistant', text: "Hi! I'm your AI assistant. Tell me what kind of dApp you want to build, and I'll help you create it." }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Mock AI response for now
        setTimeout(() => {
            const aiMsg = { id: Date.now() + 1, role: 'assistant', text: "This is a placeholder response. In the future, I will generate nodes for you!" };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    return (
        <div className="fixed z-50 flex flex-col items-end" style={{ bottom: '1.5rem', right: '1.5rem' }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="chat-container"
                    >
                        {/* Header */}
                        <div className="chat-header">
                            <div className="flex items-center gap-2">
                                <div className="glass-panel p-2 rounded-lg display-flex items-center justify-center">
                                    <Bot style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">AI Architect</h3>
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        <span className="rounded-full" style={{ width: '6px', height: '6px', background: '#4ade80', animation: 'pulse 2s infinite' }} />
                                        Online
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="btn-icon">
                                <X style={{ width: '16px', height: '16px' }} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="chat-messages">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-ai'}`}
                                >
                                    {msg.text}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="chat-input-area">
                            <input
                                type="text"
                                placeholder="Describe your dApp..."
                                className="input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="btn btn-primary"
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
                            >
                                <Send style={{ width: '16px', height: '16px' }} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="btn-primary"
                style={{
                    padding: '1rem',
                    borderRadius: '50%',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {isOpen ? <X style={{ width: '24px', height: '24px' }} /> : <Sparkles style={{ width: '24px', height: '24px' }} />}
            </motion.button>
        </div>
    );
}

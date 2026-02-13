import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';

export default function NodeConfigModal() {
    const { selectedNode, setSelectedNode, updateNodeData } = useBuilder();
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (selectedNode) {
            setFormData(selectedNode.data || {});
        }
    }, [selectedNode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        if (selectedNode) {
            updateNodeData(selectedNode.id, formData);
            setSelectedNode(null);
        }
    };

    return (
        <AnimatePresence>
            {selectedNode && (
                <div className="modal-overlay" onClick={() => setSelectedNode(null)}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3 className="font-semibold text-lg">Configure {selectedNode.type}</h3>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="btn-icon"
                            >
                                <X style={{ width: '20px', height: '20px' }} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label className="label">Label</label>
                                <input
                                    type="text"
                                    name="label"
                                    value={formData.label || ''}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>

                            {/* Common Fields */}
                            <div className="form-group">
                                <label className="label">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>

                            {/* Token Specific */}
                            {(selectedNode.data.label === 'Token' || selectedNode.data.label === 'My Token') && (
                                <>
                                    <div className="flex gap-4">
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label className="label">Symbol</label>
                                            <input
                                                type="text"
                                                name="symbol"
                                                value={formData.symbol || ''}
                                                onChange={handleChange}
                                                className="input"
                                            />
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label className="label">Decimals</label>
                                            <input
                                                type="number"
                                                name="decimals"
                                                value={formData.decimals || 8}
                                                onChange={handleChange}
                                                className="input"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Initial Supply</label>
                                        <input
                                            type="number"
                                            name="initial_supply"
                                            value={formData.initial_supply || 1000000}
                                            onChange={handleChange}
                                            className="input"
                                        />
                                    </div>
                                </>
                            )}

                            {/* NFT Specific */}
                            {selectedNode.data.label === 'NFT Collection' && (
                                <>
                                    <div className="form-group">
                                        <label className="label">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description || ''}
                                            onChange={handleChange}
                                            className="textarea"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">URI</label>
                                        <input
                                            type="text"
                                            name="uri"
                                            value={formData.uri || ''}
                                            onChange={handleChange}
                                            className="input"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label className="label">Max Supply</label>
                                            <input
                                                type="number"
                                                name="max_supply"
                                                value={formData.max_supply || 1000}
                                                onChange={handleChange}
                                                className="input"
                                            />
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label className="label">Royalty (%)</label>
                                            <input
                                                type="number"
                                                name="royalty_percentage"
                                                value={formData.royalty_percentage || 5}
                                                onChange={handleChange}
                                                className="input"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* DAO Specific */}
                            {selectedNode.data.label === 'DAO' && (
                                <>
                                    <div className="flex gap-4">
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label className="label">Voting Delay (s)</label>
                                            <input
                                                type="number"
                                                name="voting_delay"
                                                value={formData.voting_delay || 86400}
                                                onChange={handleChange}
                                                className="input"
                                            />
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label className="label">Voting Duration (s)</label>
                                            <input
                                                type="number"
                                                name="voting_duration"
                                                value={formData.voting_duration || 86400}
                                                onChange={handleChange}
                                                className="input"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Min Proposal Threshold</label>
                                        <input
                                            type="number"
                                            name="proposal_threshold"
                                            value={formData.proposal_threshold || 100}
                                            onChange={handleChange}
                                            className="input"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn btn-primary"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}


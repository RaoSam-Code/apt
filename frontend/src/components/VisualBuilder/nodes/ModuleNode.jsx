import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export default memo(({ data, isConnectable }) => {
    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
            style={{
                background: 'var(--bg-card)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                minWidth: '200px',
                overflow: 'hidden'
            }}
        >
            <div className="node-header">
                <div className="flex items-center gap-2">
                    <Box style={{ width: '16px', height: '16px', color: 'var(--primary)' }} />
                    <span className="text-sm font-semibold">{data.label}</span>
                </div>
                <Settings style={{ width: '16px', height: '16px', color: 'var(--text-muted)', cursor: 'pointer' }} />
            </div>
            <div className="node-body">
                <div className="text-sm" style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Module Config</div>

                {/* Input handles */}
                <div className="relative mb-2">
                    <Handle
                        type="target"
                        position={Position.Left}
                        isConnectable={isConnectable}
                        style={{
                            width: '12px',
                            height: '12px',
                            background: 'var(--primary)',
                            border: '2px solid var(--bg-primary)'
                        }}
                    />
                    <span className="text-sm" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>Dependencies</span>
                </div>

                {/* Output handles */}
                <div className="relative flex" style={{ justifyContent: 'flex-end' }}>
                    <span className="text-sm" style={{ marginRight: '0.5rem', fontSize: '0.75rem' }}>Exports</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        isConnectable={isConnectable}
                        style={{
                            width: '12px',
                            height: '12px',
                            background: 'var(--accent)',
                            border: '2px solid var(--bg-primary)'
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
});

import React, { useState, useRef, useCallback, useMemo } from 'react';
import ReactFlow, {
    Controls,
    Background,
    MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from './Sidebar';
import ModuleNode from './nodes/ModuleNode';
import { useBuilder } from '../../context/BuilderContext';



let id = 0;
const getId = () => `dndnode_${id++}`;

const nodeTypes = { module: ModuleNode };

export default function FlowBuilder() {
    // const nodeTypes = useMemo(() => ({ module: ModuleNode }), []); // Moved outside
    const reactFlowWrapper = useRef(null);
    const {
        nodes,
        onNodesChange,
        edges,
        onEdgesChange,
        onConnect,
        setNodes,
        setSelectedNode
    } = useBuilder();

    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow/type');
            const label = event.dataTransfer.getData('application/reactflow/label');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            let defaultData = { label: label };
            if (label === 'Token') defaultData = { ...defaultData, name: 'My Token', symbol: 'MYT' };
            if (label === 'NFT Collection') defaultData = { ...defaultData, name: 'My Collection', description: 'Description', uri: 'https://...' };
            if (label === 'DAO') defaultData = { ...defaultData, name: 'My DAO', delay: 86400 };

            const newNode = {
                id: getId(),
                type,
                position,
                data: defaultData,
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    return (
        <div className="flex h-full w-full absolute inset-0">
            <Sidebar />
            <div className="h-full relative" style={{ flexGrow: 1 }} ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={(_, node) => setSelectedNode(node)}
                    nodeTypes={nodeTypes}
                    fitView
                    style={{ background: 'var(--bg-dark)' }}
                >
                    <Controls className="glass-panel" style={{ color: 'var(--text-main)', borderRadius: '8px', overflow: 'hidden' }} />
                    <MiniMap
                        nodeStrokeColor={(n) => {
                            if (n.style?.background) return n.style.background;
                            if (n.type === 'module') return '#3b82f6';
                            return '#eee';
                        }}
                        nodeColor={(n) => {
                            if (n.style?.background) return n.style.background;
                            return '#1e1e1e';
                        }}
                        maskColor="rgba(0, 0, 0, 0.4)"
                        className="glass-panel"
                        style={{ borderRadius: '8px' }}
                    />
                    <Background color="#444" gap={16} />
                </ReactFlow>
            </div>
        </div>
    );
}

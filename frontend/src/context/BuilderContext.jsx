import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNodesState, useEdgesState, addEdge } from 'reactflow';

const BuilderContext = createContext();

export const useBuilder = () => useContext(BuilderContext);

export const BuilderProvider = ({ children }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isDeploying, setIsDeploying] = useState(false);

    const [selectedNode, setSelectedNode] = useState(null);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const updateNodeData = (nodeId, newData) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, data: { ...node.data, ...newData } };
                }
                return node;
            })
        );
    };

    const deployProject = async () => {
        setIsDeploying(true);
        try {
            const graphData = {
                nodes: nodes.map(n => ({ id: n.id, type: n.type, data: n.data })),
                edges: edges.map(e => ({ source: e.source, target: e.target }))
            };

            const response = await fetch('http://localhost:3001/deploy-graph', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    graph: graphData,
                    ownerAddress: "0x123...test" // TODO: Get from wallet adapter
                }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Deployed successfully: ' + data.transaction);
            } else {
                alert('Deployment failed: ' + data.error);
            }
        } catch (error) {
            console.error('Deployment error:', error);
            alert('Deployment error');
        } finally {
            setIsDeploying(false);
        }
    };

    const value = {
        nodes,
        setNodes,
        onNodesChange,
        edges,
        setEdges,
        onEdgesChange,
        onConnect,
        deployProject,
        isDeploying,
        selectedNode,
        setSelectedNode,
        updateNodeData
    };

    return (
        <BuilderContext.Provider value={value}>
            {children}
        </BuilderContext.Provider>
    );
};

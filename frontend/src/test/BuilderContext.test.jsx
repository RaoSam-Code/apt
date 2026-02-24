import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { BuilderProvider, useBuilder } from '../context/BuilderContext';

function TestConsumer() {
    const { nodes, isDeploying } = useBuilder();
    return (
        <div>
            <span data-testid="node-count">{nodes.length}</span>
            <span data-testid="is-deploying">{isDeploying.toString()}</span>
        </div>
    );
}

describe('BuilderContext', () => {
    it('initializes with empty nodes and edges', () => {
        render(
            <ReactFlowProvider>
                <BuilderProvider>
                    <TestConsumer />
                </BuilderProvider>
            </ReactFlowProvider>
        );
        expect(screen.getByTestId('node-count').textContent).toBe('0');
        expect(screen.getByTestId('is-deploying').textContent).toBe('false');
    });
});

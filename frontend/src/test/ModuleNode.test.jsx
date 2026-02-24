import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ModuleNode from '../components/VisualBuilder/nodes/ModuleNode';

// Mock reactflow to avoid canvas issues in jsdom
vi.mock('reactflow', () => ({
    Handle: ({ type }) => <div data-testid={`handle-${type}`} />,
    Position: { Left: 'left', Right: 'right' },
    memo: (Component) => Component,
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, initial, animate, whileHover, whileTap, ...props }) =>
            React.createElement('div', props, children),
    },
}));

describe('ModuleNode', () => {
    it('renders the node label', () => {
        render(<ModuleNode data={{ label: 'Token' }} isConnectable={true} />);
        expect(screen.getByText('Token')).toBeTruthy();
    });

    it('renders handles for connections', () => {
        render(<ModuleNode data={{ label: 'NFT Collection' }} isConnectable={true} />);
        expect(screen.getByTestId('handle-target')).toBeTruthy();
        expect(screen.getByTestId('handle-source')).toBeTruthy();
    });

    it('renders Module Config text', () => {
        render(<ModuleNode data={{ label: 'DAO' }} isConnectable={true} />);
        expect(screen.getByText('Module Config')).toBeTruthy();
    });
});

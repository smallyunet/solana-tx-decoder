import React from 'react';
import { ParsedAction } from '../../types';

interface TokenFlowProps {
    action: ParsedAction;
}

/**
 * Visual token flow component showing token movement direction.
 */
export const TokenFlow: React.FC<TokenFlowProps> = ({ action }) => {
    const { details, direction } = action;

    const directionConfig = {
        IN: { color: '#14F195', arrow: '→', label: 'RECEIVED' },
        OUT: { color: '#FF4B4B', arrow: '←', label: 'SENT' },
        SELF: { color: '#007AFF', arrow: '⟲', label: 'SELF' },
        UNKNOWN: { color: '#8E8E93', arrow: '•', label: '' }
    };

    const resolvedDirection = direction ? direction : 'UNKNOWN';
    const config = directionConfig[resolvedDirection];

    const amount = readDetailValue(details, ['amount', 'tokenAmount']);
    const mint = readDetailValue(details, ['mint']);
    const symbol = readSymbol(details, mint);

    if (amount === '' && mint === '') {
        return null;
    } else {
        return (
            <div className="token-flow" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                borderLeft: `3px solid ${config.color}`
            }}>
                {/* Direction Arrow */}
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: `${config.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: config.color
                }}>
                    {config.arrow}
                </div>

                {/* Token Info */}
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#fff'
                    }}>
                        {amount} {symbol}
                    </div>
                    {config.label ? (
                        <div style={{
                            fontSize: '0.75rem',
                            color: config.color,
                            fontWeight: 'bold',
                            marginTop: '2px'
                        }}>
                            {config.label}
                        </div>
                    ) : (
                        <div style={{ height: '0.75rem' }} />
                    )}
                </div>

                {renderUsdValue(action.totalUsd)}
            </div>
        );
    }
};

const readDetailValue = (details: ParsedAction['details'], keys: string[]) => {
    const normalizedValues = keys.map((key) => normalizeDetailValue(details[key]));
    const firstValue = normalizedValues.find((value) => value !== null && value !== undefined);

    if (firstValue !== null && firstValue !== undefined) {
        return firstValue;
    } else {
        return '';
    }
};

const normalizeDetailValue = (value: unknown) => {
    if (value === null || value === undefined) {
        return null;
    } else if (typeof value === 'string') {
        return value;
    } else if (typeof value === 'number') {
        return value.toString();
    } else {
        return null;
    }
};

const readSymbol = (details: ParsedAction['details'], mint: string) => {
    const rawSymbol = readDetailValue(details, ['symbol']);

    if (rawSymbol) {
        return rawSymbol;
    } else if (mint) {
        return mint.slice(0, 8);
    } else {
        return '';
    }
};

const renderUsdValue = (totalUsd?: number) => {
    if (typeof totalUsd === 'number' && totalUsd > 0) {
        return (
            <div style={{
                backgroundColor: 'rgba(20, 241, 149, 0.1)',
                color: '#14F195',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: 'bold'
            }}>
                ${totalUsd.toFixed(2)}
            </div>
        );
    } else {
        return null;
    }
};

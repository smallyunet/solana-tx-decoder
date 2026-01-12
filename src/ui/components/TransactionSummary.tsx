import React from 'react';
import { ParsedResult } from '../../types';

interface TransactionSummaryProps {
    result: ParsedResult;
}

/**
 * Compact summary component showing key transaction information.
 */
export const TransactionSummary: React.FC<TransactionSummaryProps> = ({ result }) => {
    const totalValue = result.actions.reduce((sum, action) => sum + (action.totalUsd || 0), 0);

    // Count protocol occurrences
    const protocolCounts = result.actions.reduce((acc, action) => {
        acc[action.protocol] = (acc[action.protocol] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const protocolColors: Record<string, string> = {
        'System': '#007AFF',
        'SPL Token': '#14F195',
        'Jupiter': '#9945FF',
        'Raydium': '#F5A623',
        'Orca Whirlpool': '#00D1FF',
        'Orca': '#00D1FF',
        'Unknown': '#8E8E93'
    };

    return (
        <div className="tx-summary" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            alignItems: 'center'
        }}>
            {/* Status Badge */}
            <div style={{
                backgroundColor: result.success ? 'rgba(20, 241, 149, 0.15)' : 'rgba(255, 75, 75, 0.15)',
                border: `1px solid ${result.success ? '#14F195' : '#FF4B4B'}`,
                borderRadius: '20px',
                padding: '6px 16px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: result.success ? '#14F195' : '#FF4B4B'
            }}>
                {result.success ? '✓ SUCCESS' : '✗ FAILED'}
            </div>

            {/* Fee */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#888'
            }}>
                <span style={{ fontSize: '0.85rem' }}>Fee:</span>
                <span style={{ fontFamily: 'monospace', color: '#fff' }}>{result.fee} SOL</span>
            </div>

            {/* Total USD Value */}
            {totalValue > 0 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#888'
                }}>
                    <span style={{ fontSize: '0.85rem' }}>Value:</span>
                    <span style={{
                        fontFamily: 'monospace',
                        color: '#14F195',
                        fontWeight: 'bold'
                    }}>
                        ${totalValue.toFixed(2)}
                    </span>
                </div>
            )}

            {/* Protocol Breakdown */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginLeft: 'auto'
            }}>
                {Object.entries(protocolCounts).map(([protocol, count]) => (
                    <span key={protocol} style={{
                        backgroundColor: protocolColors[protocol] || protocolColors['Unknown'],
                        color: '#000',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                    }}>
                        {protocol} ({count})
                    </span>
                ))}
            </div>
        </div>
    );
};

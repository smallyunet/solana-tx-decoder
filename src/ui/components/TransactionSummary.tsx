import React from 'react';
import { ParsedResult } from '../../types';
import { getProtocolColor, getProtocolGroup } from '../theme';

interface TransactionSummaryProps {
    result: ParsedResult;
}

/**
 * Compact summary component showing key transaction information.
 */
export const TransactionSummary: React.FC<TransactionSummaryProps> = ({ result }) => {
    let totalValue = 0;
    const protocolCounts: Record<string, number> = {};

    for (const action of result.actions) {
        if (typeof action.totalUsd === 'number') {
            totalValue += action.totalUsd;
        } else {
            totalValue += 0;
        }

        const protocolGroup = getProtocolGroup(action.protocol);
        if (Object.prototype.hasOwnProperty.call(protocolCounts, protocolGroup)) {
            protocolCounts[protocolGroup] = protocolCounts[protocolGroup] + 1;
        } else {
            protocolCounts[protocolGroup] = 1;
        }
    }

    const totalValueSection = renderTotalValue(totalValue);
    const protocolBadges = renderProtocolBadges(protocolCounts);

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
            {totalValueSection}

            {/* Protocol Breakdown */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginLeft: 'auto'
            }}>
                {protocolBadges}
            </div>
        </div>
    );
};

const renderTotalValue = (totalValue: number) => {
    if (totalValue > 0) {
        return (
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
        );
    } else {
        return null;
    }
};

const renderProtocolBadges = (protocolCounts: Record<string, number>) => {
    const entries = Object.entries(protocolCounts);

    return entries.map(([protocol, count]) => (
        <span key={protocol} style={{
            backgroundColor: getProtocolColor(protocol),
            color: '#000',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 'bold'
        }}>
            {protocol} ({count})
        </span>
    ));
};

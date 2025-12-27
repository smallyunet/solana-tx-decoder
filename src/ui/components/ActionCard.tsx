import React from 'react';
import { ParsedAction } from '../../types';

interface ActionCardProps {
    action: ParsedAction;
    index: number;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, index }) => {
    const getProtocolColor = (protocol: string) => {
        switch (protocol.toLowerCase()) {
            case 'system': return '#007AFF';
            case 'spl token': return '#14F195';
            case 'jupiter': return '#9945FF';
            default: return '#8E8E93';
        }
    };

    return (
        <div className="action-card" style={{
            backgroundColor: '#1e1e1e',
            borderRadius: '8px',
            padding: '1rem',
            borderLeft: `4px solid ${getProtocolColor(action.protocol)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: getProtocolColor(action.protocol) }}>
                    #{index} {action.protocol.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{action.type}</span>
            </div>

            <div className="summary" style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                {action.summary}
                {action.totalUsd && (
                    <span style={{
                        marginLeft: '0.5rem',
                        color: '#14F195',
                        fontSize: '0.9rem',
                        verticalAlign: 'middle',
                        backgroundColor: 'rgba(20, 241, 149, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                    }}>
                        (${action.totalUsd.toFixed(2)})
                    </span>
                )}
            </div>

            {action.details && Object.keys(action.details).length > 0 && (
                <div className="details" style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#2a2a2a',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                }}>
                    {Object.entries(action.details).map(([key, value]) => (
                        <div key={key} style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ opacity: 0.5 }}>{key}:</span>
                            <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                {typeof value === 'string' ? value : JSON.stringify(value)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

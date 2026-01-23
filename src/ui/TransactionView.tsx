import React from 'react';
import { ParsedResult } from '../types';
import { ActionCard } from './components/ActionCard';
import { TransactionSummary } from './components/TransactionSummary';

interface TransactionViewProps {
    result: ParsedResult;
}

export const TransactionView: React.FC<TransactionViewProps> = ({ result }) => {
    const formattedTimestamp = formatTimestamp(result.timestamp);

    return (
        <div className="stx-visualizer" style={{
            backgroundColor: '#121212',
            color: '#ffffff',
            fontFamily: 'Inter, sans-serif',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #333'
        }}>
            <header style={{ marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>Transaction Details</h2>
                </div>
                <div style={{ marginTop: '0.5rem', opacity: 0.7, fontSize: '0.9rem' }}>
                    <div>Sig: <span style={{ fontFamily: 'monospace' }}>{result.signature}</span></div>
                    {formattedTimestamp}
                </div>
            </header>

            <TransactionSummary result={result} />

            <div className="actions-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {result.actions.map((action, index) => (
                    <ActionCard key={index} action={action} index={index + 1} />
                ))}
            </div>
        </div>
    );
};

const formatTimestamp = (timestamp?: number) => {
    if (typeof timestamp === 'number') {
        const formatted = new Date(timestamp * 1000).toLocaleString();
        return <div>Time: {formatted}</div>;
    } else {
        return null;
    }
};

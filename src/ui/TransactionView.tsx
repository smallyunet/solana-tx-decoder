import React from 'react';
import { ParsedResult, ParsedAction } from '../types';
import { ActionCard } from './components/ActionCard';

interface TransactionViewProps {
    result: ParsedResult;
}

export const TransactionView: React.FC<TransactionViewProps> = ({ result }) => {
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
                    <span style={{
                        backgroundColor: result.success ? '#14F195' : '#FF4B4B',
                        color: '#000',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                    }}>
                        {result.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                </div>
                <div style={{ marginTop: '0.5rem', opacity: 0.7, fontSize: '0.9rem' }}>
                    <div>Sig: <span style={{ fontFamily: 'monospace' }}>{result.signature}</span></div>
                    <div>Fee: {result.fee} SOL</div>
                </div>
            </header>

            <div className="actions-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {result.actions.map((action, index) => (
                    <ActionCard key={index} action={action} index={index + 1} />
                ))}
            </div>
        </div>
    );
};

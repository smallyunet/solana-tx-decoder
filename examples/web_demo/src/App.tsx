import React, { useState } from 'react';
import { Connection } from '@solana/web3.js';
import { SolanaParser, TransactionView, ParsedResult } from '@src/index';
import { Buffer } from 'buffer';

// Polyfill Buffer for browser
window.Buffer = Buffer;

const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
const parser = new SolanaParser(connection);

export const App: React.FC = () => {
    const [txId, setTxId] = useState('');
    const [result, setResult] = useState<ParsedResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDecode = async () => {
        if (!txId.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const parsed = await parser.parseTransaction(txId.trim());
            if (parsed) {
                setResult(parsed);
            } else {
                setError('Transaction not found');
            }
        } catch (e: any) {
            setError(e.message || 'Error parsing transaction');
        } finally {
            setLoading(false);
        }
    };

    const examples = [
        { label: 'SOL Transfer', id: '5UfDuX7WXY18keiz9mZ6zKkY8JyNuLDFz2UMGqE8CRN57pRBbME6VxWJbHqftiXxhozVhzR3vo4qJpUktqt5sMEj' },
        { label: 'USDC Transfer', id: '4vD3pSETPxuoMXrYhY3naJgfpEqyfqvv7xSfPvnTUXFp4y9FZv4v6vEpQPvHUfXmNLfVsVZHkZGkJWmz1xnfkPxL' },
        { label: 'Jupiter Swap', id: '3gyPgPLkRT98vMZRd3RhBrK6z7HeHrXhBfJeyxZQNGHrBJJquJkW8mvFrABhJu4RP5aJ9zgg4F6DmWxWwjf2pump' }
    ];

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ color: '#9945FF' }}>Solana Tx Visualizer Demo</h1>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {examples.map(ex => (
                    <button
                        key={ex.label}
                        onClick={() => setTxId(ex.id)}
                        style={{
                            backgroundColor: '#333', color: '#fff', border: 'none',
                            padding: '0.3rem 0.8rem', borderRadius: '16px', cursor: 'pointer'
                        }}
                    >
                        {ex.label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input
                    type="text"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder="Enter Transaction Signature"
                    style={{
                        flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #444',
                        backgroundColor: '#222', color: '#fff'
                    }}
                />
                <button
                    onClick={handleDecode}
                    disabled={loading}
                    style={{
                        padding: '0.8rem 2rem', borderRadius: '8px', border: 'none',
                        background: 'linear-gradient(45deg, #9945FF, #14F195)', color: '#000',
                        fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Decoding...' : 'Decode'}
                </button>
            </div>

            {error && (
                <div style={{ color: '#FF4B4B', padding: '1rem', backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: '8px', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {result && <TransactionView result={result} />}
        </div>
    );
};

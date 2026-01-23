import React, { useState } from 'react';
import { Connection } from '@solana/web3.js';
import { SolanaParser, TransactionView, ParsedResult } from '../../../src/index';
import { Buffer } from 'buffer';

// Polyfill Buffer for browser
window.Buffer = Buffer;

export const App: React.FC = () => {
    const [rpcUrl, setRpcUrl] = useState('https://api.mainnet-beta.solana.com');
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
            const connection = new Connection(rpcUrl, 'confirmed');
            const parser = new SolanaParser(connection);
            const parsed = await parser.parseTransaction(txId.trim());
            if (parsed) {
                setResult(parsed);
            } else {
                setError('Transaction not found. Ensure the signature is correct and the RPC has the transaction data.');
            }
        } catch (e: any) {
            console.error('Decoding error:', e);
            const is403 = e.message?.includes('403');

            if (is403) {
                setError('RPC Error (403 Forbidden): The public Solana RPC blocks browser requests. Please use a private RPC URL (e.g., Helius, Alchemy, or QuickNode).');
            } else {
                setError(e.message || 'Error parsing transaction');
            }
        } finally {
            setLoading(false);
        }
    };

    // Real transaction signatures from Solscan mainnet
    const examples = [
        // Raydium AMM V4 transactions (real mainnet data)
        { label: 'Raydium Swap', id: '3oPfvbCztaNEpbtSib2DezyzjvSwxv7mZv8peCoAuiRijetvFM3TspWthxzETGkYYuxjVGa6HbdEKjiv9vZzd3Up' },
        { label: 'Raydium Route', id: '3cBjqB67PwX2qwghME2wsDNQJwMz17nYT2pUJZXoujCs4tB5ix2UJUssANpkcQeVd6EwtAuJU3Dh46UF3d8CjPB6' },
        // Orca Whirlpool transactions (real mainnet data)
        { label: 'Orca Swap', id: '3EWQN5tjCMMsxavQdJz9FD4ZSUbfFdyzmA9Ndf8Sa7NRmSJLq84PWi3BVTgE6wsk2G8xhhuMVT5Yq8GUWUeE6h34' },
        { label: 'Orca Route', id: '4MSqXd7fsTyD9xTEBkHjLdWEJSqNDJ2u9GaKwLiBHSZmqjQ28K1gUtiUQRmVAzyS1XEedjNuQzFinVzfMDT2KTFT' },
    ];

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '4rem 2rem',
            minHeight: '100vh',
            backgroundColor: '#050505',
            color: '#fff',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}>
            <nav style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #9945FF, #14F195)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0,
                        letterSpacing: '-0.02em'
                    }}>
                        Solana Tx Visualizer
                    </h1>
                    <p style={{ opacity: 0.5, margin: '0.4rem 0 0', fontSize: '1.1rem' }}>The ultimate tool for deep transaction analysis.</p>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <a href="https://github.com/smallyunet/solana-tx-decoder" target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'none', opacity: 0.7, fontWeight: 600 }}>GitHub</a>
                    <a href="https://github.com/smallyunet/solana-tx-decoder#readme" target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'none', opacity: 0.7, fontWeight: 600 }}>Docs</a>
                    <a href="#" style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '10px',
                        backgroundColor: '#14F195',
                        color: '#000',
                        textDecoration: 'none',
                        fontWeight: 700
                    }}>v0.0.8 Early Access</a>
                </div>
            </nav>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 350px',
                gap: '3rem',
                marginBottom: '4rem'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{
                        padding: '2rem',
                        backgroundColor: '#0a0a0a',
                        borderRadius: '24px',
                        border: '1px solid #1a1a1a',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.2rem' }}>
                            <label style={{ fontWeight: 700, fontSize: '1rem', opacity: 0.9 }}>Analyze Transaction</label>
                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                {examples.map(ex => (
                                    <button
                                        key={ex.label}
                                        onClick={() => setTxId(ex.id)}
                                        style={{
                                            backgroundColor: '#111', color: '#888', border: '1px solid #222',
                                            padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer',
                                            fontSize: '0.8rem', transition: 'all 0.2s', fontWeight: 600
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#9945FF'; e.currentTarget.style.color = '#fff'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.color = '#888'; }}
                                    >
                                        {ex.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <input
                                type="text"
                                value={txId}
                                onChange={(e) => setTxId(e.target.value)}
                                placeholder="Signature (e.g. 3gyPgPLk...)"
                                style={{
                                    flex: 1, padding: '1.2rem', borderRadius: '16px', border: '1px solid #222',
                                    backgroundColor: '#000', color: '#fff', fontSize: '1rem', outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#9945FF'}
                                onBlur={(e) => e.target.style.borderColor = '#222'}
                            />
                            <button
                                onClick={handleDecode}
                                disabled={loading}
                                style={{
                                    padding: '0 2.5rem', borderRadius: '16px', border: 'none',
                                    background: 'linear-gradient(45deg, #9945FF, #14F195)', color: '#000',
                                    fontWeight: 800, fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 0 20px rgba(20,241,149,0.2)'
                                }}
                                onMouseOver={(e) => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
                                onMouseOut={(e) => (e.currentTarget.style.filter = 'brightness(1.0)')}
                            >
                                {loading ? 'Analyzing...' : 'Decode'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            color: '#FF4B4B', padding: '1.2rem', backgroundColor: 'rgba(255,75,75,0.05)',
                            borderRadius: '16px', border: '1px solid rgba(255,75,75,0.2)',
                            fontSize: '0.95rem', lineHeight: '1.5'
                        }}>
                            <strong style={{ display: 'block', marginBottom: '0.3rem' }}>Action Required</strong>
                            {error}
                        </div>
                    )}

                    {result ? (
                        <TransactionView result={result} />
                    ) : (
                        !loading && (
                            <div style={{
                                textAlign: 'center',
                                padding: '8rem 0',
                                opacity: 0.15,
                                border: '3px dashed #1a1a1a',
                                borderRadius: '32px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <span style={{ fontSize: '4rem' }}>🛸</span>
                                <p style={{ fontSize: '1.4rem', fontWeight: 600 }}>Ready for takeoff. Enter a signature.</p>
                            </div>
                        )
                    )}
                </div>

                <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section style={{
                        padding: '2rem',
                        backgroundColor: '#0a0a0a',
                        borderRadius: '24px',
                        border: '1px solid #1a1a1a'
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.6 }}>Configuration</h3>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: 600, opacity: 0.8 }}>Network RPC</label>
                            <input
                                type="text"
                                value={rpcUrl}
                                onChange={(e) => setRpcUrl(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #222',
                                    backgroundColor: '#000', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box'
                                }}
                            />
                            <p style={{ fontSize: '0.75rem', opacity: 0.4, marginTop: '0.5rem' }}>
                                Public RPC may block browser requests. Use Helius, Alchemy, or QuickNode.
                            </p>
                        </div>
                    </section>

                    <section style={{ padding: '0 1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Supported Protocols</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                            {[
                                { name: 'Jupiter', new: false },
                                { name: 'Raydium', new: true },
                                { name: 'Orca', new: true },
                                { name: 'SPL Token', new: false },
                                { name: 'System', new: false }
                            ].map(p => (
                                <span key={p.name} style={{
                                    fontSize: '0.8rem',
                                    padding: '0.4rem 0.8rem',
                                    backgroundColor: p.new ? 'rgba(20,241,149,0.1)' : '#1a1a1a',
                                    borderRadius: '6px',
                                    border: p.new ? '1px solid rgba(20,241,149,0.3)' : '1px solid #222',
                                    opacity: 0.9,
                                    color: p.new ? '#14F195' : 'inherit'
                                }}>{p.name} {p.new && '✨'}</span>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.75rem', opacity: 0.4, marginTop: '0.8rem' }}>
                            ✨ New: Full liquidity operations support
                        </p>
                    </section>

                    <section style={{ padding: '1.5rem', backgroundColor: 'rgba(153,69,255,0.05)', borderRadius: '20px', border: '1px solid rgba(153,69,255,0.1)' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#9945FF', fontSize: '0.9rem' }}>Built for Developers</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.6, lineHeight: '1.5' }}>
                            Need to integrate this into your dApp? Check out our <strong>NPM Package</strong> for full access to the parsing engine.
                        </p>
                        <code style={{
                            display: 'block',
                            marginTop: '1rem',
                            padding: '0.6rem',
                            backgroundColor: '#000',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            color: '#14F195'
                        }}>npm i solana-tx-decoder</code>
                    </section>
                </aside>
            </div>

            <footer style={{ borderTop: '1px solid #1a1a1a', paddingTop: '3rem', opacity: 0.4, fontSize: '0.9rem', textAlign: 'center' }}>
                <p>&copy; 2026 Solana Tx Visualizer. All rights reserved.</p>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Privacy</a>
                    <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Terms</a>
                    <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Security</a>
                </div>
            </footer>
        </div>
    );
};

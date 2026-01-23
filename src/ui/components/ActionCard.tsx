import React from 'react';
import { ParsedAction } from '../../types';
import { getProtocolColor } from '../theme';
import { TokenFlow } from './TokenFlow';

interface ActionCardProps {
    action: ParsedAction;
    index: number;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, index }) => {
    const protocolColor = getProtocolColor(action.protocol);
    const detailEntries = formatDetails(action.details);

    const totalUsdBadge = renderTotalUsdBadge(action.totalUsd);
    const detailsSection = renderDetailsSection(detailEntries);

    return (
        <div className="action-card" style={{
            backgroundColor: '#1e1e1e',
            borderRadius: '8px',
            padding: '1rem',
            borderLeft: `4px solid ${protocolColor}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: protocolColor }}>
                    #{index} {action.protocol.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{action.type}</span>
            </div>

            <div className="summary" style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                {action.summary}
                {totalUsdBadge}
            </div>

            <TokenFlow action={action} />

            {detailsSection}
        </div>
    );
};

const renderTotalUsdBadge = (totalUsd?: number) => {
    if (typeof totalUsd === 'number' && totalUsd > 0) {
        return (
            <span style={{
                marginLeft: '0.5rem',
                color: '#14F195',
                fontSize: '0.9rem',
                verticalAlign: 'middle',
                backgroundColor: 'rgba(20, 241, 149, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px'
            }}>
                (${totalUsd.toFixed(2)})
            </span>
        );
    } else {
        return null;
    }
};

const renderDetailsSection = (details: Array<[string, string]>) => {
    if (details.length > 0) {
        return (
            <div className="details" style={{
                marginTop: '0.25rem',
                padding: '0.75rem',
                backgroundColor: '#2a2a2a',
                borderRadius: '6px',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
            }}>
                {details.map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ opacity: 0.5, minWidth: '110px' }}>{key}:</span>
                        <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{value}</span>
                    </div>
                ))}
            </div>
        );
    } else {
        return null;
    }
};

const formatDetails = (details: Record<string, unknown>) => {
    const entries: Array<[string, string]> = [];
    const keys = Object.keys(details);

    for (const key of keys) {
        const value = details[key];
        const formattedValue = formatDetailValue(value);
        entries.push([key, formattedValue]);
    }

    return entries;
};

const formatDetailValue = (value: unknown) => {
    if (value === null) {
        return 'null';
    } else if (value === undefined) {
        return 'undefined';
    } else if (typeof value === 'string') {
        return value;
    } else if (typeof value === 'number') {
        return value.toString();
    } else if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    } else if (typeof value === 'bigint') {
        return value.toString();
    } else if (Array.isArray(value)) {
        return value.map(item => formatDetailValue(item)).join(', ');
    } else if (isPublicKeyLike(value)) {
        return value.toBase58();
    } else if (typeof value === 'object') {
        return JSON.stringify(value, (_key, item) => {
            if (typeof item === 'bigint') {
                return item.toString();
            } else {
                return item;
            }
        });
    } else {
        return String(value);
    }
};

const isPublicKeyLike = (value: unknown): value is { toBase58: () => string } => {
    if (typeof value === 'object' && value !== null) {
        const candidate = value as { toBase58?: unknown };
        if (typeof candidate.toBase58 === 'function') {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

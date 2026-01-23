export const protocolColors = {
    system: '#007AFF',
    splToken: '#14F195',
    jupiter: '#9945FF',
    raydium: '#F5A623',
    orca: '#00D1FF',
    unknown: '#8E8E93'
};

export const getProtocolColor = (protocol: string): string => {
    const normalized = protocol.trim().toLowerCase();

    switch (normalized) {
        case 'system':
            return protocolColors.system;
        case 'spl token':
            return protocolColors.splToken;
        case 'jupiter':
            return protocolColors.jupiter;
        case 'raydium':
            return protocolColors.raydium;
        case 'orca whirlpool':
        case 'orca':
            return protocolColors.orca;
        default:
            return protocolColors.unknown;
    }
};

export const getProtocolGroup = (protocol: string): string => {
    const normalized = protocol.trim().toLowerCase();

    switch (normalized) {
        case 'system':
            return 'System';
        case 'spl token':
            return 'SPL Token';
        case 'jupiter':
            return 'Jupiter';
        case 'raydium':
            return 'Raydium';
        case 'orca whirlpool':
        case 'orca':
            return 'Orca';
        default:
            return 'Unknown';
    }
};

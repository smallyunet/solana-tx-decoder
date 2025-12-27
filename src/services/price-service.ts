import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';

export interface PriceService {
    getUsdPrice(mint: string): Promise<number | null>;
    getUsdPrices(mints: string[]): Promise<Record<string, number>>;
}

interface JupiterPriceResponse {
    data: Record<string, {
        id: string;
        mintSymbol: string;
        vsToken: string;
        vsTokenSymbol: string;
        price: number;
    }>;
    timeTaken: number;
}

export class JupiterPriceService implements PriceService {
    private static API_URL = 'https://api.jup.ag/price/v2';

    async getUsdPrice(mint: string): Promise<number | null> {
        const prices = await this.getUsdPrices([mint]);
        return prices[mint] || null;
    }

    async getUsdPrices(mints: string[]): Promise<Record<string, number>> {
        if (mints.length === 0) return {};

        try {
            // Deduplicate mints
            const uniqueMints = [...new Set(mints)];
            const ids = uniqueMints.join(',');
            const response = await fetch(`${JupiterPriceService.API_URL}?ids=${ids}`);

            if (!response.ok) {
                console.warn(`Failed to fetch prices: ${response.statusText}`);
                return {};
            }

            const data = await response.json() as JupiterPriceResponse;
            const result: Record<string, number> = {};

            if (data && data.data) {
                for (const mint of uniqueMints) {
                    if (data.data[mint]) {
                        result[mint] = data.data[mint].price;
                    }
                }
            }

            return result;
        } catch (error) {
            console.error("Error fetching prices from Jupiter:", error);
            return {};
        }
    }
}

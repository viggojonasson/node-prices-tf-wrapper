import axios, { Method } from 'axios';

type Currency = {
    metal: number;
    keys: number;
};

export type PossibleParams = {
    page?: number;
    limit?: number;
    order?: 'DESC' | 'ASC';
};

export type RequestOptions = {
    maxRetries?: number;
    waitTime?: number;
    axiosTimeout?: number;
    skipTokenRegeneration?: boolean;
};

export type ItemPrice = {
    buyHalfScrap: number | null;
    buyKeys: number | null;
    buyKeyHalfScrap: number | null;
    sellHalfScrap: number | null;
    sellKeys: number | null;
    sellKeyHalfScrap: number | null;
};

export type RequestPriceResponse = {
    enqueued: boolean;
};

export type PaginatePricesResponse = {
    items: GetPriceResponse[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
};

// Have only seen "sellKeyHalfScrap" and "buyKeyHalfScrap" as null but just incase.
export type GetPriceResponse = {
    sku: string;
    createdAt: string;
    updatedAt: string;
} & ItemPrice;

export type GetAccessTokenResponse = {
    accessToken: string;
};

// Will change in the future.
// api2 => api
const BASE_URL = 'https://api2.prices.tf/';

class PricesTF {
    public accessToken?: string;

    constructor() {}

    setToken(accessToken: string) {
        this.accessToken = accessToken;
    }

    clearToken() {
        this.accessToken = null;
    }

    async requestPrice(
        sku: string,
        options?: RequestOptions
    ): Promise<RequestPriceResponse> {
        return this.makeRequest<RequestPriceResponse>(
            'prices/' + sku + '/refresh',
            'POST',
            options
        );
    }

    async getPrices(
        params: PossibleParams,
        options?: RequestOptions
    ): Promise<PaginatePricesResponse> {
        return this.makeRequest<PaginatePricesResponse>(
            'prices',
            'GET',
            options,
            params
        );
    }

    async getPrice(
        sku: string,
        options?: RequestOptions
    ): Promise<GetPriceResponse> {
        return this.makeRequest<GetPriceResponse>(
            'prices/' + sku,
            'GET',
            options
        );
    }

    async getAccessToken(options?: RequestOptions): Promise<string> {
        const { accessToken } = await this.makeRequest<GetAccessTokenResponse>(
            'auth/access',
            'POST',
            options
        );

        this.setToken(accessToken);

        return accessToken;
    }

    private async makeRequest<T>(
        endpoint: string,
        method: Method,
        options?: RequestOptions,
        params?: PossibleParams,
        attempts = 0
    ): Promise<T> {
        attempts++;

        try {
            const { data } = await axios({
                method,
                url: `${BASE_URL}${endpoint}`,
                timeout: options?.axiosTimeout || 10 * 1000,
                headers: !this.accessToken
                    ? {}
                    : {
                          Authorization: 'Bearer ' + this.accessToken,
                      },
            });
            return data;
        } catch (err: any) {
            if (err.response && err.response.status === 401) {
                if (options?.skipTokenRegeneration === true) throw err;

                await this.getAccessToken();

                attempts--;
                return this.makeRequest<T>(
                    endpoint,
                    method,
                    options,
                    params,
                    attempts
                );
            }

            if (options?.maxRetries === 0) throw err;

            if (attempts >= options?.maxRetries || 3) throw err;

            await delayPromise(options?.waitTime || 10 * 1000);

            return this.makeRequest(
                endpoint,
                method,
                options,
                params,
                attempts
            );
        }
    }
}

export function parsePrice(price: ItemPrice): {
    sell: Currency;
    buy: Currency;
} {
    return {
        sell: {
            keys: price.sellKeys || 0,
            metal: toMetal(price.sellHalfScrap / 2) || 0,
        },
        buy: {
            keys: price.buyKeys || 0,
            metal: toMetal(price.buyHalfScrap / 2) || 0,
        },
    };
}

// From tf2-currency
function toMetal(scrap: number): number {
    let refined = scrap / 9;
    // Truncate it to remove repeating decimals  (10 scrap / 9 scrap/refined = 1.1111...)
    return (refined = truncateCurrency(refined));
}

function truncateCurrency(num: number): number {
    const decimals = 2;
    const factor = Math.pow(10, decimals);
    return roundCurrency(num * factor) / factor;
}

function roundCurrency(num: number): number {
    const isPositive = num >= 0;

    const rounding = num + 0.001 > Math.ceil(num) ? Math.round : Math.floor;
    const rounded = rounding(Math.abs(num));

    return isPositive ? rounded : -rounded;
}

function delayPromise(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export default PricesTF;

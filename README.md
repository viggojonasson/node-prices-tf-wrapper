# node-prices-tf-wrapper
API Wrapper for v2 prices.tf.

## [API Documentation](https://api2.prices.tf/docs)

## Installation
```
npm i prices-tf-wrapper --save
```

## Usage
The module handles access token re-generation for you. All you have to do is call the methods.

```ts
import PricesTF, {RequestOptions, parsePrice} from "prices-tf-wrapper";

const api = new PricesTF();

/* ************* */
/*    METHODS    */
/* ************* */

// Set access token to use.
api.setToken("");

// Clear the current token.
api.clearToken();

// Request a item to get re-checked by the pricer.
api.requestPrice('5021;6');

// Get many prices, paginate through them uses the params.
api.getPrices();

// Get an items price.
api.getPrice('5021;6');

// Get an access token and update the internal one.
api.getAccessToken();

// All endpoint methods allows some options to be provided
const requestOptions: RequestOptions = {
  maxRetries: 3, // Max amount of attempts made on each request before it forfeits.
  waitTime: 10 * 1000, // Time (ms) to wait before retrying again.
  axiosTimeout: 10 * 1000, // The timeout property specified to the axios request.
  skipTokenRegeneration: false, // Whether or not to regenerate a new token, if this is true you will have to specify one yourself using the api.setToken method.
};

// Parse a prices.tf price into a currency object.
api.getPrice('5021;6').then((res) => {
  console.log(parsePrice(res));
})
```
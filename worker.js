const redis = require("redis");
const axios = require('axios');
const client = redis.createClient();

if (process.env.REDIS_PASSWORD) {
  client.auth(process.env.REDIS_PASSWORD);
}

client.on("error", function(error) {
  console.error(error);
});

const getBitoExPrice = async () => {
  const url = `https://www.bitoex.com/api/v0/rate/${Date.now()}`;
  const body = await axios.get(url);
  return body;
};

const getMaicoinPrice = async (crypto) => {
  const query = `
    query Ticker_GetTicker($currency: CryptoCurrency!) {
      ticker(currency: $currency) {
          buyPrice
          sellPrice
          __typename
      }
    }`;
  const payload = {
    operationName: 'Ticker_GetTicker',
    query: query,
    variables: {
      currency: crypto,
    },
  };
  const url = 'https://api.maicoin.com/graphql';
  const body = await axios.post(url, payload);
  return body;
};

Promise.all([
  getBitoExPrice(),
  getMaicoinPrice('BTC'),
  getMaicoinPrice('ETH'),
  getMaicoinPrice('LTC'),
  getMaicoinPrice('USDT'),
]).then(([bitoex, BTC, ETH, LTC, USDT]) => {
    const maicoin = {
      t: Date.now(),
      BTC: {
        formatted_buy_price_in_twd: BTC.data.data.ticker.buyPrice,
        formatted_sell_price_in_twd: BTC.data.data.ticker.sellPrice,
      },
      ETH: {
        formatted_buy_price_in_twd: ETH.data.data.ticker.buyPrice,
        formatted_sell_price_in_twd: ETH.data.data.ticker.sellPrice,
      },
      LTC: {
        formatted_buy_price_in_twd: LTC.data.data.ticker.buyPrice,
        formatted_sell_price_in_twd: LTC.data.data.ticker.sellPrice,
      },
      USDT: {
        formatted_buy_price_in_twd: USDT.data.data.ticker.buyPrice,
        formatted_sell_price_in_twd: USDT.data.data.ticker.sellPrice,
      },
    };
    client.set('price', JSON.stringify({
      bitoex: bitoex.data,
      maicoin,
    }));
    client.quit();
  });

const redis = require("redis");
const request = require('request-promise-native');
const client = redis.createClient();

if (process.env.REDIS_PASSWORD) {
  client.auth(process.env.REDIS_PASSWORD);
}

client.on("error", function(error) {
  console.error(error);
});

const getBitoExPrice = async () => {
  const uri = `https://www.bitoex.com/sync/dashboard/${Date.now()}`;
  const body = await request({ uri });
  return body;
};

const getMaicoinPrice = async (crypto) => {
  const url = 'https://www.maicoin.com/api/prices/target-usd';
  const body = await request({ uri: url.replace('target', crypto) });
  return body;
};

Promise.all([
  getBitoExPrice(),
  getMaicoinPrice('btc'),
  getMaicoinPrice('eth'),
  getMaicoinPrice('ltc'),
  getMaicoinPrice('usdt'),
]).then(([bitoex, BTC, ETH, LTC, USDT]) => {
    const maicoin = {
      t: Date.now(),
      BTC: JSON.parse(BTC),
      ETH: JSON.parse(ETH),
      LTC: JSON.parse(LTC),
      USDT: JSON.parse(USDT),
    };
    client.set('price', JSON.stringify({
      bitoex: JSON.parse(bitoex),
      maicoin,
    }));
    client.quit();
  });

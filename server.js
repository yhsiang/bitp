const express = require('express');
const request = require('request');
const cors = require('cors');
const cheerio = require('cheerio');
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

app.use('/bitoex', function(req, res) {
  const url = 'https://www.bitoex.com/sync/dashboard'

  req.pipe(request({ uri: url + '/' + Date.now() })).pipe(res);
});

app.use('/history/bitoex/:coin', function(req, res) {
  const url = 'https://www.bitoex.com/charts/price_history';

  req.pipe(request({ uri: url, qs: { currency: req.params.coin.toUpperCase() } })).pipe(res);
});

app.use('/maicoin/:coin', function(req, res) {
  const url = 'https://www.maicoin.com/api/prices/target-usd';

  if (
    req.params.coin !== 'btc' &&
    req.params.coin !== 'eth' &&
    req.params.coin !== 'ltc' &&
    req.params.coin !== 'usdt'
  ) return res.json({ msg: 'not found '});

  req.pipe(request({ uri: url.replace('target', req.params.coin) }))
    .pipe(res);
});

function padZero(str) {
  return ('0' + str).slice(-2);
}

function oneYearAgo() {
  const now = new Date();
  const year = now.getFullYear() - 1;
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = now.getHours();
  const mins = now.getMinutes();
  const seconds = now.getSeconds();

  return `${year}-${padZero(month)}-${padZero(day)} ${padZero(hours)}:${padZero(mins)}:${padZero(seconds)} +0800`;
}

app.use('/history/maicoin/:coin', function(req, res) {
  const url = 'https://www.maicoin.com/en/trade_summaries';

  request('https://www.maicoin.com/en/charts', (error, response, body) => {
    const $ = cheerio.load(body);
    const cookie = response.headers['set-cookie'].map(it => {
      return it.split(';')[0]
    }).filter(it => it.startsWith('_twcoin_session_production')).join(';');
    const csrfToken = $('meta[name="csrf-token"]').attr('content');

    request({
      url: `${url}/${req.params.coin.toLowerCase()}`,
      method: 'POST',
      qs: {
        from: oneYearAgo(),
      },
      headers: {
      'cookie': cookie,
      'x-csrf-token': csrfToken,
      'x-requested-with': 'XMLHttpRequest',
      },
    }, function(err, response2, body) {
      const str = body.split('data')[1];
      const data = str.split('xkey')[0];
      const d = data.replace(': ', '').replace(',\n', '');
      res.json(JSON.parse(d));
    });
  });
});

//Start the server by listening on a port
app.listen(port, () => {
  console.log("+---------------------------------------+");
  console.log("|                                       |");
  console.log(`|  [\x1b[34mSERVER\x1b[37m] Listening on port: \x1b[36m${port} 🤖  \x1b[37m |`);
  console.log("|                                       |");
  console.log("\x1b[37m+---------------------------------------+");
});
const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

app.use('/bitoex', function(req, res) {
  const url = 'https://www.bitoex.com/sync/dashboard'

  req.pipe(request({ uri: url + '/' + Date.now() })).pipe(res);
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

//Start the server by listening on a port
app.listen(port, () => {
  console.log("+---------------------------------------+");
  console.log("|                                       |");
  console.log(`|  [\x1b[34mSERVER\x1b[37m] Listening on port: \x1b[36m${port} 🤖  \x1b[37m |`);
  console.log("|                                       |");
  console.log("\x1b[37m+---------------------------------------+");
});
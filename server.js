const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;


const options =
  process.env.REDIS_PASSWORD ? {
    auth_pass: process.env.REDIS_PASSWORD
  } : {};

app.use(require('express-redis')(6379, '127.0.0.1', options));

app.use(cors());

app.get('/', function(req, res) {
  res.json({ 'msg': 'it works!' });
});

app.get('/price', function(req, res) {
  req.db.get('price', function (err, reply) {
    if (err) {
      return res.status(500).end();
    }

    res.json(JSON.parse(reply));
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
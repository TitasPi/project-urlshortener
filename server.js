require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const {URL} = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const shortUrls = ['https://www.google.com', 'https://www.kitm.lt'];
shortUrls.hasUrl = (url) => {
  if (shortUrls.findIndex((i) => i == url) === -1) return false;
  return true;
}
shortUrls.hasIndex = (id) => {
  if (shortUrls.length == 0) return false;
  if (shortUrls.length-1 < id || id < 0) return false;
  return true;
}

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl/', function(req, res) {
  let url;
  try {
    url = new URL(req.body.url);
    if(url.protocol !== 'http' || url.protocol !== 'https') throw new Error('invalid protocol');
  } catch (error) {
    return res.json({error: 'invalid url'});
  }
  dns.lookup(url.hostname, (err, address, family) => {
    if (err) return res.json({error: 'invalid url'});
    if(shortUrls.hasUrl(req.body.url)) {
      const index = shortUrls.findIndex((i) => i == req.body.url);
      return res.json({original_url: req.body.url, short_url: index});
    }
  
    shortUrls.push(req.body.url);
    res.json({original_url: req.body.url, short_url: shortUrls.length-1});
  })
})

app.get('/api/shorturl/:id', function(req, res) {
  if(!shortUrls.hasIndex(req.params.id)) {
    return res.json({error: 'No short URL found for the given input', shortUrls: shortUrls});
  }

  res.redirect(shortUrls[req.params.id]);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

var express = require('express'),
    expressLogging = require('express-logging'),
    logger = require('logops');

var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');

var app = express();
app.use(expressLogging(logger));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var srcPath = __dirname + '/../code/';

app.get('/api/test/*', function (req, res) {
  res.send(__dirname);
  res.send('Got a GET request')
})

app.get('/api/list/*', function (req, res) {
  var fileList = fs.readdirSync(srcPath);
  fileList = fileList.filter(function(x) {
    return x.match(/\.re$/);
  });
  fileList.sort();
  res.send(JSON.stringify(fileList));
});

app.get('/api/read/*', function (req, res) {
  var fname = path.basename(req.path);
  fname = path.join(srcPath, fname);
  res.send(fs.readFileSync(fname));
});

app.post('/api/write/*', function (req, res) {
  var bname = path.basename(req.path);
  var fname = path.join(srcPath, bname);
  var doc = req.body.doc;
  fs.writeFileSync(fname, doc);
  //throw new Error("broken");
  res.send('Saved file: ' + bname);
});

app.listen(8081);

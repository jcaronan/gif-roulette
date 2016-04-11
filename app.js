var path = require('path');
var express = require('express');
var session = require('cookie-session');
var config = require('./config')();
var logging = require('./lib/logging')();
var bodyParser = require('body-parser');

var app = express();

app.use(express.static(__dirname + '/view'));
//Store all HTML files in view folder.
app.use(express.static(__dirname + '/script'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/',function(req,res){
  res.sendFile('index.html');
  //It will find and locate index.html from view
});


// Add the request logger before anything else so that it can
// accurately log requests.
app.use(logging.requestLogger);

// Configure the session and session storage.
// MemoryStore isn't viable in a multi-server configuration, so we
// use encrypted cookies. Redis or Memcache is a great option for
// more secure sessions, if desired.
app.use(session({
  secret: config.secret,
  signed: true
}));

// OAuth2
var oauth2 = require('./lib/oauth2')(config.oauth2);
app.use(oauth2.router);

var images = require('./lib/images')(
  config.gcloud,
  config.cloudStorageBucket,
  logging
);


// Our application will need to respond to health checks when running on
// Compute Engine with Managed Instance Groups.
app.get('/_ah/health', function (req, res) {
  res.status(200).send('ok');
});

// Add the error logger after all middleware and routes so that
// it can log errors from the whole application. Any custom error
// handlers should go after this.
app.use(logging.errorLogger);


if (module === require.main) {
  // Start the server
  var server = app.listen(config.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
  });
}

module.exports = app;


// app.post('/save', function (req, res) {
// 	  console.log(req.body);
// 	var key = dataset.key('Gif');
//   	dataset.save({
//     	key: key,
//     	data: req.body
//  	 }, function (err) {
//     	console.log("\n\n\n\nERROOOOOOOOR!!!!");
//     	console.log(err);
//  	 });

//     album.acl.add({
//       entity: 'allUsers',
//       role: gcs.acl.READER_ROLE
//     }, function(err, aclObject) {});

//     album.acl.default.add({
//       entity: 'allUsers',
//       role: gcs.acl.READER_ROLE
//     }, function(err, aclObject) {});

//     var options = {
//       destination: 'new-image.gif',
//       resumable: true
//     };

//     bucket.upload(req.body, options, function(err, file) {
//       console.log(err);
//     });

//   res.end();
// });

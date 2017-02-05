var url = require('url');
var express = require('express');
var authenticator = require('./authenticator');
var config = require('./config');
var app = express();

// Add cookie parsing functionality to our Express app
app.use(require('cookie-parser')());

// app.set('views', __dirname)
app.set('view engine', 'ejs') // register the template engine

app.use(express.static('views'));

app.get('/', function(res, res) {
	res.render('home');
});

// Take user to Twitter's login page
app.get('/auth/twitter', authenticator.redirectToTwitterLoginPage);

// This is the callback url that the user is redirected to after signing in
app.get(url.parse(config.oauth_callback).path, function(req, res) {
	authenticator.authenticate(req, res, function(err) {
		if (err) {
			console.log(err);
			res.sendStatus(401);
		} else {
			res.send("Authentication Successful");
		}
	});
});

app.get('/tweet', function(req, res) {
	if(!req.cookies.access_token || !req.cookies.access_token_secret) {

		return res.redirect('/auth/twitter');
	}

	authenticator.post('https://api.twitter.com/1.1/statuses/update.json',
		req.cookies.access_token, req.cookies.access_token_secret,
		{
			status: "Oi oi m8"
		},
		function(error, data) {
			if (error) {
				return res.status(400).send(error);
			}

			res.send("Tweet successful!");
		});
});

// Start listening for requests
app.listen(config.port, function() {
	console.log("Listening on port " + config.port);
});
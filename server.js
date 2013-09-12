var express = require('express'),
	app = express();

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var db = require('./lib/db');
var crypto = require('crypto');


app.configure(function () {
	app.set('view engine', 'ejs');
	app.set('views', __dirname + '/public/views');
	app.use(express.static(__dirname + '/public'));
	app.use(express.cookieParser() );
	app.use(express.session({ secret: 'keyboard cat' }));
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
});

exports.model = model;
var model= new Model('localhost', 27017);

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  model.findUser(username, function(err, user){
  	done(null, user);
  })
})

passport.use(new LocalStrategy(function(username, password, done) {
    model.login(username, password, function(err, user){
    	if(err) done(err);
    	if(!user.username){
	    	return done(null, false, {message : 'Incorrect username'});
    	}
	    return done(null, user)

    })
}))

app.post('/login', passport.authenticate('local',{
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
}))

app.get('/logout', function (req, res){
  req.logout();
  res.redirect('/');
});

app.get('/', function(req, res){
	res.render('index');
})

app.get('/register', function(req, res){
	res.render('register');
})

app.get('/home', function(req, res){
	model.getPosts(function(err, docs){
		if(err) console.log('cannot get documents');
		res.render('home', {username : req.user.username, firstname : req.user.firstname, posts: docs});

	})

})

app.get('/accountSettings', function(req, res){
	var cipher=crypto.createDecipher('aes-256-cbc', "password")
	var enc = cipher.update(req.user.password, 'base64', 'utf8')
	enc += cipher.final('utf8');
	res.render('accountSettings', {username : req.user.username, firstname : req.user.firstname, middlename : req.user.middlename, 
			lastname : req.user.lastname, password: enc, email : req.user.email, id: req.user._id, user : req.user.firstname+' '+req.user.lastname});
})

app.post('/register/addUser', function (req, res) {
	model.addUser(req.body, function (err, entry) {
		if (err) {
			res.statusCode = 505;
			res.end('Something went wrong.');
		}
		res.redirect('/');

	})

})

app.post('/accountSettings/updateUser/:id', function (req, res) {
	model.updateUser(req.body, req.params.id, function (err, entry) {
		if (err) {
			res.statusCode = 505;
			res.end('Something went wrong.');
		}
		res.redirect('/accountSettings');

	})

});
app.post('/home/userstatus', function(req,res){
	model.userstatus(req.body, function(err, entry){
		if(err){
			res.end('Something went wrong');
		}
	})
	res.redirect('/home');
})

app.post('/profile/userstatus', function(req,res){
	model.userstatus(req.body, function(err, entry){
		if(err){
			res.end('Something went wrong');
		}
	})
	res.redirect('/profile');
})
app.get('/home/likePost/:id/:user', function(req, res){
	model.addLikes(req.params.id, req.params.user, function(err, entry){
		if(err) res.end(err);
	})
	res.redirect('/home');
})

app.get('/home/dislikePost/:id/:user', function(req, res){
	model.addDislikes(req.params.id, req.params.user, function(err, entry){
		if(err) res.end(err);		
	})
	res.redirect('/home');
})

app.get('/profile', function(req, res){
	model.getmyPosts(req.user.firstname, function(err, docs){
		if(err) res.end(err);
		res.render('profile', {username : req.user.username, firstname : req.user.firstname, middlename : req.user.middlename, 
			lastname : req.user.lastname, posts: docs, user : req.user.firstname+' '+req.user.lastname});
	})
})

app.get('/profile/deletePost/:id', function(req, res){
	model.deletePost(req.params.id, function(err){
		if(err) res.end(err);
		res.redirect('/profile');
	})
})

app.get('/accountSettings/deleteAcc/:id', function(req, res){
	var firstname=req.user.firstname;
	req.logout();
	model.deleteAcc(req.params.id,firstname, function(err){
		if(err) res.end(err);
		 res.redirect('/');
	})
})

app.listen(9090, function () {
	console.log('App listening on localhost:9090');
});
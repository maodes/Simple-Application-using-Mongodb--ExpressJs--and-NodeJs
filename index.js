var db = require('./lib/db2');

db.connect('');

db.connection.on('error', function(err) {
	console.log(err);
});

db.connection.on('open', function (db) {
	var todo = db.model('Todo');

	todo.insert({ entry: 'learn javascript'}, function (err, doc) {
		if (err) return console.log(err);

		idToRemove = doc._id;

		todo.insert({ entry: 'learn nodejs'}, function (err, doc) {
			if (err) return console.log(err);

			console.log(doc);
		});
	});
});
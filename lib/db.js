
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var crypto = require('crypto');


Model = function(host, port) {
  this.db= new Db('stdb', new Server(host, port, {safe: true}, {auto_reconnect: true}, {}));
  this.db.open(function(err, db){ 
    if(!err) {
        console.log("Connected to 'stdb' database");
    }
  });
};

Model.prototype.login = function(username, password, callback){
  var cipher=crypto.createCipher('aes-256-cbc', "password")
  var enc = cipher.update(password, 'binary', 'base64')
  enc += cipher.final('base64');
  this.db.collection('users' , {strict : true} , function(err, coll){
    if(!err) console.log('success get acc');
    coll.findOne({'username' : username}, function(err, doc){
      if(err) callback(err);
      callback(null, doc);
    });
  });
}

Model.prototype.findUser = function(username, callback){
  this.db.collection('users' , {strict : true} , function(err, coll){
    if(err) callback(err);
    coll.findOne({'username' : username}, function(err, doc){
      if(err) callback(err);
      callback(null, doc);
    });
  });
}


Model.prototype.getPosts = function(callback){
  this.db.collection('userPosts', {strict:true}, function(err, coll){
    if(err) console.log(err);
    coll.find().sort({_id:-1}).toArray(function(err, docs){
      if(err) callback(err);
      callback(null, docs)
    })
  })
}

Model.prototype.addUser = function(object, callback) {
  var cipher=crypto.createCipher('aes-256-cbc', "password")
  var enc = cipher.update(object['password'], 'binary', 'base64')
  enc += cipher.final('base64')  
  
  object['password'] = enc;
  this.db.collection('users', {strict:true}, function(err, coll) {
    if (!err) {
      console.log("The 'st' collection exists.");
    }

    coll.insert(object, function(err){
      if(err) return callback(err);
    })
    callback(null, object);
  });
}
Model.prototype.userstatus = function(object, callback){
  var _this = this;
  this.db.collection('userPosts', {strict:true}, function(err, coll) {
    if (err) return callback(err);
    object['likes']=[];
    object['dislikes']=[];
    coll.insert(object, function(err){
      if(err) return callback(err);
    })
    callback(null, object);
  });
}

Model.prototype.getAccount = function(query,callback){
  this.db.collection('users', {strict:true}, function(err, coll){
    if(err) callback(err);

    coll.findOne({'username' : object['username']}, function(err, doc){
      if(err) callback(err);
      callback(null, doc);
    })
  })
}

Model.prototype.addLikes = function(id, name, callback) {
  var obj_id = ObjectID(id);
  this.db.collection('userPosts', function(err, coll){
    if(err) callback(err);
    coll.update({_id : obj_id}, {$push : {likes : name}}, function(err, obj){
      if(err) callback(err);
      callback(null);
    })
  })
}

Model.prototype.addDislikes = function(id, name, callback) {
  var obj_id = ObjectID(id);
  this.db.collection('userPosts', function(err, coll){
    if(!err) console.log(name);

    coll.update({_id : obj_id}, {$push : {dislikes : name}}, function(err, obj){
      if(err) callback(err);
      callback(null);
    })
  })
}

Model.prototype.getmyPosts = function(name, callback){
  this.db.collection('userPosts', function(err, coll){
    if(err) callback(err);
    coll.find({user : name}).sort({_id:-1}).toArray(function(err, docs){
      if(err) callback(err);
      callback(null, docs);
    })
  })
}

Model.prototype.deletePost = function(id, callback) {
  var obj_id = ObjectID(id);
  this.db.collection('userPosts', function(err, coll){
    coll.remove({_id : obj_id}, 1,  function(err){
      if(err) callback(err);
      callback(null);
    })
  })
}

Model.prototype.updateUser = function(obj, id, callback){
  var obj_id = ObjectID(id);
  var cipher=crypto.createCipher('aes-256-cbc', "password")
  var enc = cipher.update(obj['password'], 'binary', 'base64')
  enc += cipher.final('base64');  

  this.db.collection('users', function(err, coll){
    coll.update({_id:obj_id}, {$set : {firstname : obj.firstname, middlename : obj.middlename, lastname : obj.lastname, username:obj.username,
      password: enc}}, function(err){
        if(err) callback(err);
        callback(null);
      })
  })
}

Model.prototype.deleteAcc = function(id, firstname, callback){
  var obj_id = ObjectID(id);
  this.db.collection('users', function(err, coll){
    coll.remove({_id : obj_id},1, function(err){
      if(err) callback(err);
    });
  });
  this.db.collection('userPosts', function(err, _coll){
    _coll.remove({user:firstname}, function(err){
      if(err) callback(err);
      callback(null);
    })
  })
}

var mongoose = require ('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var _postSchema = new Schema ({
    author          : {type: ObjectId, ref: 'User'},
    title           : String,
    datePublished   : Date,
    content         : String,
});

var _userSchema = new Schema ({
    lastName    : String,
    firstName   : String,
    email       : String,
    bio         : String,
    posts       : [{type: ObjectId, ref: 'Post'}]
});

exports.UserSchema = _userSchema;
exports.PostSchema = _postSchema;

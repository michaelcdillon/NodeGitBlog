var mongoose = require ('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var _postSchema = new Schema ({
    author          : {type: ObjectId, ref: 'User'},
    title           : String,
    fileName        : String,
    revisions       : [{type: ObjectId, ref: 'PostRevision'}],
    currentRevision : {type: ObjectId, ref: 'PostRevision'}
});

var _revisionSchema = new Schema ({
    author          : {type: ObjectId, ref: 'User'},
    commitId        : String,
    revisionDate    : Date,
    content         : String,
});

var _userSchema = new Schema ({
    name        : String,
    username    : String,
    email       : String,
    posts       : [{type: ObjectId, ref: 'Post'}],
    revisions   : [{type: ObjectId, ref: 'Revisions'}]
});

exports.UserSchema = _userSchema;
exports.PostSchema = _postSchema;
exports.RevisionSchema = _revisionSchema;

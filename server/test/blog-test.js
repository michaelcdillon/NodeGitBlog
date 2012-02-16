process.env.NODE_ENV = 'test';

var testCase = require ('nodeunit').testCase;

var blog = require ('../lib/blog');
var nodemock = require ('nodemock');

var mockedDao;

exports.groupParseMetaDataAndContent = testCase ({
    setUp: function (next) {
        next ();
    },

    tearDown: function (next) {
        next ();
    },

    parseGoodContentTest: function (test) {
        var goodContent = '{"title": "test title", "path": "testPath"}\nHere is content';
        
        blog.parseMetaDataAndContent (goodContent, function (data) {
            test.equal (data.meta.title, "test title");
            test.equal (data.meta.path, "testPath");
            test.done ();      
        });     
    },

    parseBadContentTest: function (test) {
        var badContent = "This is just content\nand it is missing the meta data";
        
        blog.parseMetaDataAndContent (badContent, function (data) {
            console.log ('Test Data: ', data);
            test.equal (data, null);
            test.done ();      
        });
    }
});

exports.groupPreparePost = testCase ({
    setUp: function (next) {
        mockedDao = nodemock.mock ("fetchPostForDisplay")
                            .takes ("Test Title", function (){})
                            .calls (1, [{
                                email : "email",
                                username : "username",
                                name : "name",
                            }, {
                                title : "title",
                            }, {
                                commitId : "commitId",
                                revisionDate : "revisionDate",
                                content : "content"
                            }]);

        blog.setup (mockedDao);
        next ();
    },

    tearDown: function (next) {
        blog.setup (null);
        next ();
    },
    
    preparePostTest: function (test) {
        var req = {
            params : {
                title : "Test Title",
            },
        };
        var res;

        blog.preparePost (req, res, function () {
            test.equal (req.postEmail, "email");
            test.equal (req.postUsername, "username");
            test.equal (req.postName, "name");
            test.equal (req.postCommitId, "commitId");
            test.equal (req.postDate, "revisionDate");
            test.equal (req.postTitle, "title");
            test.equal (req.postContent, "content");     
            test.done ();
        });
    },

    failsOnPurpose: function (test) {
        test.equal ("1", "1");
        test.done ();
    }
    
});

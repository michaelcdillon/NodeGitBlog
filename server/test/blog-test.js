process.env.NODE_ENV = 'test';

var testCase = require ('nodeunit').testCase;

var blog = require ('../lib/blog');


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
        next ();
    },

    tearDown: function (next) {
        next ();
    },

    
});

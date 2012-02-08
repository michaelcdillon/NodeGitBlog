#!/usr/bin/env node

try {
    var reporter = require ('nodeunit').reporters.default;
}
catch (e) {
    console.log ("Cannot find nodeunit module.");
    console.log ("Make sure you run 'npm install -d'");
    console.log ("");
    process.exit ();
}

process.chdir (__dirname);
reporter.run (['test']);

Blast.js
========

Blast is a tiny and powerful two-way databinding framework written in JavaScript

It supports:
- two-way databinding between a view model and DOM
- serialize your model to JSON
- bind changes on arbitrary events (keyup, change, etc)
- observe already existing javascript arrays/objects
- subscribe to changes manually

It is:
- super tiny (minified & gzipped around 500 bytes!)
- does not rely on jQuery and third party libs!
- very simple and intuitive to use

Testing & Code Coverage
=======================

Run Code Coverage using the following command (run npm install istanbul & npm install mocha beforehands)

istanbul cover --hook-run-in-context node_modules/mocha/bin/_mocha -- -R spec

Other dependencies: jsdom, chai. 
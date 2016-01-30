'use strict';
const fs = require("fs");
const browserify = require("browserify");
const glob = require("glob");

browserify('./public/jsx/app.jsx')
    .transform("babelify", {presets: ["es2015", "react"]})
    .bundle()
    .pipe(fs.createWriteStream('./public/js/app.js'));

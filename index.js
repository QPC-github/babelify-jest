var babel = require("babel-core");
var path = require('path');
var fs = require('fs');

module.exports = {
    process: function(src, filename) {
        // Allow the stage to be configured by an environment
        // variable, but use Babel's default stage (2) if
        // no environment variable is specified.
        var stage = process.env.BABEL_JEST_STAGE || 2;

        var getLastModulePath = function(filename) {
            var pathSegments = filename.split(path.sep);
            for (var s = pathSegments.length - 1; s > 0; --s) {
                var segment = pathSegments[s];
                if (segment === "node_modules") {
                    return pathSegments.slice(0, s + 2).join(path.sep);
                }
            }
        };

        var isBabelifyModule = function(filename) {
            var lastModulePath = getLastModulePath(filename);
            var packageJson = JSON.parse(fs.readFileSync(lastModulePath + "/package.json", "utf8"));
            if (packageJson.browserify && packageJson.browserify.transform) {
                var transformArray = packageJson.browserify.transform;
                for (var t = 0; t < transformArray.length; ++t) {
                    var transform = transformArray[t];
                    if (transform === "babelify" || Array.isArray(transform) && transform[0] === "babelify") {
                        return true;
                    }
                }
            }
            return false;
        };

        // Ignore all files within node_modules except babelify modules
        // babel files can be .js, .es, .jsx or .es6
        if ((filename.indexOf("node_modules") === -1 || isBabelifyModule(filename)) && babel.util.canCompile(filename)) {
            return babel.transform(src, {
                filename: filename,
                retainLines: true,
                auxiliaryCommentBefore: "istanbul ignore next"
            }).code;
        }

        return src;
    }
};

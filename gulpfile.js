var //eslint = require('gulp-eslint'),
    gulp = require('gulp'),
    request = require('request'),
    //argv = require('yargs').argv,
    fs = require('fs'),
    //sass = require('gulp-sass'),
    ftp = require('vinyl-ftp'),
    config = {
        // List of rules at http://eslint.org/docs/rules/
        // @todo Add more rules when ready.
        rules: {
            "comma-dangle": [2, "never"],
            "no-cond-assign": [1, "always"]
        }
    },
    paths = {
        "buildsDir": "./js/builds",
        "distributions": [
            './js/highcharts-3d.src.js', 
            './js/highcharts-more.src.js', 
            './js/highcharts.src.js', 
            './js/highmaps.src.js', 
            './js/highstock.src.js'
        ],
        "modules": ['./js/modules/*.js'],
        "parts": ['./js/parts/*.js'],
        "parts3D": ['./js/parts-3d/*.js'],
        "partsMap": ['./js/parts-map/*.js'],
        "partsMore": ['./js/parts-more/*.js'],
        "themes": ['./js/themes/*.js']
    };

    /*
    optimizeHighcharts = function (fs, path) {
        var wrapFile = './js/parts/Intro.js',
            WS = '\\s*',
            CM = ',',
            captureQuoted = "'([^']+)'",
            captureArray = "\\[(.*?)\\]",
            captureFunc = "(function[\\s\\S]*?\\})\\);((?=\\s*define)|\\s*$)",
            defineStatements = new RegExp('define\\(' + WS + captureQuoted + WS + CM + WS + captureArray + WS + CM + WS + captureFunc, 'g');
        fs.readFile(path, 'utf8', function (err, data) {
            var lines = data.split("\n"),
                wrap = fs.readFileSync(wrapFile, 'utf8');
            lines.forEach(function (line, i) {
                if (line.indexOf("define") !== -1) {
                    lines[i] = lines[i].replace(/\.\//g, ''); // Remove all beginnings of relative paths
                    lines[i] = lines[i].replace(/\//g, '_'); // Replace all forward slashes with underscore
                    lines[i] = lines[i].replace(/"/g, ''); // Remove all double quotes
                }
            });
            data = lines.join('\n'); // Concatenate lines
            data = data.replace(defineStatements, 'var $1 = ($3($2));'); // Replace define statement with a variable declaration
            wrap = wrap.replace(/.*@code.* /, data); // Insert code into UMD wrap
            fs.writeFile(path, wrap, 'utf8');
        });

    },
    bundleHighcharts = function (file) {
        var requirejs = require('requirejs'),
            fileName = file.slice(0, -3), // Remove file extension (.js) from name
            config = {
                baseUrl: './js/',
                name: 'builds/' + fileName,
                optimize: 'none',
                out: './js/' + file,
                onModuleBundleComplete: function (info) {
                    optimizeHighcharts(fs, info.path);
                }
            };

        requirejs.optimize(config, function (buildResponse) {
            console.log("Successfully build " + fileName);
        }, function(err) {
            console.log(err.originalError);
        });
    };

gulp.task('build', function () {
    var buildFiles = fs.readdirSync(paths.buildsDir);
    buildFiles.forEach(bundleHighcharts);
});

function doLint(paths) {
    return gulp.src(paths)
        .pipe(eslint(config))
        .pipe(eslint.formatEach())
        .pipe(eslint.failOnError());
}

gulp.task('lint', function () {
    var p = paths,
        files = argv.path ? p[argv.path] : p.distributions.concat(p.modules, p.parts, p.parts3D, p.partsMap, p.partsMore, p.themes);
    if (files) {
        doLint(files);
    } else {
        console.log(argv.path + " is not defined in paths.");
    }
});

gulp.task('styles', function () {
    var dir = './js/css/';

    gulp.src(dir + '*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(dir));
});
*/
// Watch changes to CSS files
gulp.task('default',function () {
    //gulp.watch('./js/css/*.scss',['styles']);
    gulp.watch('./js/*/*.js', ['scripts']);
});


gulp.task('ftp', function () {
    fs.readFile('./git-ignore-me.properties', 'utf8', function (err, lines) {
        var config = {};
        lines.split('\n').forEach(function (line) {
            line = line.split('=');
            if (line[0]) {
                config[line[0]] = line[1];
            }
        });
        
        var conn = ftp.create({
            host: config['ftp.host'],
            user: config['ftp.user'],
            password: config['ftp.password']
        });

        var globs = paths.distributions.concat(paths.modules);

        return gulp.src(globs, { base: './js', buffer: false })
            .pipe(conn.newer(config['ftp.dest']))
            .pipe(conn.dest(config['ftp.dest']));
    });
});

gulp.task('ftp-watch', function () {
    gulp.watch('./js/*/*.js', ['scripts', 'ftp']);
});

/**
 * Proof of concept to parse super code. Move this logic into the standard build when ready.
 */
gulp.task('scripts', function () {

    /**
     * Micro-optimize code based on the build object.
     */
    function preprocess(tpl, build) {
        /*
        // Escape double quotes and backslashes, to be reinserted after parsing
        tpl = tpl.replace(/"/g, '___doublequote___');
        tpl = tpl.replace(/\\/g, '\\\\');


        // Prepare newlines
        tpl = tpl.replace(/\n/g, '\\n');

        // Start supercode output, start first output string
        tpl = tpl.replace(/^/, 'var s = "');
        // Start supercode block, closes output string
        tpl = tpl.replace(/\/\*=\s?/g, '";\n');
        // End of supercode block, starts output string
        tpl = tpl.replace(/=\*\//g, '\ns += "');
        // End supercode output, end last output string
        tpl = tpl.replace(/$/, '";\nreturn s;');

        // Uncomment to preview generated supercode
        // fs.writeFile('temp.js', tpl, 'utf8');

        // The evaluation function for the ready built supercode
        func = new Function('build', tpl);

        tpl = func(build);
        tpl = tpl.replace(/___doublequote___/g, '"');

        // Collect trailing commas left when the tamplate engine has removed
        // object literal properties or array items
        tpl = tpl.replace(/,(\s*(\]|\}))/g, '$1');
        */

        return tpl;
    }

    // Parse the build properties files into a structure
    fs.readFile('./build.properties', 'utf8', function (err, lines) {
        var products = {};

        lines.split('\n').forEach(function (line) {
            var prod, key;
            if (line.indexOf('#') !== 0 && line.indexOf('=') !== -1) {
                line = line.split('=');
                key = line[0].split('.');
                prod = key[0];
                key = key[2];
                if (!products[prod]) {
                    products[prod] = {};
                }
                products[prod][key] = line[1];
            }
        });

        // Avoid gulping files in old branch after checkout
        /*
        if (products.highcharts.version.indexOf('4') === 0) {
            return;
        }
        */

        // Loop over the source files
        paths.distributions.forEach(function (path) {

            var prod,
                inpath = path
                .replace('./js/', '')
                .replace('.src.js', '')
                .replace('-', '');

            // highcharts, highmaps or highstock
            prod = inpath.indexOf('highcharts') !== -1 ? 'highcharts' : inpath;

            // Load through the local debug.php (todo: require)
            inpath = 'http://code.highcharts.local/debug.php?target=' + inpath;

            // Load the file
            request(inpath, function (err, res, tpl) {

                if (err) {
                    throw err;
                }

                // Unspecified date, use current
                if (!products[prod].date) {
                    products[prod].date = (new Date()).toISOString().substr(0, 10);
                }
                tpl = tpl
                    .replace(/@product\.name@/g, products[prod].name)
                    .replace(/@product\.version@/g, products[prod].version)
                    .replace(/@product\.date@/g, products[prod].date)
                    .replace(/@product\.cdnpath@/g, products[prod].cdnpath);

                // Create the classic file
                fs.writeFile(
                    path,
                    preprocess(tpl, {
                        classic: true
                    }), 
                    'utf8'
                );

                // Create the unstyled file
                /*
                fs.writeFile(
                    path.replace('.src.js', '.unstyled.src.js'), 
                    preprocess(tpl, {
                        classic: false
                    }), 
                    'utf8'
                );
*/
            });
        });
    });
});
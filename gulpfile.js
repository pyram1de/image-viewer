var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');
var jsFiles = ['*.js', 'src/**/*.js'];

gulp.task('style', function () {
    return gulp.src(jsFiles)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', {
            verbose: true
        }))
        .pipe(jscs());
});

gulp.task('inject', function () {
    var wiredep = require('wiredep').stream;
    var inject = require('gulp-inject');
    var injectSrc = gulp.src(['./public/css/*.css',
                              './public/js/*.js'], {
        read: false
    });

    var injectOptions = {
        ignorePath: '/public'
    };

    var options = {
        bowerJson: require('./bower.json'),
        directory: './public/lib',
        ignorePath: '../../public'
    };

    return gulp.src('./src/views/*.ejs')
        .pipe(wiredep(options))
        .pipe(inject(injectSrc, injectOptions))
        .pipe(gulp.dest('./src/views'));
});

gulp.task('serve',['style','inject'], function () {
    var options = {
        script: 'app.js',
        delayTime: 0,
        env: {
            'PORT': 5431
        },
        watch: jsFiles
    };

    return nodemon(options)
        .on('start',function(){
            startBrowserSync();
        })
        .on('restart', function (ev) {
            console.log('Restarting....');
            console.log(ev);
        });

});

function startBrowserSync(){
    if(browserSync.active){
        return;
    }

    var options = {
        proxy: 'localhost:' + 5431,
        port: 2801,
        files: ['.src/views/*.*', './public/**/*.*','./src/views/*.ejs','**/*.*'],
        ghostMode: {
            clicks: true,
            location: true,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'silent', // debug, info
        logPrefix: 'browser-sync',
        notify: true,
        reloadDelay: 1500
    };
    browserSync(options);
}
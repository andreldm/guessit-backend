var gulp = require('gulp');
var uglify = require('gulp-uglify');
var ts = require('gulp-typescript');

var tsConfig = require("../tsconfig.json").compilerOptions;


function compile(path){
    //console.log(path);
    return gulp.src([
            path
            ,"./node_modules/event-emitter-lite/dist/commonjs/*.d.ts"
        ])
        .pipe(ts(tsConfig))
        //.pipe(uglify())
        .pipe(gulp.dest(tsConfig.outDir));
};

gulp.task('compile',function(){
    return  compile("./src/**/*.ts");
});

module.exports = compile;
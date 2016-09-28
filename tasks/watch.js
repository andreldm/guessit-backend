var gulp = require('gulp');

var compileTs = require('./compile');

gulp.task('watch',['compile'],function(){
    gulp.watch('./src/**/*.ts').on('change',function(file){
        var search = "/";
        var path = file.path.replace(/\\/g,"/");
        var fileName = path.substring(path.lastIndexOf(search)+search.length,path.length);
        compileTs("./src/**/"+fileName);
    });
});

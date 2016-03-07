'use strict';

var gulp = require('gulp'),
    connect = require('gulp-connect');

gulp.task('serve', () => {
    connect.server();
});
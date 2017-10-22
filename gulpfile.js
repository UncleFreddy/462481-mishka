"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var minify = require('gulp-csso');
var rename = require("gulp-rename");
var imagemin = require('gulp-imagemin');
var svgstore = require('gulp-svgstore');
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var run = require('run-sequence');
var del = require('del');

gulp.task("style", function() {
  gulp.src("sass/*.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("css"))
    .pipe(server.stream());
});

gulp.task("images", function () {
  return gulp.src("img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo ()
    ]))
    .pipe(gulp.dest("img"));
});

gulp.task("sprite", function () {
  return gulp.src("img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg:true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("img"));
});

gulp.task("posthtml", function () {
  return gulp.src("img/icon-*.svg")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("."));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("copy", function(){
  return gulp.src([
    "fonts/**/*.{woff, woff2}",
    "img/**",
    "js/**",
    "css/style.min.css",
    "index.html",
    "catalog.html",
    "cart.html"
  ], {
    base: "."
  })
    .pipe(gulp.dest("build"));
});

gulp.task("build", function (done) {
  run(
    "clean",
    "copy",
    "style",
    "sprite",
    "posthtml",
    done);
});

gulp.task("serve", ["style"], function() {
  server.init({
    server: ".",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("*.html").on("change", server.reload);
});

import fs  from 'fs';
import path  from 'path';
import camelCase from 'camelcase';
import parsePackageJsonName from 'parse-packagejson-name';
import filter from 'gulp-filter';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import sourcemaps from 'gulp-sourcemaps';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import {logError, error} from '../utility';

// default task
export default function(gulp, pkg) {
  const { directories: dirs, config } = pkg;

  const shortPkgName = parsePackageJsonName(pkg.name).fullName
      , mainVar = config.build.mainVar || camelCase(shortPkgName, {pascalCase: true});

  // choose the destination folder
  const destinationFolder = dirs.dist;

  // determine the initial source file
  const sourceEntryPath = config.build.entryFile
    ? path.join(dirs.lib, config.build.entryFile)
    : pkg.main;

  const sourceEntryFilename = path.basename(sourceEntryPath);

  // webpack rules
  let rules = [{

    // all javascript files
    test: /\.js$/,

    // don't include node modules or bower components
    exclude: /(node_modules|bower_components)/,

    // use babel to compile for all js files
    loader: 'babel-loader',

    // optimize by caching
    options: {
      cacheDirectory: path.join(process.cwd(), dirs.tmp),
    }

  }]

  // webpack options
  let options = {

    output: {

      // output paths
      path: `/${dirs.dist}/`,
      publicPath: `/${dirs.dist}/`,

      // destination file name
      filename: shortPkgName + '.js',

      // configure the output library type
      libraryTarget: config.build.libraryTarget,

      // will name the AMD module of the UMD build
      umdNamedDefine: true,

      // configure the output variable
      library: mainVar,

      // prefix module filename to avoid duplicates among many of our projects
      devtoolModuleFilenameTemplate: `webpack:///${shortPkgName}/[resource-path]`

    },

    // rules
    module: { rules },

    // enable source-maps
    devtool: config.build.devtool

  };

  return gulp.src(sourceEntryPath)

    // stream webpack build
    .pipe(webpackStream(options, webpack))

    // add compiled output to the destination folder
    .pipe(gulp.dest(destinationFolder))

    // create minified and map sources
    .pipe(filter(['*', '!**/*.js.map']))
    .pipe(rename(config.exportFileName + '.min.js'))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(destinationFolder));
};

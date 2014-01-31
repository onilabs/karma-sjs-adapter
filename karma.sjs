#!/usr/bin/env sjs
var seq = require('sjs:sequence');
var str = require('sjs:string');
var path = require('nodejs:path');
var fs = require('sjs:nodejs/fs');

// ------------------
// run karma

exports.run = function(args) {
  var args = args ? args.slice() : require('sjs:sys').argv();
  var idx = args.indexOf('--');
  var karmaArgs = idx == -1 ? args : args.slice(0, idx);
  var clientArgs = idx == -1 ? [] : args.slice(idx+1);
  var command = (karmaArgs .. seq.filter(x -> !(x .. str.startsWith('-'))) .. seq.toArray)[0];

  if (command != 'run' && clientArgs.length > 0) {
    // karma only lets us pass arguments via the `run` command.
    // So we do it via an enironment variable (understood by the karma-sjs-adapter)
    // for other commands
    process.argv = process.argv.slice(0, 2).concat(karmaArgs);
    process.env['KARMA_CLIENT_ARGS'] = JSON.stringify(clientArgs);
  } else {
    process.argv = process.argv.slice(0, 2).concat(args);
  }
  // `karma` is the main karma module, but karma/bin/karma is the actual CLI script
  require('nodejs:karma/bin/karma');
};

if (require.main === module) {
  exports.run();
}

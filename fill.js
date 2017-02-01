var cluster = require('cluster');
var fs = require('fs');
var sprintf = require('sprintf');
var randomstring = require('randomstring');
var uuid = require('node-uuid');
var numCPUs = require('os').cpus().length;

var config = require('./config.json');



if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', function(deadWorker, code, signal) {
    var worker = cluster.fork();
    var newPID = worker.process.pid;
    var oldPID = deadWorker.process.pid;
    console.warn(
      "restarted dead worker. Was: %s became: %s. Code sent: %s, signal: %s",
      oldPID ? oldPID.toString() : "",
      newPID ? newPID.toString() : "",
      code ? code.toString() : "",
      signal ? signal.toString() : ""
    );
  });
}
else {
  var pid = process.pid;
  setTimeout(function() {
    var randomLongString = randomstring.generate(getRandomInt(config.stringMin, config.stringMax));
    fs.appendFile(config.inputLogFile, sprintf("%s\t%s\t%s\t%s\n", uuid.v1(), pid, randomLongString, pid), function(err) {
      if (err) {
        console.error(err);
      }
    });
    setTimeout(arguments.callee, getRandomInt(config.intervalMin, config.intervalMax));
  }, getRandomInt(config.intervalMin, config.intervalMax));

}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
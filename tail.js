var Tail = require('tail').Tail;
var fs = require('fs');

var config = require('./config.json');

(function (tailFile) {
  var usersTail = new Tail(tailFile);
  usersTail.on("line", function (line) {
    var parts = line.split(/\t/);
    if (parts.length != 4 || parts[1] !== parts[3]) {
      console.error("Failed parsing line: %s, strlen: %s, parts: %s", line, line.length, parts.length);
    }
    fs.appendFile(config.outputLogFile, line + "\n", function(err) {
      if (err) {
        console.error(err);
      }
    });
  });
})(config.inputLogFile);
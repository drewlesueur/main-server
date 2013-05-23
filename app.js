//TODO: prevent .. in file names
//TODO: email server too
//TODO: web socket server too like with socket.io
//TODO: actual cgi interface. see https://github.com/TooTallNate/node-cgi/blob/master/cgi.js
// TODO: see ftp server
// todo: a special handle all file that can handle all


var sitesFolder = "/home/drew/sites/";
var express = require('express');
var app = express();
app.use(express.bodyParser());
var fs = require('fs');
var exec = require('child_process').exec
var spawn = require('child_process').spawn


var isExecutablePermission = function (mode) {
  var mask = 1;
  var answer = !!(mask & parseInt((mode & parseInt ("777", 8)).toString(8)[0]))
  return answer;
}

app.all('*', function(req, res){
  var folder = req.host;
  var thePath = req.path
  var preSitePath = sitesFolder + req.host
  var runWithIt = function (sitePath) {
    fs.exists(sitePath, function (exists) {
      if (exists) {
        fs.stat(sitePath, function (err, stats) {
          if (stats.isDirectory()) {
            res.sendfile(sitePath + "/index.html")
          } else if (isExecutablePermission(stats.mode)) {
            console.log("it is executable")
            //exec(sitePath, function (err, stdout, stderror) {
            //  res.send(stdout.toString())
            //}) 
            process.env.query_json = JSON.stringify(req.query)
            process.env.body_json = JSON.stringify(req.body)
            var spawned = spawn(sitePath);
            res.set("Content-Type", "text/plain"); // for now;
            req.pipe(spawned.stdin)
            spawned.stdout.pipe(res)
          } else {
            console.log("not executable!")
            res.sendfile(sitePath)
          }
        })

      } else {
        res.send("this file is not found. Locally we tried to look at " + sitePath, 404)
      }
    })
  }
  if (req.path == "/") {
    thePath = "/index"
    fs.exists(preSitePath + "/index.html", function (exists) {
      if (exists) {
        runWithIt(preSitePath + "/index.html")
      } else {
        runWithIt(preSitePath + "/index")
      }

    })
  } else {
    runWithIt(preSitePath + req.path)
  }
  
});

app.listen(80);

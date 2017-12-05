#!/usr/bin/env nodejs
var schedule = require('node-schedule');

var j = schedule.scheduleJob('0 16 * * 5', function(){
  var updateDiff = true;
  return require("./dist/jobs").sendBoxSummary(updateDiff);
});

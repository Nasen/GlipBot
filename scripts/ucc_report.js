// Description:
//   This is a bot for ucc test report

require("babel-core").transform("code", {
  presets: ["es2017"]
});
var match;
var is_recorded;
var is_synced;
var reports;

module.exports = (robot)=> {

  robot.listen(
    (message)=> {
      is_recorded = false;
      match = false;
      is_synced = false;
      reports = {};
      let msg_text = message.text;
      var title = "", run = "", failed = "",
        passed = "", skipped = "", date_time = "";

      console.log("message: " + msg_text);
      if (msg_text.indexOf("Check console output at") > -1) {
        //message.room == '3146874886'
        //console.log("message text:\n" + text);
        //console.log("text type:" + typeof (text));
        match = true;

        console.log("meessage info:\n" + JSON.stringify(message));
        console.log("room: " + message.room);
        console.log("user id: " + message.user.id);
        var items = msg_text.split("\n");

        for (var i = items.length - 1; i >= 0; i--) {
          console.log(">>>>1——item_" + i + ": " + items[i]);
          if (items[i].isNull||items[i]=="") {
            items.splice(i, 1);
          }
        }

        for (var i = 0; i < items.length; i++) {
          console.log("new_" + i + ":" + items[i]);
        }

        for (var i = items.length - 1; i > 4; i--) {
          console.log("find the test result line");
          if (new RegExp("^Run:").test(items[i])) {
            break;
          } else {
            console.log(items[i] + "re result:" + new RegExp("^Run:").test(items[i]))
            items.splice(i, 1);
          }
        }

        title = items[0].split('»')[0]
        console.log("title: " + title);

        var result = items[items.length - 1];//the last line is the test result
        if (new RegExp("^Run:\\s*\\d+").test(result)) {//make sure the result has value
          console.log("result: "+result);
          var results = result.split(/[: ,]/);
          console.log("result length: "+results.length);


          for(var i=results.length-1;i>=0;i--){
            console.log(">>>>>2result_" + i + ": " + results[i]);
            if (results[i].isNull||results[i] == "") {
              results.splice(i, 1);
            }
          }

          date_time = new Date().toDateString();
          run = results[1];
          failed = results[3];
          passed = results[5];
          skipped = results[7];


          reports = {
            title: title,
            date_time: date_time,
            run: run,
            failed: failed,
            passed: passed,
            skipped: skipped,
          }
          console.log(JSON.stringify(reports));
        } else {
          match = false;
        }
      }

      return match;
    },

    (response)=> {
      var spreadsheetId = "1MZRJpHVixCy13tdZkkI0POcU3bLuO7Dj91DqTiKkN-A";
      var url = "http://devbox.example.com:3000/report/upsert/spreadsheets/" + spreadsheetId + "/sync";
      retrieveData(robot, url).then(function (result) {
        console.log("return is_recorded: " + result[0]);
        console.log("return is_synced: " + result[1]);
        if (is_recorded) {
          response.reply("This report is recorded.");
          if (is_synced) {
            response.reply("This report is synced to google sheet.");
          } else {
            response.reply("This report is not synced to google sheet automatically, please sync it manually.");
          }
        } else {
          response.reply("This report is not recorded automatically, please add it manually.");
        }
      })
    }
  )
}

function retrieveData(robot, url) {
  return new Promise(function (resolve, reject) {
    robot.http(url).header('Accept', 'application/json')
      .header('Content-Type', 'application/json')
      .post(JSON.stringify(reports))((err, res, body) => {
      if (err) {
        console.log("Encountered an error: " + err.toString());
      } else {
        console.log("res header:" + JSON.stringify(res.headers));
        console.log("res status code:" + JSON.stringify(res.statusCode));
        console.log("body: " + body);
        is_recorded = JSON.parse(body)['is_recorded'];
        is_synced = JSON.parse(body)['is_synced'];
        console.log(is_recorded);
        console.log(is_synced);
        resolve([is_recorded, is_synced]);
      }
    })
  })
}




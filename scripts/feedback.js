require("babel-core").transform("code", {
  presets: ["es2017"]
});
var match;
var is_recorded;
var is_synced;
var feedback;
var flag; // flag for http request result

module.exports = (robot)=> {


  robot.listen((message)=> {
      is_recorded = false;
      match = false;
      is_synced = false;
      flag = false;
      feedback = {};
      let text = message.text;
      console.log("message.text:\n" + text);
      console.log("text type:" + typeof (text));
      console.log("meessage info:\n" + JSON.stringify(message));
      console.log("room: "+message.room);

      let description, status, contact_name, mailboxID, device, version, os_version, occur_ime;
      //var re_subject = new RegExp("^Subject: RingCentral (\d+(\.\d+)*) (Android|iOS) Feedback (\+\d+ \(\d+\) \d+)\s*,\s*(.+) (.+)$");
      //var re_from = new RegExp("");
      //var re_date = new RegExp("");

      if (typeof(text) == "string" && text.indexOf("RC Mobile Feedback") > -1 && message.room=='46352326658') {
        match = true;
        var section = new Array();
        section = text.split('\n\n');
        for (i = 0, len = section.length; i < len; i++) {
          console.log("String_" + i + ": " + section[i]);
        }

        feedback = {
          description: "test",
          contactName: "contactName",
          status: "new",
          device: "device",
          version: "version",
          osVersion: "osVersion",
          occurTime: "occurTime",
          mailboxID: "mailboxID"
        }

        console.log(JSON.stringify(feedback));
      }
      return match;
    },
    (response)=> {
      console.log("is_recorded: " + is_recorded);
      console.log("is_synced: " + is_synced);
      var spreadsheetId = "1cY7G405Ag7l4VmftIhR1hpmo7pveCHn8bPevr9P4IYA";
      var url = "http://devbox.example.com:3000/upsert/" + spreadsheetId + "/autosync";
      retrieveData(robot, url).then(function (result) {
        console.log("return is_recorded: " + result[0]);
        console.log("return is_synced: " + result[1]);
        if (is_recorded) {
          response.reply("This feedback is recorded.");
          if (is_synced) {
            response.reply("This feedback is synced to google sheet.");
          } else {
            response.reply("This feedback is not synced to google sheet automatically, please sync it manually.");
          }
        } else {
          response.reply("This feedback is not recoded automatically, please add it manually.");
        }
      })
    }
  )
}

function retrieveData(robot, url) {
  return new Promise(function (resolve, reject) {
    robot.http(url).header('Accept', 'application/json')
      .header('Content-Type', 'application/json')
      .post(JSON.stringify(feedback))((err, res, body) => {
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




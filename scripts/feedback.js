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
      let description = "", status = "", contact_name = "",
        mailboxID = "", device = "", version = "", os_version = "", occur_time = "";
      //var re_subject = new RegExp("^Subject: RingCentral (\d+(\.\d+)*) (Android|iOS) Feedback (\+\d+ \(\d+\) \d+)\s*,\s*(.+) (.+)$");

      if (typeof(text) == "string" && text.indexOf("RC Mobile Feedback") > -1 && message.room == '46352326658') {
        //console.log("message text:\n" + text);
        //console.log("text type:" + typeof (text));
        match = true;

        console.log("meessage info:\n" + JSON.stringify(message));
        console.log("room: " + message.room);

        var items = text.split("\n");


        for (var i = items.length; i >= 0; i--) {
          console.log("item_" + i + ": " + items[i]);
          if (items[i] == "") {
            items.splice(i, 1);
          }
        }

        for (var i = 0; i < items.length; i++) {
          console.log("new_" + i + ":" + items[i]);
        }

        var from = items[0];
        console.log("from= " + from);
        contact_name = from.split("<")[0].split('From:')[1] + "<" + from.split('<')[1] + ">";
        console.log("contact name:" + contact_name);
        var data = items[1];
        occur_time = data.split("Date: ")[1];
        console.log("occur time:" + occur_time);
        var subject = items[3];
        console.log("subject:" + subject);


        var info
        if(new RegExp("Android Feedback").test(subject)){
          console.log(">>>>?1");
          info = subject.match(new RegExp("^Subject: RingCentral (\\d+(\\.\\d+)*) (Android?) Feedback (\\+\\d+ \\(\\d+\\) \\d+)\\s*,\\s*(.+)/(.+)$"));
          for (var i = 0; i < info.length; i++) {
            console.log(i + ": " + info[i]);
          }

          version = info[1];
          device = info[5];
          os_version = info[6];
          console.log("Version: " + version);
        }else{
          console.log(">>>>?2");
          info=subject.match(new RegExp("^Subject: RingCentral (\\d+(\\.\\d+)*) Feedback (\\+\\d+ \\(\\d+\\) \\d+ \\* \\d+)\\s*,\\s*(.+)/(.+)$"));
          for (var i = 0; i < info.length; i++) {
            console.log(i + ": " + info[i]);
          }
          version = info[1];
          device = info[4];
          os_version = info[5];
          console.log("Version: " + version);
        }


        for (var i = items.length; i > 3; i--) {
          var re = new RegExp("^RingCentral");
          if (re.test(items[i])) {
            var er = new RegExp("^Please describe your problem here");

            if (er.test(items[4])) {
              for (var j = 5; j < i; j++) {
                console.log(">>>>>>1" + items[j]);
                description += items[j] + "/n";
              }
            } else {
              for (var j = 4; j < i; j++) {
                console.log(">>>>>>2" + items[j]);
                description += items[j] + "/n";
              }
            }


            console.log("this msg: " + items[i]);
            var temp = items[i].split(', ');
            console.log("temp length:" + temp.length);
            mailboxID = temp[temp.length - 1];
            break;
          }else{
            //TODO
          }
        }

        console.log("description: " + description);
        console.log("mailboxID: " + mailboxID);


        feedback = {
          description: description,
          contactName: contact_name,
          status: "new",
          device: device,
          version: version,
          osVersion: os_version,
          occurTime: occur_time,
          mailboxID: mailboxID
        }

        console.log(JSON.stringify(feedback));
      }
      return match;
    },
    (response)=> {
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




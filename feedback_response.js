var is_recorded;
var is_synced;
var feedback;

module.exports = (robot)=> {
  //var re_subject = new RegExp("^Subject: RingCentral (\d+(\.\d+)*) (Android|iOS) Feedback (\+\d+ \(\d+\) \d+)\s*,\s*(.+) (.+)$");
  //var re_from = new RegExp("");
  //var re_date = new RegExp("");

  robot.respond(/.*./,
    (message)=> {
      let description, status, contact_name, mailboxID, device, version, os_version, occur_ime;

      is_recorded = false;
      is_synced = false;
      let text = message.text;
      console.log("message.text:\n" + text);
      console.log("text type:" + typeof (text));
      console.log("meessage info:\n" + JSON.stringify(message));

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

      var spreadsheetId = "1cY7G405Ag7l4VmftIhR1hpmo7pveCHn8bPevr9P4IYA";
      var url = "http://devbox.example.com:3000/upsert/" + spreadsheetId + "/autosync";

      robot.http(url)
        .header('Accept', 'application/json')
        .header('Content-Type', 'application/json')
        .post(JSON.stringify(feedback))((err, res, body) => {
        if (err) {
          console.log("Encountered an error: " + err.toString());
          message.send("Encountered an error: " + err.toString());
        } else {
          console.log("res header:" + JSON.stringify(res.headers));
          console.log("res status code:" + JSON.stringify(res.statusCode));
          console.log("body: " + body);
          is_recorded = JSON.parse(body)['is_recorded'];
          is_synced = JSON.parse(body)['is_synced'];
          console.log(is_recorded);
          console.log(is_synced);

          if (is_recorded) {
            if (is_synced) {
              message.send("This feedback is recorded and synced to google doc")
            } else {
              message.send("This feed back is recorded, but sync failed")
            }
          } else {
            message.send("This feedback is not recorded successfully.")
          }
        }
      })
    }
  )
}




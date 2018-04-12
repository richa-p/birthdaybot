var env = require('process').env
var axios = require('axios')
var CronJob = require('cron').CronJob;

var url = env.SLACK_INCOMING_WEBHOOK_BOT_TESTING

var body = {
	text: 'Hello!',
	username: 'Chetna'
}


var job = new CronJob('00 16 21 * * 1-5', function() {
  /*
   * Runs every weekday (Monday through Friday)
   * at 11:30:00 AM. It does not run on Saturday
   * or Sunday.
   */
	
	axios.post(url, body).then((response) => console.log(response)).catch((err) => console.log(err))
  }, function () {
    /* This function is executed when the job stops */
  },
  true, /* Start the job right now */
  'America/Chicago' /* Time zone of this job. */
);

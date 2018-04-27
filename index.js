const env = require('process').env
const axios = require('axios')
const CronJob = require('cron').CronJob
const aws = require('aws-sdk')

const url = env.SLACK_INCOMING_WEBHOOK_BOT_TESTING

const s3 = new aws.S3({
    accessKeyId: env.BOT_AWS_ACCESS_KEY_ID,
    secretAccessKey: env.BOT_AWS_SECRET_ACCESS_KEY
})

const params = {
    Bucket: env.S3_BUCKET_NAME,
    Key: env.S3_FILE_PATH
}

function getBirthdayList() {
    s3.getObject(params, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log("Found:", JSON.parse(data.Body.toString()))
        }
    })
}

const body = {
    text: 'Hello!',
    username: 'Chetna'
};


let job = new CronJob('00 16 15 * * 1-5', function () {
    getBirthdayList();
	axios.post(url, body).then((response) => console.log(response)).catch((err) => console.log(err))
  }, function () {
    /* This function is executed when the job stops */
  },
  true, /* Start the job right now */
  'America/Chicago' /* Time zone of this job. */
);

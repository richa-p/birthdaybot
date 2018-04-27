const env = require('process').env
const axios = require('axios')
const CronJob = require('cron').CronJob
const aws = require('aws-sdk')
const moment = require('moment')

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
    return new Promise ((resolve, reject) => {
        s3.getObject(params, (err, data) => {
            if(err) {
                reject(err)
            }
            else {
                resolve(JSON.parse(data.Body.toString()))
            }
        })
    })
}

const body = {
    text: 'Hello!',
    username: 'Testing'
};


// let job = new CronJob('00 16 15 * * 1-5', function () {
let job = new CronJob('*/2 * * * * 1-5', function () {
    getBirthdayList().then((birthdays) => {
        let now = moment();
        let month = now.format('MMMM');
        let day = now.date();
        day = 23
        // console.log(birthdays)
        let isBirthdayToday = (birthday) => birthday.birthDay === day && birthday.birthMonth === month;
        let toFullName = (birthday) => `${birthday.firstName} ${birthday.lastName}`;
        let fullNames = birthdays.filter(isBirthdayToday).map(toFullName);
        fullNames.forEach((fullName) => {
            console.log(`Happy birthday ${fullName}`)
        })

    }).catch((err) => {
        console.log('Error!', err)
    })

	// axios.post(url, body).then((response) => console.log(response)).catch((err) => console.log(err))
  }, function () {
    /* This function is executed when the job stops */
  },
  true, /* Start the job right now */
  'America/Chicago' /* Time zone of this job. */
);

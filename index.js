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

function getAllBirthdays() {
    return new Promise((resolve, reject) => {
        s3.getObject(params, (err, data) => {
            if (err) {
                reject(err)
            }
            else {
                resolve(JSON.parse(data.Body.toString()))
            }
        })
    })
}

function filterBirthdays(moment, birthdays) {
    let isBirthdayToday = (birthday) => birthday.birthDay === moment.date() && birthday.birthMonth === moment.format('MMMM');
    return birthdays.filter(isBirthdayToday);
}

function getBirthdayList() {
    getAllBirthdays().then((birthdays) => {
        const now = moment();
        now.date(23);
        const todaysBirthdays = filterBirthdays(now, birthdays);
        let weekendBirthdays = [];
        if (now.day() === 1) {
            weekendBirthdays = checkForWeekendBirthdays(now, birthdays);
        }
        const messages = [];
        todaysBirthdays.forEach((birthday) => {
            messages.push(`Happy birthday ${birthday.firstName} ${birthday.lastName}`);
        })
        if (weekendBirthdays.length > 0) {
            messages.push('\nWe missed wishing you over the weekend..')
        }
        weekendBirthdays.forEach((birthday) => {
            messages.push(`Belated Happy birthday ${birthday.firstName} ${birthday.lastName} (${birthday.birthDay} ${birthday.birthMonth})`);
        })
        messages.forEach((message) => {
            console.log(message);
        })
    }).catch((err) => {
        console.log('Error!', err)
    })
}

function checkForWeekendBirthdays(now, birthdays) {
    //console.log(birthdays);
    const sunBirthdays = filterBirthdays(now.subtract(1, 'days'), birthdays);
    const satBirthdays = filterBirthdays(now.subtract(1, 'days'), birthdays);
    return sunBirthdays.concat(satBirthdays);
}

const body = {
    text: 'Hello!',
    username: 'Testing'
};


// let job = new CronJob('00 16 15 * * 1-5', function () {
let job = new CronJob('*/2 * * * * 1-5', function () {
        getBirthdayList();
        // axios.post(url, body).then((response) => console.log(response)).catch((err) => console.log(err))
    }, function () {
        /* This function is executed when the job stops */
    },
    true, /* Start the job right now */
    'America/Chicago' /* Time zone of this job. */
);

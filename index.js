const rp = require('request-promise'),
      cheerio = require('cheerio'),
      Table = require('cli-table');

let users = [];
let table = new Table({
    head : ['username', 'Like', 'challenges'],
    colWidth: [15, 5, 10]
});

const options = {
    url: `https://forum.freecodecamp.org/directory_items?period=weekly&order=likes_received&_=1518798022257`,
    json: true
};

rp(options)
    .then((data) => {
    "use strict";

        let userData = [];

        for (let user of data.directory_items) {
            userData.push({
                name: user.user.username,
                likes_received: user.likes_received});
        }
        process.stdout.write('loading');
        getChallengesCompletedAndPushToUserArray(userData);

    }).catch((err) => {
    "use strict";
    console.log(err);
});

function getChallengesCompletedAndPushToUserArray (userData) {
    var i = 0;
    function next () {
        if(i < userData.length) {
            var options = {
                url: `https://forum.freecodecamp.org/u/${userData[i].name}`,
                transform: body => cheerio.load(body)
            };
            rp(options)
                .then($ => {
                    "use strict";
                    process.stdout.write(`.`);
                    const fccAccount = $('h1.landing-heading').length == 0;
                    const challengesPassed = fccAccount ? $('tbody tr').length : 'unknown';
                    table.push([userData[i].name, userData[i].likes_received, challengesPassed]);
                    ++i;
                    return next();
                })
        } else {
            printData();
        }
    }
    return next();
}

function printData () {
    console.log("ok");
    console.log(table.toString());
}
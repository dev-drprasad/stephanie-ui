const path = require('path');
const express = require('express');
const AWS = require('aws-sdk');
const hbs = require('express-handlebars').create({ defaultLayout: 'main' });

AWS.config.update({ region: 'us-east-2' });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const app = express();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/healthcheck', (req, res) => res.send('I am doing fine! 😎 '));

app.get('/', (req, res) => {
  dynamodb.scan({ TableName: 'mentors' }, (err, response) => {
    const mentors = response.Items.map(mentor => Object.assign(mentor, {
      twitter_url: `https://twitter.com/${mentor.username}`,
      tweet: mentor.tweet.trim().replace(/https:\/\/t\.co\/\w+$/, ''),
      profile_image: mentor.profile_image || 'https://abs.twimg.com/sticky/default_profile_images/default_profile.png',
    }));
    res.render('home', { mentors });
  });
});

app.use('/static', express.static(path.join(__dirname, 'public')));

module.exports = app;

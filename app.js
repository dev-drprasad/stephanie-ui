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
  const options = { TableName: 'mentors' };
  if (req.query.q) {
    options.FilterExpression = 'contains(tweet, :search) OR contains(bio, :search)';
    options.ExpressionAttributeValues = { ':search': req.query.q.trim() };
  }

  dynamodb.scan(options, (err, response) => {
    if (err) console.log(err, err.stack);
    const mentors = response.Items.map(mentor => Object.assign(mentor, {
      twitter_url: `https://twitter.com/${mentor.username}`,
      tweet: mentor.tweet.trim().replace(/https:\/\/t\.co\/\w+$/, ''),
      profile_image:
        mentor.profile_image
          ? mentor.profile_image.replace(/(\.[A-Za-z]{3,4})$/, '_bigger$1')
          : 'https://abs.twimg.com/sticky/default_profile_images/default_profile.png',
    }));
    console.log(`Found ${mentors.length} for given search criteria q: ${req.query.q}`);
    res.render('home', { mentors });
  });
});

app.use('/static', express.static(path.join(__dirname, 'public')));

module.exports = app;

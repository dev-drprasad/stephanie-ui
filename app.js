const path = require('path');
const express = require('express');
const AWS = require('aws-sdk');

const hbs = require('express-handlebars').create({
  defaultLayout: 'main',
  helpers: {
    contentFor(name, options) {
      if (!this.contentFor) this.contentFor = {};
      this.contentFor[name] = options.fn(this);
      return null;
    },
  },
});

AWS.config.update({ region: 'us-east-2' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const app = express();

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/healthcheck', (req, res) => res.send('I am doing fine! 😎 '));

app.get('/', (req, res) => {
  const options = { TableName: 'mentors' };

  const q = req.query.q ? req.query.q.trim() : '';
  if (q) {
    options.FilterExpression = 'contains(tweet, :search) OR contains(bio, :search)';
    options.ExpressionAttributeValues = { ':search': q };
  }

  dynamodb.scan(options, (err, response) => {
    if (err) console.error(err, err.stack);
    console.log(`Found ${response.Items.length} for search criteria q: ${q}`);

    const mentors = response.Items.map(mentor => Object.assign(mentor, {
      twitter_url: `https://twitter.com/${mentor.username}`,
      tweet: mentor.tweet.trim().replace(/https:\/\/t\.co\/\w+$/, ''),
      profile_image:
        mentor.profile_image
          ? mentor.profile_image.replace(/(\.[A-Za-z]{3,4})$/, '_bigger$1')
          : 'https://abs.twimg.com/sticky/default_profile_images/default_profile.png',
    }));

    res.render('home_', { mentors });
  });
});

app.use('/static', express.static(path.join(__dirname, 'public')));

module.exports = app;

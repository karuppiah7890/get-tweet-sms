console.log("Twitter Bot is starting.");

const Twit = require('twit');
var twilio = require('twilio');

var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;

//create a REST client
var client = twilio(accountSid, authToken);

// use Twitter API provided keys below. Get them at dev.twitter.com
var T = new Twit({
  consumer_key:         process.env.TWITTER_CONSUMER_KEY, // twitter consumer key
  consumer_secret:      process.env.TWITTER_CONSUMER_SECRET, // twitter consumer secret
  access_token:         process.env.TWITTER_ACCESS_TOKEN, // twitter access token
  access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET, // twitter access token secret
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});

var userStream = T.stream('user');

userStream.on('follow',followed);

function followed(event) {
  var name = event.source.name;
  var screen_name = event.source.screen_name;

  console.log(name,screen_name);

  sendSMS(`${name} (@${screen_name}) followed you`);
}

userStream.on('tweet',tweeted);

function tweeted(event) {
  var replyTo = event.in_reply_to_screen_name;
  var from = event.user.screen_name;
  var name = event.user.name;
  var tweet = event.text;

  console.log(event);

  if(replyTo === process.env.MY_TWITTER_HANDLE) {
    sendSMS(`${name}(@${from}) tweeted: ${tweet}`)
  }
  else {
    sendSMS(`${name}(@${from}) mentioned: ${tweet}`)
  }
}

function sendSMS(message) {
  client.messages.create({
      to: process.env.MY_MOBILE_NUMBER,
      from: process.env.TWILIO_NUMBER,
      body: message,
  }, (err, msg) => {
      if(err){
          console.log(err);
          return;
      }
      console.log(msg.sid);
  });
}

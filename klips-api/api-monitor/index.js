import fetch from 'node-fetch';
import 'dotenv/config';

// read environment variables
const user = process.env.API_USERNAME;
const password = process.env.API_PASSWORD;
const apiUrl = process.env.API_URL;
const errorText = process.env.ALERT_TEXT_TEMPLATE;

/**
 * Sends text to the mattermost chat.
 *
 * @param {String} text The text to send to the mattermost chat
 */
async function sendMattermostAlert(text) {

  const matterMostUrl = process.env.MATTERMOST_HOOK_URL;

  const message = {
    text: text
  };

  if (process.env.NODE_ENV === 'dev') {
    console.log("DEV mode - text only printed and not sent to chat");
    console.log(text);
  } else {
    const response = await fetch(matterMostUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (response.ok) {
      console.log('INFO', 'Successfully sent notification to Mattermost');
    } else {
      console.error('ERROR', 'Sending notification to Mattermost failed');
    }
  }
}

const authBase64 = Buffer.from(user + ':' + password).toString('base64');
var requestOptions = {
  method: 'GET',
  headers: {
    Authorization: `Basic ${authBase64}`
  }
};

const url = `${apiUrl}/status`;
fetch(url, requestOptions)
  .then(response => {
    return response.json();
  })
  .then(result => {
    if (result.message === 'Status: active') {
      console.log('SUCCESS: Connection to API is okay.');
    } else {
      sendMattermostAlert(errorText);
    }
  })
  .catch(error => {
    console.log('error', error);
    sendMattermostAlert(errorText);
  });

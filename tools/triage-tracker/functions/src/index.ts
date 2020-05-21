import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

admin.initializeApp();

export const logGitHubEvent = functions.https.onRequest(async (req, response) => {
  // GitHub webhook has a secret associated with it. We have the same secret in the Firebase
  // function config. We sha1 hash that secret from config and compare it to what GitHub sent.
  const signatureFromGithub = req.headers['x-hub-signature'];
  const hmac = crypto.createHmac('sha1', functions.config().github.secret)
      .update(req.rawBody)
      .digest('hex');
  const expectedSignature = `sha1=${hmac}`;

  if (signatureFromGithub !== expectedSignature) {
    console.error('x-hub-signature', signatureFromGithub, 'did not match', expectedSignature);
    return response.status(403).send('x-hub-signature does not match expected signature');
  }

  // const event = request.body;
  // const snapshot = await admin.database().ref('/messages').push({original: request});
  console.log(JSON.stringify(req.body));

  return response.status(200).send();
});


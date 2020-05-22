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
  // We only care about label events for the fix-it
  if (req.body.action === 'labeled' || req.body.action === 'closed') {

    // Handle events differently for each repo.
    switch (req.body.repository.full_name) {
      case ('angular/components'):
        await processComponentsEvent(req.body);
        break;
    }
  }

  return response.status(200).send();
});

async function processComponentsEvent(event: any) {
  const triageLabelExp = /(P\d)|(needs clarification)|(cannot reproduce)/;
  const triageLabel = triageLabelExp.test(event.label.name) ? event.label.name : '';
  if (event.action === 'closed' || triageLabel) {
    return writeEventToDatabase('components', {
      action: event.action,
      issueNumber: event.issue.number,
      label: triageLabel,
      user: event.sender.login,
      timestamp: Date.now(),
    });
  }

  return Promise.resolve();
}

async function writeEventToDatabase(repo: string, triageData: TriageData) {
  // Use `set` rather than push so that we key by issue number.
  return admin.database().ref(`/${repo}/${triageData.issueNumber}`).set(triageData);
}


interface TriageData {
  issueNumber: string;
  action: string;
  label: string;
  user: string;
  timestamp: number;
}

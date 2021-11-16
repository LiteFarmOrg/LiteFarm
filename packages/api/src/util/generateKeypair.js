/**
 * This module will generate a public and private keypair and save to current directory
 *
 * Make sure to save the private key elsewhere after generated!
 */
const crypto = require('crypto');

function genKeyPair() {
  // Generates an object where the keys are stored in properties `privateKey` and `publicKey`
  const keyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
  console.log('publicKey');
  console.log(`"${keyPair.publicKey.replace(/\n/g, '\\n')}"`);
  console.log('privateKey');
  console.log(`"${keyPair.privateKey.replace(/\n/g, '\\n')}"`);
}

// Generate the keypair
genKeyPair();

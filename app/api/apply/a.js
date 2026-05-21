const { createDecipheriv } = require('crypto');

const encrypted = '82330dd890df6f1989d0dc09.bb4b94fd68563a63ce1fda2c9e08c440f47e4a33c45166eaeee581b19b4ffc8eff3e7c39457efc1a76560d4eb81948a1008bd473bad8f43c84.4537864f9f66bb56488111e4bd829689';
const secret = 'b7e2a1c4d5f6e7b8c9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2'; // your TOKEN_FETCH_SECRET

function decryptToken(encrypted, secret) {
  const [ivHex, encHex, tagHex] = encrypted.split('.');
  const key = Buffer.from(secret, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const enc = Buffer.from(encHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(enc) + decipher.final('utf8');
}

console.log(decryptToken(encrypted, secret));
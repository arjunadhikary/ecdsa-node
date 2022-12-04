const { utils, getPublicKey } = require('ethereum-cryptography/secp256k1');
const { toHex } = require('ethereum-cryptography/utils');
const fs = require('fs');
const generateAddress = (limit) => {
  let address = {};
  for (let index = 0; index < limit; index++) {
    const privateKey = utils.randomPrivateKey();
    const publicKey = getPublicKey(privateKey);
    const walletAddress = toHex(publicKey.slice(1).slice(-20));
    console.log(`public key  : ${toHex(publicKey)}`);
    console.log(`private key : ${toHex(privateKey)}`);
    console.log(`address     : ${walletAddress}\n`);
    address[walletAddress] = Math.floor(Math.random() * 100);
  }
  return address;
};

async function storeAddressInFile() {
  fs.writeFileSync(
    '../../address.json',
    JSON.stringify(generateAddress(3)),
    'utf-8'
  );
}

storeAddressInFile();

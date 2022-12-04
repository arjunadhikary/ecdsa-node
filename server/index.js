const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const fs = require('fs');

const secp = require('ethereum-cryptography/secp256k1');
const keccak = require('ethereum-cryptography/keccak');
const utils = require('ethereum-cryptography/utils');

app.use(cors());
app.use(express.json());

const balances = JSON.parse(fs.readFileSync('../address.json', 'utf-8'));

app.get('/balance/:address', (req, res) => {
  const { address } = req.params;
  console.log(address);
  console.log(balances);
  const balance = balances[address] || 0;
  console.log(balance);
  res.send({ balance });
});
const dataValidation = async (req, res, next) => {
  try {
    if (!req.body.data.recipient) throw new Error('Specify the sender!');
    const isValidBalance = +req.body.data.amount > 0;
    if (!isValidBalance) throw new Error('Invalid Amount');
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
  next();
};

app.post('/send', dataValidation, (req, res) => {
  const { messageHash, signedResponse, data } = req.body;
  const amount = data.amount;
  const sender = data.sender;
  setInitialBalance(data.sender);
  setInitialBalance(data.recipient);
  const isValid = isValidSender(messageHash, signedResponse, sender);
  if (!isValid) return res.status(400).send({ message: 'Not a valid sender!' });

  if (balances[sender] < amount) {
    res.status(400).send({ message: 'Not enough funds!' });
  } else {
    balances[sender] -= amount;
    balances[data.recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
const isValidSender = (messageHash, signedResponse, sender) => {
  const signature = Uint8Array.from(Object.values(signedResponse[0]));
  const publicKey = secp.recoverPublicKey(
    messageHash,
    signature,
    signedResponse[1]
  );
  const isSigned = secp.verify(signature, messageHash, publicKey);

  const isValidSender =
    sender.toString() === getAddressFromPublicKey(publicKey);
  console.log(sender, getAddressFromPublicKey(publicKey));
  if (!isValidSender && isSigned) return false;
  return true;
};

const getAddressFromPublicKey = (pk) => {
  console.log(pk);
  const walletAddress = utils.toHex(pk.slice(1).slice(-20));
  return walletAddress.toString();
};

import server from './server';

import * as secp from 'ethereum-cryptography/secp256k1';
import { toHex } from 'ethereum-cryptography/utils';
function Wallet({
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
  setAddress,
  address,
}) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const address = toHex(
      secp.getPublicKey(evt.target.value).slice(1).slice(-20)
    );
    setAddress(address);
    if (address) {
      console.log(address);
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <h2> Your Wallet Private Key</h2>
      <label>
        Private Key to Sign Message
        <input
          placeholder="Type your private key, for example: 0x1"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>

      {address && (
        <label>
          public key : {`${address.slice(0, 12)}....${address.slice(-10)}`}
        </label>
      )}
      <label className="balance">Balance: {balance}</label>
    </div>
  );
}

export default Wallet;

import { useState } from 'react';
import server from './server';
import * as secp from 'ethereum-cryptography/secp256k1';
import * as keccak from 'ethereum-cryptography/keccak';
import * as utils from 'ethereum-cryptography/utils';
function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const data = {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
      };
      const messageHash = utils.toHex(
        keccak.keccak256(utils.utf8ToBytes(JSON.stringify(data)))
      );
      const signedResponse = await secp.sign(messageHash, privateKey, {
        recovered: true,
      });

      const {
        data: { balance },
      } = await server.post(`send`, {
        messageHash,
        signedResponse,
        data,
      });
      console.log(`Balance : ${balance}`);
      setBalance(balance);
    } catch (ex) {
      console.log(ex);
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;

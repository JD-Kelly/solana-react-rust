import React, { useEffect, useState } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from '@project-serum/anchor';
import idl from './idl.json'
import './App.css';

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
let baseAccount = Keypair.generate();

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

const App = () => {

const [walletAddress, setWalletAddress] = useState(null);
const [inputValue, setInputValue] = useState('');
const [gifList, setGifList] = useState([]);

// Checks if Phantom wallet is connected or not
const checkIfWalletIsConnected = async () => {
  try {
    const { solana } = window;

    if (solana) {
      if(solana.isPhantom)  {
        console.log("Phantom wallet found!")
        const response = await solana.connect({ onlyIfTrusted: true });
      
        console.log(
          'connected with Public Key:',
          response.publicKey.toString()
          );

          setWalletAddress(response.publicKey.toString());
      }
    } else {
      alert("Solana object not found! Get a phantom wallet 👻")
    }
  } catch (error) {
    console.error(error);
  }
};

const connectWallet = async () => {
  const { solana } = window;

  if(solana) {
    const response = await solana.connect();
    console.log('Connected with Public Key:', response.publicKey.toString());
    setWalletAddress(response.publicKey.toString());
  }
};

const sendGif = async () => {
  if (inputValue.length > 0) {
    console.log('Gif link:', inputValue);
    setGifList([...gifList, inputValue])
    setInputValue('')
  } else {
    console.log('Empty input. Try again.');
  }
}

const onInputChange = (event) => {
  const {value} = event.target;
  setInputValue(value)
};

// authenticate connection to Solana.
const getProvider = () => {
  const connection = new Connection(network, opts.preflightCommitment);
  const provider = new Provider(
    connection, window.solana, opts.preflightCommitment,
  );
  return provider;
}

const createGifAccount = async () => {
  try {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    console.log('ping')
    await program.rpc.startStuffOff({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount]
    });
    console.log("Created a new BaseAccount with address:", baseAccount.publicKey.toString())
    await getGifList();

  } catch(error) {
    console.log("Error creating BaseAccount:", error)
  }
}


const renderNotConnectedContainer = () => {
  return (
  <button className="cta-button connect-wallet-button"
    onClick={connectWallet}
  >
    connect to Wallet
  </button>
  )
};

const renderConnectedContainer = () => {

  if(gifList === null){
    return (
      <div className="connected-container">
        <button className="cta-button submit-gif-button" onClick={createGifAccount}>
          Do One-Time Initialization For GIF Program Account
        </button>
      </div>
    )
  }

  else {
  return (
    <div className="connected-container">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendGif();
        }}
    >
      <input 
        type="text" 
        placeholder="Add your GIF link here..." 
        value={inputValue}
        onChange={onInputChange}
      />
      <button type="submit" className="cta-button submit-gif-button">Submit</button>
    </form>
    <div className="gif-grid">
      {gifList.map((item, index) => (
        <div className="gif-item" key={index}>
          <img src={item.gifLink} alt={""} />
        </div>
      ))}
    </div>
  </div>
    )
  }
}

useEffect(() => {
  const onLoad = async () => {
    await checkIfWalletIsConnected();
  };
  window.addEventListener('load', onLoad);
  return () => window.removeEventListener('load', onLoad)
}, []);


const getGifList = async() => {
  try {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

    console.log("Got the account", account)
    setGifList(account.gifList);
  
  } catch (error) {
    console.log("Error in getGifList: ", error)
    setGifList(null)
  }
}
useEffect(() => {
  if(walletAddress) {
    console.log('Fetching Gif list...')
    getGifList();
  }
  // eslint-disable-next-line
}, [walletAddress]);

  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
      </div>
    </div>
  );
};

export default App;

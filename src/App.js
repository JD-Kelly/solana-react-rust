import React, { useEffect, useState } from "react";
import './App.css';

const TEST_GIFS = [
  'https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp',
	'https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g',
	'https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g',
	'https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp'
]

const App = () => {

const [walletAddress, setWalletAddress] = useState(null)
const [inputValue, setInputVale] = useState('')

// Checks if Phantom wallet is connected or not
const checkIfWalletIsConnected = async () => {
  try {
    const { solana } = window;

    if (solana) {
      if(solana.isPhantom) {
        console.log("Phantom wallet found!")
        const response = await solana.connect();
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
  const solana = window;

  if(solana) {
    const response = await solana.connect();
    console.log('Connected with Public Key:', response.publicKey.toString());
    setWalletAddress(response.publicKey.toString());
  }
};

const sendGif = async () => {
  if (inputValue.length > 0) {
    console.log('Gif link:', inputValue);
  } else {
    console.log('Empty input. Try again.');
  }
}

const onInputChange = (event) => {
  const {value} = event.target;
  setInputVale(value)
};

const renderNotConnectedContainer = () => (
  <button className="cta-button connect-wallet-button"
    onClick={connectWallet}
  >
    connect to Wallet
  </button>
);

const renderConnectedContainer = () => (
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
      {TEST_GIFS.map(gif => (
        <div className="gif-item" key={gif}>
          <img src={gif} alt={gif} />
          </div>
      ))}
    </div>
  </div>
)



useEffect(() => {
  const onLoad = async () => {
    await checkIfWalletIsConnected();
  };
  window.addEventListener('load', onLoad);
  return () => window.removeEventListener('load', onLoad)
}, []);

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

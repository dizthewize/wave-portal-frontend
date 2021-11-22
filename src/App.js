import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./utils/FistBumpPortal.json";
import "./App.css";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allFistBumps, setAllFistBumps] = useState([]);

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts"});

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const fistBump = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fistBumpPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await fistBumpPortalContract.getTotalBumps();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const fistBumpTxn = await fistBumpPortalContract.bump('Heres a fist bump',
        { gasLimit: 300000 });
        console.log("Mining...", fistBumpTxn.hash);

        await fistBumpTxn.wait();
        console.log("Mined -- ", fistBumpTxn.hash);

        count = await fistBumpPortalContract.getTotalBumps();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

   /*
   * Create a method that gets all waves from your contract
   */
   const getAllFistBumps = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fistBumpPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const bumps = await fistBumpPortalContract.getAllFistBumps();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let fistBumpsCleaned = [];
        bumps.forEach(bump => {
          fistBumpsCleaned.push({
            address: bump.fistBumper,
            timestamp: new Date(bump.timestamp * 1000),
            message: bump.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllFistBumps(fistBumpsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    let fistBumpPortalContract;
    checkIfWalletIsConnected();

    const onNewFistBump = (from, timestamp, message) => {
      console.log('NewFistBump', from, timestamp, message);
      setAllFistBumps(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      fistBumpPortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      fistBumpPortalContract.on('NewFistBump', onNewFistBump);
    }

    return () => {
      if (fistBumpPortalContract) {
        fistBumpPortalContract.off('NewFistBump', onNewFistBump);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am DizTheWize and I learning web3 technologies that's pretty cool right? Connect your Ethereum wallet and fist bump me!
        </div>

        <button className="waveButton" onClick={fistBump}>
          Give me a fist bump
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allFistBumps.map((fistBump, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {fistBump.address}</div>
              <div>Time: {fistBump.timestamp.toString()}</div>
              <div>Message: {fistBump.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

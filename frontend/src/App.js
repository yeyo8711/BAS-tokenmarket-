import React, { useEffect, useState } from "react";
import "./App.css";
import { useMoralis } from "react-moralis";
import { Topbar, Banner, Leftnav, Offers } from "./components";
import { ethers } from "ethers";
import {
  bananaTokenAddress,
  bananaMarketAddress,
} from "./contracts/contractAddress";
import bananaMarketABI from "./contracts/BananaMarket.json";
import BananaTokenABI from "./contracts/BananaToken.json";
import Swal from "sweetalert2";
import monkey from "./assets/babyape6.jpg";

const fromWei = (num) => ethers.utils.formatEther(num);

function App() {
  const [wallet, setWallet] = useState(null);
  const [bananaTokenContract, setBananaTokenContract] = useState(null);
  const [bananaMarketContract, setBananaMarketContract] = useState(null);
  const [bananaTokens, setBananaTokens] = useState(0);
  const [availableOffers, setAvailableOffers] = useState();
  const [soldItems, setSoldItems] = useState();
  const [filterFrom, setFilterFrom] = useState(null);
  const [filterTo, setFilterTo] = useState(null);

  const { isInitialized, Moralis } = useMoralis();

  /******* Connects to MM *******/
  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const getChainId = await provider.getNetwork();
      if (getChainId.chainId !== 97) {
        Swal.fire({
          title: "Please Change to BSC Network",
          width: 600,
          padding: "3em",
          color: "#f9f9f9",
          confirmButtonColor: "rgba(254, 191, 56, 1)",
          background: "#252724",
          imageUrl: monkey,
          imageWidth: 400,
          imageHeight: 400,
          imageAlt: "Monkey",
        });
      }
      const signer = provider.getSigner();
      setWallet(accounts[0]);
      setContracts(signer, accounts[0]);
    }
  };
  /******* Creates Contracts to interact *******/
  const setContracts = async (signer) => {
    const bananaContract = new ethers.Contract(
      bananaTokenAddress,
      BananaTokenABI,
      signer
    );
    const marketContract = new ethers.Contract(
      bananaMarketAddress,
      bananaMarketABI,
      signer
    );
    setBananaMarketContract(marketContract);
    setBananaTokenContract(bananaContract);
  };
  /******* Fetch Token Balance *******/
  useEffect(() => {
    if (bananaTokenContract && wallet) {
      const fetchTokenBalance = async () => {
        console.log(bananaTokenContract);
        const bananas = await bananaTokenContract.balanceOf(wallet);
        setBananaTokens(Number(fromWei(bananas)).toFixed(2));
      };
      fetchTokenBalance();
    }
  }, [bananaTokenContract]);
  /******* Fetchs Offers *******/
  useEffect(() => {
    if (isInitialized) {
      const getEvents = async () => {
        let createdArr = [];
        let completedArr = [];
        const created = new Moralis.Query("SaleCreateddd");
        const complete = new Moralis.Query("SaleCompleteddddd");

        const createdResults = await created.find();
        const completeResults = await complete.find();

        createdResults.forEach((item) => {
          const offer = {
            itemId: Number(item.attributes.itemId),
            token: item.attributes.token,
            amount: item.attributes.amount,
            price: item.attributes.price,
            seller: item.attributes.seller,
          };
          createdArr.push(offer);
        });
        completeResults.forEach((item) => {
          const offer = {
            itemId: Number(item.attributes.itemId),
            token: item.attributes.token,
            amount: item.attributes.amount,
            price: item.attributes.price,
            seller: item.attributes.seller,
            sold: item.attributes.sold,
            cancelled: item.attributes.cancelled,
            blockNumber: item.attributes.block_number,
          };
          completedArr.push(offer);
        });
        setAvailableOffers(createdArr);
        setSoldItems(completedArr);
      };
      getEvents();
    }
  }, [Moralis, isInitialized]);

  return (
    <div className="app" id="main">
      <div className="top-div">
        <Topbar
          connectWallet={connectWallet}
          wallet={wallet}
          soldItems={soldItems}
          isInitialized={isInitialized}
        />
        <Banner />
      </div>
      <div className="bottom-div">
        <Leftnav
          bananaTokens={bananaTokens}
          wallet={wallet}
          setFilterFrom={setFilterFrom}
          setFilterTo={setFilterTo}
        />

        <Offers
          bananaTokenContract={bananaTokenContract}
          wallet={wallet}
          bananaMarketContract={bananaMarketContract}
          availableOffers={availableOffers}
          soldItems={soldItems}
          filterFrom={filterFrom}
          filterTo={filterTo}
        />
      </div>
    </div>
  );
}

export default App;

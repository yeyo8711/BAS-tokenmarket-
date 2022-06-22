import React, { useState } from "react";
import { ethers } from "ethers";
import { VscChromeClose } from "react-icons/vsc";
import Swal from "sweetalert2";
import monkey from "../assets/babyape6.jpg";
import { bananaTokenAddress } from "../contracts/contractAddress";

import { bananaMarketAddress } from "../contracts/contractAddress";

const toWei = (num) => ethers.utils.parseEther(num.toString());

const CreateOfferModal = ({
  bananaTokenContract,
  wallet,
  bananaMarketContract,
  setOpenModal,
}) => {
  const [type, setType] = useState(true);
  const [tokenToSell, setTokenToSell] = useState("Bananas");
  const [saleValue, setSaleValue] = useState(null);
  const [salePrice, setSalePrice] = useState(null);
  // eslint-disable-next-line
  const [tradeValue1, setTradeValue1] = useState(null);
  // eslint-disable-next-line
  const [tradeValue2, setTradeValue2] = useState(null);
  const [tradeType1, setTradeType1] = useState(null);
  const [tradeType2, setTradeType2] = useState(null);

  const createOffer = async () => {
    if (type) {
      if (tokenToSell !== "Bananas") {
        Swal.fire({
          title: "This Token is not available yet",
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
        return;
      }
      if (!wallet) {
        Swal.fire({
          title: "Connect Wallet First!",
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
        return;
      }
      if (!saleValue || !salePrice) {
        Swal.fire({
          title: "Please declare an amount",
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
        return;
      }

      try {
        const approval = await bananaTokenContract.approve(
          bananaMarketAddress,
          toWei(saleValue)
        );
        await approval.wait();
        const finalTx = await bananaMarketContract.createSale(
          bananaTokenAddress,
          toWei(saleValue),
          toWei(salePrice)
        );
        await finalTx.wait();
        setOpenModal(false);
      } catch (error) {
        console.log(error);
        Swal.fire({
          title: error.message,
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
    }
  };
  return (
    <div className="create-offer-modal-main">
      <div className="create-offer-modal-closer">
        <VscChromeClose
          className="create-offer-modal-icon"
          onClick={() => setOpenModal(false)}
        />
      </div>
      <div className="create-offer-modal-box">
        <div className="create-offer-modal-title">
          <h1>Create a New Offer</h1>
        </div>
        <div className="create-offer-modal-type">
          <h3 className="create-offer-modal-type-switch">
            Type: {type ? "Sale" : "Trade"}
          </h3>
          <div>
            <button onClick={() => setType(true)}>Sale</button>
            <button onClick={() => setType(false)}>Trade</button>
          </div>
        </div>
        <div className="create-offer-modal-type">
          <h3 className="create-offer-modal-type-switch">
            Selling: {tokenToSell}
          </h3>
          <div>
            <button onClick={() => setTokenToSell("Bananas")}>Bananas</button>
            <button onClick={() => setTokenToSell("Rocks")}>Rocks</button>
            <button onClick={() => setTokenToSell("Essence")}>Essence</button>
            <button onClick={() => setTokenToSell("Juice")}>Berry Juice</button>
          </div>
        </div>
        {type ? (
          <div className="create-offer-modal-amount">
            <h5>Amount to sell</h5>
            <input
              autoComplete="false"
              placeholder="Token Amount"
              onSubmit={(e) => e.preventDefault()}
              onChange={(e) => setSaleValue(e.target.value)}
            />
            <h5>Asking Price (BNB)</h5>
            <input
              autoComplete="false"
              placeholder="BNB"
              onSubmit={(e) => e.preventDefault()}
              onChange={(e) => setSalePrice(e.target.value)}
            />
          </div>
        ) : (
          ""
        )}

        {!type ? (
          <div className="create-offer-modal-trade">
            <div className="create-offer-modal-trade-type">
              <h3>TRADING: {tradeType1}</h3>
              <div className="create-offer-modal-trade-btns">
                <button onClick={() => setTradeType1("Bananas")}>
                  Bananas
                </button>
                <button onClick={() => setTradeType1("Rocks")}>Rocks</button>
                <button onClick={() => setTradeType1("Essence")}>
                  Essence
                </button>
                <button onClick={() => setTradeType1("Juice")}>
                  Berry Juice
                </button>
              </div>
            </div>
            <div className="create-offer-modal-trade-amount">
              <input
                autoComplete="false"
                placeholder="Tokens To Give"
                onSubmit={(e) => e.preventDefault()}
                onChange={(e) => setTradeValue1(e.target.value)}
              />
            </div>
            <div className="create-offer-modal-trade-type">
              <h3>FOR: {tradeType2}</h3>
              <div className="create-offer-modal-trade-btns">
                <button onClick={() => setTradeType2("Bananas")}>
                  Bananas
                </button>
                <button onClick={() => setTradeType2("Rocks")}>Rocks</button>
                <button onClick={() => setTradeType2("Essence")}>
                  Essence
                </button>
                <button onClick={() => setTradeType2("Juice")}>
                  Berry Juice
                </button>
              </div>
            </div>
            <div className="create-offer-modal-trade-amount">
              <input
                autoComplete="false"
                placeholder="Tokens Requested"
                onSubmit={(e) => e.preventDefault()}
                onChange={(e) => setTradeValue2(e.target.value)}
              />
            </div>
          </div>
        ) : (
          ""
        )}
        <div className="create-offer-modal-submitbtn">
          <button onClick={createOffer}>CREATE</button>
        </div>
      </div>
    </div>
  );
};

export default CreateOfferModal;

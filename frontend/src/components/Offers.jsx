import React, { useState } from "react";
import { ethers } from "ethers";
import bananas from "../assets/bananas.png";
import CreateOfferModal from "./CreateOfferModal";
import ManageListingsModal from "./ManageListingModal";
import Swal from "sweetalert2";
import monkey from "../assets/babyape6.jpg";

const fromWei = (num) => ethers.utils.formatEther(num);

const Offers = ({
  bananaMarketContract,
  wallet,
  bananaTokenContract,
  availableOffers,
  soldItems,
  filterFrom,
  filterTo,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [manageModal, setManageModal] = useState(false);

  const handleModal = (setter) => {
    if (setter === "modal" && !manageModal) setOpenModal(true);
    if (setter === "manage" && !openModal) setManageModal(true);
  };

  const renderOffers = (availableOffers, soldItems) => {
    if (soldItems && availableOffers) {
      let arr = [];
      // eslint-disable-next-line
      soldItems.map((i) => {
        if (i.sold || i.cancelled) arr.push(i.itemId);
      });
      if (filterFrom && filterTo) {
        // eslint-disable-next-line
        return availableOffers.map((item) => {
          const filter = arr.includes(item.itemId);

          if (
            !filter &&
            Number(fromWei(item.amount)) >= filterFrom &&
            Number(fromWei(item.amount)) <= filterTo
          ) {
            return (
              <div className="offer" key={item.itemId}>
                <h1>{fromWei(item.amount)}</h1>
                <div className="offer-image">
                  <img src={bananas} alt="bananas" />
                </div>

                <h3>Asking Price: {fromWei(item.price)}</h3>

                {item.seller === wallet ? (
                  ""
                ) : (
                  <button onClick={() => purchaseItem(item)}>BUY</button>
                )}
              </div>
            );
          }
        });
      } else {
        // eslint-disable-next-line
        return availableOffers.map((item) => {
          const filter = arr.includes(item.itemId);

          if (!filter) {
            return (
              <div className="offer" key={item.itemId}>
                <h1>{fromWei(item.amount)}</h1>
                <div className="offer-image">
                  <img src={bananas} alt="bananas" />
                </div>

                <h3>Asking Price: {fromWei(item.price)}</h3>

                {item.seller === wallet ? (
                  ""
                ) : (
                  <button onClick={() => purchaseItem(item)}>BUY</button>
                )}
              </div>
            );
          }
        });
      }
    }
  };

  const purchaseItem = async (item) => {
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
    }
    try {
      if (wallet) {
        await bananaMarketContract.purchaseItem(`${item.itemId}`, {
          value: item.price,
        });
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: error.data.message,
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
  };

  return (
    <div className="offers-main">
      <div className="offers-buttons">
        <div className="sell-trade-btns">
          <button>Sales</button>
          <button>Trades</button>
        </div>
        <div className="offers-create-btns">
          <button onClick={() => handleModal("modal")}>Create an Offer</button>
          <button onClick={() => handleModal("manage")}>
            Manage My Listings
          </button>
        </div>
      </div>

      <div className="offers-display">
        {availableOffers ? renderOffers(availableOffers, soldItems) : ""}
      </div>
      {openModal ? (
        <CreateOfferModal
          bananaTokenContract={bananaTokenContract}
          wallet={wallet}
          bananaMarketContract={bananaMarketContract}
          setOpenModal={setOpenModal}
        />
      ) : (
        ""
      )}
      {manageModal ? (
        <ManageListingsModal
          wallet={wallet}
          bananaMarketContract={bananaMarketContract}
          setManageModal={setManageModal}
          availableOffers={availableOffers}
          soldItems={soldItems}
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default Offers;

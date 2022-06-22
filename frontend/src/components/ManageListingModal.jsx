import React from "react";
import { ethers } from "ethers";
import { VscChromeClose } from "react-icons/vsc";
import bananas from "../assets/bananas.png";
import Swal from "sweetalert2";
import monkey from "../assets/babyape6.jpg";
import { useRef } from "react";
import { useDraggable } from "react-use-draggable-scroll";

const fromWei = (num) => ethers.utils.formatEther(num);

const ManageListingsModal = ({
  wallet,
  setManageModal,
  availableOffers,
  bananaMarketContract,
  soldItems,
}) => {
  const ref = useRef();
  const { events } = useDraggable(ref);

  const activeListings = () => {
    if (availableOffers && soldItems) {
      let arr = [];
      // eslint-disable-next-line
      soldItems.map((i) => {
        arr.push(i.itemId);
      });

      // eslint-disable-next-line
      return availableOffers.map((item) => {
        const filter = arr.includes(item.itemId);

        if (!filter && item.seller === wallet) {
          return (
            <div className="manage-listings-item" key={item.itemId}>
              <h3>{fromWei(item.amount)}</h3>
              <div className="manage-listings-img">
                <img src={bananas} alt="bananas" />
              </div>
              <div className="manage-listings-price ">
                <h5>Asking Price:</h5> {fromWei(item.price)}
              </div>
              <div className="manage-listings-btn">
                <button onClick={() => cancelOffer(item.itemId)}>Cancel</button>
              </div>
            </div>
          );
        }
      });
    }
  };

  const soldListings = (soldItems) => {
    // eslint-disable-next-line
    return soldItems.map((item) => {
      if (Number(item.seller) === Number(wallet) && item.sold) {
        return (
          <div className="manage-listings-item" key={item.itemId}>
            <h3>{fromWei(item.amount)}</h3>
            <div className="manage-listings-img">
              <img src={bananas} alt="bananas" />
            </div>
            <div className="manage-listings-price ">
              <h5>Sold For:</h5> {fromWei(item.price)}
            </div>
          </div>
        );
      }
    });
  };

  const cancelOffer = async (id) => {
    try {
      console.log(id);
      await bananaMarketContract.cancelOffer(
        ethers.utils.parseUnits(id.toString(), 0)
      );
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
    <div className="manage-listings-main">
      <div className="manage-listings-modal-closer">
        <VscChromeClose
          className="create-offer-modal-icon"
          onClick={() => setManageModal(false)}
        />
      </div>
      <div className="manage-listings-box">
        <div>
          <h2>My Active Listings</h2>
          <div className="manage-listings-holder">
            <div className="manage-listings-items" {...events} ref={ref}>
              {availableOffers ? activeListings() : ""}
            </div>
          </div>
        </div>
        <div>
          <h2>My Sold Listings</h2>
          <div className="manage-listings-holder">
            <div className="manage-listings-items">
              {soldItems ? soldListings(soldItems) : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageListingsModal;

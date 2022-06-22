import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useMoralisWeb3Api } from "react-moralis";

const fromWei = (num) => ethers.utils.formatEther(num);

const Topbar = ({ connectWallet, wallet, soldItems, isInitialized }) => {
  const [firstRender, setFirstRender] = useState(true);
  const [basPrice, setBasPrice] = useState(0);
  const [volume24, setVolume24] = useState(0);

  const [averageBananaPrice, setAverageBananaPrice] = useState(0);
  const Web3Api = useMoralisWeb3Api();

  useEffect(() => {
    if (soldItems) {
      let dailyVolume = 0;
      let bananas = 0;
      let bananaPrice = 0;

      const fetchVolume = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const block = await provider.getBlockNumber();

        return soldItems.forEach((item) => {
          const price = Number(fromWei(item.price));
          bananas += Number(fromWei(item.amount));
          bananaPrice += Number(fromWei(item.price));
          if (item.blockNumber > block - 28400) {
            dailyVolume += price;
          }

          setVolume24(dailyVolume);

          setAverageBananaPrice(bananaPrice / bananas);
        });
      };
      fetchVolume();
    }
  }, [soldItems]);

  useEffect(() => {
    if (firstRender && isInitialized) {
      const fetchTokenPrice = async () => {
        //Get token price on PancakeSwap v2 BSC
        const options = {
          address: "0x8ddEEc6b677c7c552C9f3563B99e4fF90B862EBc",
          chain: "bsc",
          exchange: "PancakeSwapv2",
        };
        const price = await Web3Api.token.getTokenPrice(options);
        setBasPrice(price.usdPrice.toFixed(2));
        setFirstRender(false);
      };
      fetchTokenPrice();
    }
  }, [isInitialized]);

  return (
    <div className="main-nav">
      <p>Market Volume 24hr: {volume24.toFixed(2)} BNB</p>
      <p>
        Avg Banana Price:
        {averageBananaPrice.toFixed(6)}
      </p>
      <p>
        BAS Price:
        {basPrice}
      </p>

      {wallet ? (
        <div className="nav-wallet">{wallet}</div>
      ) : (
        <div className="nav-button">
          <button onClick={connectWallet}>Connect</button>
        </div>
      )}
    </div>
  );
};

export default Topbar;

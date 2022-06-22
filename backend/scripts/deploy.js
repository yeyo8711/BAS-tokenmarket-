const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contracts here:
  /*   const BananaToken = await ethers.getContractFactory("BananaToken");
  const bananaToken = await BananaToken.deploy();
  console.log("BananaToken contract address ", bananaToken.address); */

  const BananaMarket = await ethers.getContractFactory("BananaMarket");
  const bananaMarket = await BananaMarket.deploy();
  console.log("BananaMarket contract address ", bananaMarket.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

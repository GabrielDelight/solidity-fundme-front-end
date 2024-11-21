// import { ethers } from "./ethers.umd.min.js";
import { abi, contractAddress } from "./constant.js";
let connectBtn = document.getElementById("connectBtn");
let fundBtn = document.getElementById("fundBtn");
let input = document.getElementById("input");
let balanceBtn = document.getElementById("balanceBtn");
let withdrawBtn = document.getElementById("withdrawBtn");

connectBtn.onclick = connect;
fundBtn.onclick = fund;
balanceBtn.onclick = balance;
withdrawBtn.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Metamask is installed!");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectBtn.innerHTML = "Connected";
  } else {
    connectBtn.innerHTML = "Disconnected";
  }
}

async function fund(sendValue) {
  if (typeof window.ethereum !== "undefined") {
    const etheAmount = input.value;
    // provider: connect to the blockchain
    // signer: wallet address with gas
    // contract to interact with: API and contract address
    console.log(`Sending ${sendValue}...`);

    const provider = new window.ethers.providers.Web3Provider(window.ethereum);

    const signer = await provider.getSigner();

    const fundMe = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await fundMe.fund({
        value: window.ethers.utils.parseEther(etheAmount).toString(),
      });

      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
  }
}

async function balance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new window.ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing...");
    const provider = new window.ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const transactionResponse = await contract.withdraw();
    balance();
    await listenForTransactionMine(transactionResponse, provider);
    console.log("Done!");
  }
}

// waitinf for 1 block confirmation
function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, rejects) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmationx`
      );
      resolve();
    });
  });
}

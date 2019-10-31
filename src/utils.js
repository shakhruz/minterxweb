import data from "./data.js";

const WAValidator = require("wallet-address-validator");
const btc_rate_api = "https://blockchain.info/ticker";
const minterApiUrl = "https://explorer-api.apps.minter.network/api/";

function formatLongNumber(long_number) {
  return Math.round(long_number)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ");
}

// Получить все курсы валют
function getRates(callback) {
  fetch(data.back_url + "rates")
    .then(res => res.json())
    .then(bipPrices => {
      //   console.log("rates: ", json_rates);
      fetch(data.back_url + "usd_price")
        .then(res => res.json())
        .then(usdPrices => {
          callback(bipPrices, usdPrices);
        })
        .catch(console.error);
    })
    .catch(console.error);
}

// Получаем сосояние контракта в базе
function getContractState(contractId, callback) {
  fetch(data.back_url + "contract/" + contractId)
    .then(res => res.json())
    .then(json => {
      console.log("contract json: ", json);
      callback(json);
    })
    .catch(console.error);
}

function isValidAddress(address, coin) {
  if (coin == "BTC") {
    return WAValidator.validate(address, "BTC");
  } else {
    if (coin == "ETH" || coin == "USDT") {
      return isValidETHAddress(address);
    }
  }
}

// Загружаем все операции из базы
function getAllContracts(callback) {
  fetch(data.back_url + "contracts")
    .then(res => res.json())
    .then(json => {
      // this.allContracts = json
      console.log("contracts: ", this.allContracts);
      callback(json);
    })
    .catch(console.error);
}

// Проверка минтер адреса
function isValidMinterAddress(address) {
  return /^(Mx){1}[0-9a-fA-F]{40}$/i.test(address);
}

function isValidETHAddress(address) {
  return /^(0x){1}[0-9a-fA-F]{40}$/i.test(address);
}

// Создаем контракт в базе через бэкенд
function createContract(sell_coin, buy_coin, sell_amount, toAddress, callback) {
  console.log("create contract");

  const opts = { sell_coin, buy_coin, sell_amount, toAddress };

  fetch(data.back_url + "contracts", {
    method: "POST",
    body: JSON.stringify(opts),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(json => {
      console.log("new contract: ", json);
      callback(json);
    })
    .catch(console.error);
}

// Возвращает форматированное кол-во токенов
function formatAmount(amount, coin) {
  if (!amount) return 0;
  switch (coin) {
    case "BIP":
      amount = Number(Math.trunc(amount * 10000) / 10000);
      break;
    case "BTC":
      amount = Number(amount.toFixed(8));
      break;
    case "USDT":
      amount = Number(amount.toFixed(4));
      break;
    case "USD":
      amount = Number(amount.toFixed(2));
      break;
    case "ETH":
      amount = Number(amount.toFixed(6));
      break;
    default:
      amount = Number(amount.toFixed(2));
  }
  return amount;
}

// Полноформатная сумма вместе с тикером токена
function formatWithCoin(amount, coin) {
  if (!amount) return "0 " + coin;
  switch (coin) {
    case "BIP":
      amount = Number(Math.trunc(amount * 10000) / 10000) + " " + coin;
      break;
    case "BTC":
      amount =
        amount + "sat (" + Number((amount / 100000000).toFixed(8)) + ") BTC";
      break;
    case "USDT":
      amount = Number(amount.toFixed(4)) + " USDT";
      break;
    case "ETH":
      amount = Number(amount.toFixed(6)) + " ETH";
      break;
    default:
      amount = Number(amount.toFixed(4)) + " " + coin;
      break;
  }
  return amount;
}

// Преобразуем дату в красивую
function formatDate(dateString) {
  let d = new Date(dateString);
  const dateOptions = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  };
  return d.toLocaleString("ru-RU", dateOptions);
}

// Фильтруем только исполненные контракты
function completeContracts(allContracts) {
  return allContracts.filter(item => item.state == "completed");
}

function myFormat(amount, type) {
  switch (type) {
    case "fullSAT":
      return Math.trunc(amount);
    case "fullUSD":
      return Number(amount).toFixed(2);
    case "fullETH":
      return Number(amount).toFixed(6);
    case "longUSD":
      return Number(amount).toFixed(4);
    case "BIPFormat":
      return Number(amount);
    case "satToBTC":
      return Number((amount / 100000000).toFixed(8));
    case "formatBTC":
      return formatBTC(amount);
    default:
      return Number(amount);
  }
}

function formatBTC(btc_amount) {
  if (btc_amount > 0.01) {
    return Number(btc_amount.toFixed(4)) + " BTC";
  } else {
    const sat_amount = btc_amount * 100000000;
    if (sat_amount > 100000) {
      return (
        Math.round(sat_amount / 1000) +
        "k satoshi (" +
        Number(btc_amount.toFixed(8)) +
        " BTC)"
      );
    } else {
      return (
        formatLongNumber(sat_amount) +
        " satoshi (" +
        Number(btc_amount.toFixed(8)) +
        " BTC)"
      );
    }
  }
}

export default {
  formatLongNumber,
  getRates,
  getContractState,
  getAllContracts,
  isValidMinterAddress,
  createContract,
  formatAmount,
  formatWithCoin,
  formatDate,
  completeContracts,
  formatBTC,
  myFormat,
  isValidAddress
};

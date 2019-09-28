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
    .then(json_rates => {
      console.log("rates: ", json_rates);
      fetch(data.back_url + "usd_price")
        .then(res => res.json())
        .then(json => {
          callback(json_rates.rates, json.btc_usd, json.bip_usd);
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

// Создаем контракт в базе через бэкенд
function createContract(
  sell_coin,
  buy_coin,
  sell_amount,
  buy_amount,
  toAddress,
  callback
) {
  console.log("create contract");

  const opts = { sell_coin, buy_coin, sell_amount, buy_amount, toAddress };

  fetch(back_url + "contracts", {
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
  if (coin == "BIP") {
    amount = Number(Math.trunc(amount * 10000) / 10000);
  } else {
    if (coin == "BTC") {
      amount = Number(amount.toFixed(8));
    } else {
      if (coin == "USDT") {
        amount = Number(amount.toFixed(4));
      } else {
        if ((coin = "USD")) {
          return Number(amount.toFixed(2));
        }
      }
    }
  }
  return amount;
}

// Полноформатная сумма вместе с тикером токена
function formatSendingAmount(amount, coin) {
  if (coin == "BIP") {
    amount = Number(Math.trunc(amount * 10000) / 10000) + " " + coin;
  } else {
    if (coin == "BTC") {
      amount =
        amount + "sat (" + Number((amount / 100000000).toFixed(8)) + ") BTC";
    } else {
      if (coin == "USDT") {
        amount = Number(amount.toFixed(4)) + " USDT";
      }
    }
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
  formatSendingAmount,
  formatDate,
  completeContracts,
  formatBTC,
  myFormat
};

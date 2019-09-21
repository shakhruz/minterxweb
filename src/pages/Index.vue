<template>
  <q-page class="flex">
    <q-card class="my-card q-pa-md q-ma-md">
      <q-card-section>
        <div id="exhange_rates" class="q-pa-md">
          <div class="q-gutter-md">
            <h3>Курсы Валют*</h3>
            <table>
                <tr><td></td><td>Покупка</td><td>Продажа</td><td>В наличии</td></tr>
                <tr v-for="rate in allRates" :key="rate.coin">
                  <td><strong>{{rate.coin }}</strong></td>
                  <td>{{ formatAmount(rate.buy, "BIP") }}</td>
                  <td>{{ formatAmount(rate.sell, "BIP") }}</td>
                  <td>{{ formatSendingAmount(rate.reserve, rate.coin) }}</td>
                </tr>
            </table>
            <div>*Курсы указаны в BIP токенах.<br/>
                 1 BIP = {{ bip_usd | fullUSD}} USD<br/>
                 1 BTC = {{ btc_usd }} USD</div>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div id="history" class="q-pa-md">
          <div class="q-gutter-md">
            <h3>История операций</h3>
            <p>Всего: {{completeContracts.length}}</p>
            <table>
              <thead>
                <tr>
                  <td>Время</td>
                  <td>Продажа</td>
                  <td>Покупка</td>
                  <td>Статус</td>
                </tr>
              </thead>
              <tr v-for="co in completeContracts" :key="co._id">
                <td>{{formatDate(co.date)}}</td>
                <td>{{co.receivedCoins}} {{co.sell_coin}}</td>
                <td>{{amount_to_send(co)}}</td>
                <td>{{co.state}}</td>
              </tr>
            </table>
          </div>
        </div>
      </q-card-section>      
    </q-card>
    <q-card class="my-card q-pa-md q-ma-md" style="max-width: 600px; min-width: 600px"> 
      <q-card-section>
        <div class="q-pa-md">
          <div class="q-gutter-md">
            <div>Заявка на обмен</div>
            <div class="row">
              <q-input outlined v-model.number="sell_amount" @input='updateSellAmount' :label="'Продаю в ' + sell_coin"/>
              <q-select outlined v-model="sell_coin" :options="sell_coins_options" label="" @input="changeSellToken"/>
            </div>
            <q-btn outline color="primary" icon="compare_arrows" @click="reverseTokens"/>
            <div class="row">
              <q-input outlined v-model.number="buy_amount" @input='updateBuyAmount' :label="'Получу в ' + buy_coin" />
              <q-select outlined v-model="buy_coin" :options="buy_coins_options" label="" @input="changeBuyToken"/>
            </div>
            <q-input outlined v-model="dest_address" @input='validateAddress' :label="'адрес отправки ' + buy_coin" />
            <div v-if="showAddressError" class="error_message">Некорректный адрес BTC</div>
            <q-btn outline color="primary" label="Отправить" @click.native="createContract" :disable="disableSendButton || invalidAddress"/>
          </div>
        </div>
      </q-card-section>
      <q-card-section style="max-width: 600px; min-width: 600px">
        <div v-if="showSendToAddress" class="message">Ваша заявка на обмен принята. Пожалуйста отправьте {{ sell_coin }} на адрес: <strong>{{receivingAddress}}</strong> в течение 60 минут.</strong></div>
        <div v-if="showGotPayment" class="message">
          Перевод в размере <strong>{{ formatSendingAmount(receivedCoins, sell_coin) }}</strong> для обмена получен.<br/> 
          Отправляем <strong>{{ contract.send_amount }} {{ buy_coin }}</strong> на адрес {{dest_address}} 
        </div>
        <div v-if="showPaymentSent" class="message">
          Ваши {{ buy_coin }} отправлены на адрес {{ dest_address }}.<br/> 
          Сделка завершена. <br/>
          Проверить можно здесь - <a _target="blank" v-bind:href="''+ contract.outgoingTx +''">{{ contract.outgoingTx }}</a><br/>
          Спасибо за покупку!
        </div>      
        <div v-if="showErrorMessage" class="error_message">Произошла ошибка: {{ error_message }}</div>      
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
const WAValidator = require('wallet-address-validator')

const btc_rate_api = 'https://blockchain.info/ticker'
const minterApiUrl = 'https://explorer-api.apps.minter.network/api/'
const back_url = 'http://162.213.255.184:3000/'

export default {
  data () {
    return {
      sell_amount: 1000,
      buy_amount: 0,
      sell_coin: 'BIP',
      buy_coin: 'BTC',
      dest_address: '',
      sell_coins_options: [],
      buy_coins_options: [],
      bip_usd_price: 0,
      bip_sat_price_buy: 0,
      showSendToAddress: false,
      showGotPayment: false,
      showPaymentSent: false,
      minter_market: null,
      rates: null,
      receivingAddress: '',
      receivedCoins: 0,
      coins_to_send: 0,
      showAddressError: false,
      contract: null,
      disableSendButton: false,
      allRates: [],
      allCoins: [],
      showErrorMessage: false,
      error_message: '',
      btc_usd: 0,
      bip_usd: 0,
      allContracts: [],
      dateOptions: { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
      invalidAddress: true
    }
  },
  created(){
    this.updateRates(()=>{
      console.log("rates ready...")
      this.updateSellAmount(1000)
    })
    this.getAllContracts(()=>{
      console.log("contracts loaded...")
    })
  },
  mounted() {
    console.log("mounted...")
  },
  methods: {
    createContract () {
      console.log('create contract')
      this.showErrorMessage = false
      this.error_message = ''
      this.showSendToAddress = false
      this.receivedCoins = 0
      this.showGotPayment = false
      this.disableSendButton = true
      this.showPaymentSent = false

      const opts = {
        sell_coin: this.sell_coin,
        buy_coin: this.buy_coin,
        sell_amount: this.sell_amount,
        buy_amount: this.buy_amount,
        toAddress: this.dest_address
      }

      fetch(back_url + 'contracts', {
        method: 'POST',
        body: JSON.stringify(opts),
        headers: {
            'Content-Type': 'application/json'
        }})
        .then(res => res.json())
        .then(json => {
          console.log("new contract: ", json)
          this.contract = json
          this.processContract()
        })
        .catch(console.error)              
    },
    processContract() {
      this.receivingAddress = this.contract.receivingAddress
      console.log("new BIP address", this.receivingAddress)
      this.showSendToAddress = true
      let contractComplete = false
      console.log("checking contract ", this.contract._id)
      let tries = 60 * 60;
      let interval = setInterval (() => {
        this.getContractState(this.contract._id, (newContract) => {
          this.contract = newContract
          console.log("updated contract: ", this.contract)
          switch (this.contract.state) {
            case "waiting for payment":
              console.log("waiting for payment...")
              break;
            case "sending":
              this.receivedCoins = this.contract.receivedCoins
              this.showGotPayment = true
              break;
            case "payment received":
              this.receivedCoins = this.contract.receivedCoins
              this.showGotPayment = true
              break;
            case "completed":
              this.showGotPayment = true
              contractComplete = true
              this.showPaymentSent = true
              this.disableSendButton = false
              clearInterval(interval)
              console.log("contract complete")
              break;
            case "error":
              this.showErrorMessage = true
              this.error_message = this.contract.message
              this.disableSendButton = false
              clearInterval(interval)
              console.log("contract complete")
              break;
            default: 
              console.log("unknown contract state: ", this.contract.state)
          }
          tries -= 1
          if (tries < 1) {
            clearInterval(interval)
            this.disableSendButton = false
            console.log("cancelled checking contract ", this.contract._id, " timed out")
          }
        })
      }, 1000)
    },
    changeSellToken (arg) {
      console.log('change sell token', arg)
      if (arg=="BIP") {
        this.buy_coins_options = this.filterBIP(this.allCoins)
        this.sell_coins_options = this.allCoins
        this.buy_coin = this.buy_coins_options[0]
      } else {
        this.buy_coins_options = ["BIP"]     
        this.buy_coin = "BIP"
        this.sell_coins_options = this.allCoins
      }
      this.updateSellAmount(this.sell_amount)
    },
    changeBuyToken (arg) {
      console.log('change buy token', arg)
      if (arg=="BIP") this.sell_coins_options = this.filterBIP(this.allCoins)      
      else {
        this.sell_coins_options = this.allCoins      
        this.sell_coin = "BIP"
        this.buy_coins = this.filterBIP(this.allCoins)
      }
      this.validateAddress(this.dest_address)
      this.updateSellAmount(this.sell_amount)
    },
    reverseTokens () {
      console.log('reverse tokens')
      const buy_coin = this.buy_coin
      const buy_options = this.buy_coins_options
      this.buy_coin = this.sell_coin
      this.buy_coins_options = this.sell_coins_options
      this.sell_coin = buy_coin
      this.sell_coins_options = buy_options
      this.validateAddress(this.dest_address)
      this.updateSellAmount(this.sell_amount)
    },
    updateSellAmount (arg) {
      console.log('updateSellAmount', arg)
      if (this.sell_coin == "BIP") {
        // продаем BIP
        if (this.allRates) {
          const rate = this.allRates.find(item=>item.coin == this.buy_coin)
          console.log("rate: ", rate)
          if (rate) {
            const buy_price = rate.sell
            this.buy_amount = this.sell_amount / buy_price
            console.log("buy amount: ", this.buy_amount, "buy price: ", buy_price)
          }
        }
      } else {
        if (this.buy_coin == "BIP") {
          // покупаем BIP
          if (this.allRates) {
            const rate = this.allRates.find(item=>item.coin == this.sell_coin)
            console.log("rate: ", rate)
            if (rate) {
              const buy_price = rate.buy
              this.buy_amount = this.sell_amount * buy_price
              console.log("buy amount: ", this.buy_amount, "buy price: ", buy_price)
            }
          }
        } else console.log("не могу посчитать сделку, один из токенов должен быть BIP")
      }
      this.buy_amount = this.formatAmount(this.buy_amount, this.buy_coin)
    },
    updateBuyAmount (arg) {
      console.log('update buy amount', arg)
      if (this.sell_coin == "BIP") {
        // продаем BIP
        if (this.allRates) {
          const rate = this.allRates.find(item=>item.coin == this.buy_coin)
          console.log("rate: ", rate)
          if (rate) {
            const buy_price = rate.sell
            this.sell_amount = this.buy_amount * buy_price
            console.log("sell amount: ", this.sell_amount, "buy price: ", buy_price)
          }
        }
      } else {
        if (this.buy_coin == "BIP") {
          // покупаем BIP
          if (this.allRates) {
            const rate = this.allRates.find(item=>item.coin == this.sell_coin)
            console.log("rate: ", rate)
            if (rate) {
              const buy_price = rate.buy
              this.sell_amount = this.buy_amount / buy_price
              console.log("sell amount: ", this.sell_amount, "buy price: ", buy_price)
            }
          }
        } else console.log("не могу посчитать сделку, один из токенов должен быть BIP")
      }
      this.sell_amount = this.formatAmount(this.sell_amount, this.sell_coin)
    },
    formatAmount(amount, coin) {
      if (coin == "BIP") {
        amount = Number(Math.trunc(amount * 10000)/10000)
      } else {
        if (coin == "BTC") {
          amount = Number(amount.toFixed(8))
        } else {
          if (coin=="USDT") {
            amount = Number(amount.toFixed(4))
          }
        }
      }
      return amount
    },
    formatSendingAmount(amount, coin) {
      if (coin == "BIP") {
        amount = Number(Math.trunc(amount * 10000)/10000) + ' ' + coin
      } else {
        if (coin == "BTC") {
          amount = amount + 'sat (' + Number((amount / 100000000).toFixed(8)) + ') BTC'
        } else {
          if (coin=="USDT") {
            amount = Number(amount.toFixed(4)) + ' USDT'
          }
        }
      }
      return amount
    },    
    updateRates (callback) {    
      fetch(back_url+'rates')
        .then(res => res.json())
        .then(json => {
          console.log("rates: ", json)
          this.allRates = json.rates
          fetch(back_url+'coins')
            .then(res => res.json())
            .then(json => {
              console.log("coins: ", json)
              this.allCoins = json.coins
              this.sell_coins_options = this.allCoins
              this.buy_coins_options = this.filterBIP(this.allCoins)
              fetch(back_url+'usd_price')
                .then(res => res.json())
                .then(json => {
                  console.log("usd_prices: ", json)
                  this.btc_usd = json.btc_usd
                  this.bip_usd = json.bip_usd
                  callback()
              }).catch(console.error)    
          }).catch(console.error)        
      }).catch(console.error)    
      
    },
    getAllContracts (callback) {
      fetch(back_url+'contracts')
        .then(res => res.json())
        .then(json => {
          this.allContracts = json
          console.log("contracts: ", this.allContracts)
          callback()
      }).catch(console.error)  
    },
    filterBIP(list) {
      return list.filter(item=>item!="BIP")
    },
    getContractState(contractId, callback) {
      fetch(back_url+'contract/' + contractId)
        .then(res => res.json())
        .then(json => {
          console.log("contract json: ", json)
          callback(json)
      }).catch(console.error)           
    },
    validateAddress(address) {
      if (this.buy_coin == "BTC") {
        var valid = WAValidator.validate(address, 'BTC')
        if (valid) {
          this.showAddressError = false
          this.invalidAddress = false
        } else {
          this.showAddressError = true
          this.invalidAddress = true
        }
      } else {
          this.showAddressError = false
          this.invalidAddress = false
      }
    },
    amount_to_send(contract) {
      if (contract.send_amount) {
        return contract.send_amount + ' ' + contract.buy_coin
      } else {
        return '-'
      }
    },
    formatDate(dateString) {
      let d = new Date(dateString)
      return d.toLocaleString("ru-RU", this.dateOptions)
    }
  },
  computed: {
    completeContracts() {
      return this.allContracts.filter(item => item.state == "completed")
    }
  },
  filters: {
    fullSAT(sat_amount) {
      return Math.trunc(sat_amount)
    },
    fullUSD(usd_amount) {
      return Number(usd_amount).toFixed(2)
    },
    BIPFormat(bip_amount) {
      return Number(bip_amount)
    },
    satToBTC(sat_amount) {
      return Number((sat_amount / 100000000).toFixed(8))
    }    
  }
}
</script>

<style>
* {
  font-size: 1.03em;
  box-sizing: border-box;
  margin: 0 0;
  padding: 0 0;
}

.error_message {
  color: red;
}

body {
  /* font-family: -apple-system, BlinkMacSystemFont,
    “Segoe UI”, “Roboto”, “Oxygen”, “Ubuntu”, “Cantarell”,
    “Fira Sans”, “Droid Sans”, “Helvetica Neue”,
    sans-serif; */
  font-family: Ratio,Ubuntu,system-ui,-apple-system,Segoe UI,SimSun,PingFang SC,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;
}

td {
  border: 1px solid grey;
  text-align: left;
  padding: 5px 5px;
  margin: 0px 0px;
}

thead td {
  text-align: center;
}

table {
  border: 0px solid grey;
  border-spacing: 0px;
}

.message {
  margin: 10px 20px;
}

.error_message {
  margin: 10px 20px;
}

</style>

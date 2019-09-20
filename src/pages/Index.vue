<template>
  <q-page class="flex">
    <q-card class="my-card q-pa-md q-ma-md">
      <q-card-section>
        <div id="exhange_rates" class="q-pa-md" style="max-width: 300px">
          <div class="q-gutter-md">
            <!-- <h3>Обменные курсы</h3> -->
            <table>
                <tr><td></td><td>Покупка</td><td>Продажа</td><td>В наличии</td></tr>
                <tr v-for="rate in allRates" :key="rate.coin">
                  <td>{{rate.coin}}</td>
                  <td>{{rate.buy | fullSAT}}</td>
                  <td>{{rate.sell | fullSAT}}<td>
                  <td>{{rate.reserve}}</td>
                </tr>
            </table>
            <!-- <div>1 BIP = {{ bip_usd_buy_price | fullUSD}} USD</div>
            <div>1 BTC = {{ btc_usd_rate }} USD</div> -->
            <!-- <div>В наличии на продажу BIP: 50000</div> -->
          </div>
        </div>
      </q-card-section>
    </q-card>
    <q-card class="my-card q-pa-md q-ma-md">
      <q-card-section>
        <div class="q-pa-md" style="max-width: 300px">
          <div class="q-gutter-md">
            <div>Заявка на обмен</div>
            <div class="row">
              <q-input outlined v-model.number="sell_amount" @input='updateSellAmount' label='Продаю в BIP'/>
              <q-select outlined v-model="sell_coin" :options="sell_coins_options" label="Продаю" @input="changeSellToken"/>
            </div>
            <q-btn outline color="primary" icon="compare_arrows" @click="reverseTokens"/>
            <div class="row">
              <q-input outlined v-model.number="buy_amount" @input='updateBuyAmount' label='Получу в BTC' />
              <q-select outlined v-model="buy_coin" :options="buy_coins_options" label="Покупаю" @input="changeBuyToken"/>
            </div>
            <!-- <div>В наличии на продажу: {{ 0.1 }} BTC</div> -->
            <q-input outlined v-model="dest_address" @input='validateAddress' :label="'адрес отправки ' + buy_coin" />
            <div v-if="showAddressError" class="error_message">Некорректный адрес BTC</div>
            <q-btn outline color="primary" label="Отправить" @click.native="createContract" :disable="disableSendButton"/>
            <div v-if="showSendToAddress">Отправьте BIP токены на адрес: {{bip_address}}</div>
            <div v-if="showGotPayment">
              Перевод в размере {{ bip_received | BIPFormat}} BIP для обмена получен. 
              Отправляем {{ btc_to_send | fullSAT}}sat ({{btc_to_send | satToBTC}}btc) на адрес {{dest_address}} 
            </div>
            <div v-if="showPaymentSent">Купленные 0.1btc отправлены на адрес XXX. Сделка завершена</div>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div id="history" class="q-pa-md">
          <div class="q-gutter-md">
            <h3>История операций</h3>
            <p>Кол-во операций всего/сегодня: 100/1</p>
            <table>
              <tr>
                <td>Время</td>
                <td>Продажа</td>
                <td>Транзакция продажи</td>
                <td>Покупка</td>
                <td>Транзакция покупки</td>
                <td>Статус</td>
              </tr>
              <tr>
                <td>15.09 16:25</td>
                <td>110 BIP</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </table>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
const WAValidator = require('wallet-address-validator')

const btc_rate_api = 'https://blockchain.info/ticker'
const minterApiUrl = 'https://explorer-api.apps.minter.network/api/'
const bip_api_url = 'https://explorer-api.apps.minter.network/api/'
const back_url = 'http://localhost:3000/'

const spread = 5 // % спрэда

export default {
  data () {
    return {
      sell_amount: 1000,
      buy_amount: 0,
      sell_coin: 'BIP',
      buy_coin: 'BTC',
      dest_address: '',
      sell_coins_options: ['BIP', 'BTC', 'ETH'],
      buy_coins_options: ['BIP', 'BTC', 'ETH'],
      bip_usd_price: 0.0398,
      bip_sat_price_buy: 385,
      showSendToAddress: false,
      showGotPayment: false,
      showPaymentSent: false,
      minter_market: null,
      rates: null,
      bip_address: null,
      bip_received: 0,
      btc_to_send: 0,
      showAddressError: false,
      contract: null,
      disableSendButton: true,
      allRates: [],
      allCoins: []
    }
  },
  created(){
    this.checkRates(()=>{
      console.log("rates ready...")
    })
  },
  mounted() {
    console.log("mounted...")
    setTimeout(()=>{
      this.updateSellAmount(1000)
    }, 2000)
  },
  methods: {
    createContract () {
      console.log('create contract')

      const opts = {
        sell_coin: this.sell_coin,
        buy_coin: this.buy_coin,
        sell_amount: this.sell_amount,
        buy_amount: this.buy_amount * 100000000,
        toAddress: this.dest_address
      }

      fetch(back_url + 'contracts', {
        method: 'POST',
        // mode: 'no-cors',
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
      this.bip_address = this.contract.receivingAddress
      console.log("new BIP address", this.bip_address)
      this.showSendToAddress = true
      this.waitForBIPpayment(this.bip_address, (trx, user_id) => {
        console.log("got BIP payment: ", trx, user_id)
        this.bip_received = trx.data.value * 1000
        this.showGotPayment = true
        this.btc_to_send = this.bip_received / this.bip_btc_buy_price * 100000000
      })
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
    },
    changeBuyToken  (arg) {
      console.log('change buy token', arg)
      if (arg=="BIP") this.sell_coins_options = this.filterBIP(this.allCoins)      
      else {
        this.sell_coins_options = this.allCoins      
        this.sell_coin = "BIP"
        this.buy_coins = this.filterBIP(this.allCoins)
      }
    },
    reverseTokens () {
      console.log('reverse tokens')
      const buy_coin = this.buy_coin
      const buy_options = this.buy_coins_options
      this.buy_coin = this.sell_coin
      this.buy_coins_options = this.sell_coins_options
      this.sell_coin = buy_coin
      this.sell_coins_options = buy_options
    },
    updateSellAmount (arg) {
      console.log('updateSellAmount', arg)
      this.buy_amount = Number((this.sell_amount / this.bip_btc_buy_price).toFixed(8))
    },
    updateBuyAmount (arg) {
      console.log('update buy amount', arg)
      this.sell_amount = Math.trunc(this.buy_amount * this.bip_btc_sell_price)
      // this.sell_amount = this.buy_amount * this.
    },
    updateRates (callback) {
      fetch(`${minterApiUrl}v1/status`)
      .then(res => res.json())
      .then(json => {
          console.log("market data: ", json)
          if (json.data) {
              this.minter_market = {bipPriceBtc: json.data.bipPriceBtc, 
                            bipPriceUsd: json.data.bipPriceUsd, 
                            bipPriceChange: json.data.bipPriceChange, 
                            marketCap: json.data.marketCap} 

              fetch(btc_rate_api)
                .then(res => res.json())
                .then(json => {
                console.log("btc rate: ", json.USD.last)
                this.rates = {
                  btc_usd: json.USD.last
                  // eth_usd: quote.data.ETH.quote.USD.price,
                }
                callback()
              }).catch(console.error)              
          }
      })
      
      fetch(back_url+'rates')
        .then(res => res.json())
        .then(json => {
          console.log("rates: ", json)
          this.allRates = json.rates
      }).catch(console.error)    
      
      fetch(back_url+'coins')
        .then(res => res.json())
        .then(json => {
          console.log("coins: ", json)
          this.allCoins = json.coins
          this.sell_coins_options = this.allCoins
          this.buy_coins_options = this.filterBIP(this.allCoins)
      }).catch(console.error)        
    },
    filterBIP(list) {
      return list.filter(item=>item!="BIP")
    },
    checkRates(callback) {
      if (this.minter_market!=null  && this.rates !=null) {
        callback()
      } else {
        this.updateRates(()=>{
          callback()
        })
      }
    },
    waitForBIPpayment (address, callback, userId) {
      console.log("waiting for a payment on address " + address + " userId: " + userId)
      let tries = 60 * 60
      let interval = setInterval(()=> {
        console.log("checking trxs on address " + address)
        fetch(`${bip_api_url}v1/addresses/${address}/transactions`)
        .then(res => res.json())
        .then(json => {
            const data = json.data
            if (data.length >0 ) {
                console.log("есть транзакции: ", data.length)
                for(let trx of data) {
                  if (trx.data.coin == "BIP" && trx.data.to == this.bip_address) {
                    console.log(`совпало: ${trx.data.value} ${trx.data.coin} fee: ${trx.fee} from: ${trx.from}  to ${trx.data.to}`)
                    clearInterval(interval)
                    callback(trx, userId)
                  }
                }
            }
        })
    
        tries -= 1
        if (tries < 1) cancelInterval(interval)
      }, 1000)
    },
    validateAddress(address) {
      if (buy_coin == "BTC") {
        var valid = WAValidator.validate(address, 'BTC')
        if (valid) {
          this.showAddressError = false
          this.disableSendButton = false
        } else {
          this.showAddressError = true
          this.disableSendButton = true
        }
      } else {
          this.showAddressError = false
          this.disableSendButton = false
      }
    }
  },
  computed: {
    bip_btc_buy_price() {
      if (this.minter_market!=null && this.rates != null) {
          const price = (this.rates.btc_usd / this.minter_market.bipPriceUsd)
          return  price - price * (spread / 100)
      }
    },
    bip_btc_sell_price() {
      if (this.minter_market!=null && this.rates != null) {
        const price = (this.rates.btc_usd / this.minter_market.bipPriceUsd)
        return  price + price * (spread / 100)
      }
    },
    bip_usd_buy_price () {
      if (this.minter_market!=null && this.rates != null) {
          const price = this.minter_market.bipPriceUsd
          return  price - price * (spread / 100)
      }
    },
    bip_usd_sell_price () {
      if (this.minter_market!=null && this.rates != null) {
          const price = this.minter_market.bipPriceUsd
          return  price + price * (spread / 100)
      }
    },
    btc_usd_rate () {
      if (this.minter_market!=null && this.rates != null) {
        return this.rates.btc_usd
      }
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
}
error_message {
  color: red;
}

body {
  font-family: -apple-system, BlinkMacSystemFont,
    “Segoe UI”, “Roboto”, “Oxygen”, “Ubuntu”, “Cantarell”,
    “Fira Sans”, “Droid Sans”, “Helvetica Neue”,
    sans-serif;
}
</style>

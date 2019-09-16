<template>
  <q-page class="flex">
    <div id="calculator" class="q-pa-md">
      <h3>Продать BIP->BTC</h3>
      <div>Введите сумму и адрес для отправки:</div>
      <div class="q-pa-md" style="max-width: 300px">
        <div class="q-gutter-md">
          <!-- <q-select outlined v-model="sell_token" :options="sell_tokens_options" label="Продаю" @input="changeSellToken" disable="true"/> -->
          <q-input outlined v-model.number="sell_amount" @input='updateSellAmount' label='Сумма для продажи в BIP' />
          <!-- <q-btn outline color="primary" icon="compare_arrows" @click="reverseTokens" disabled/> -->
          <!-- <q-select outlined v-model="buy_token" :options="buy_tokens_options" label="Покупаю" @input="changeBuyToken" disable="true"/> -->
          <q-input outlined v-model.number="buy_amount" @input='updateBuyAmount' label='Сумма для получения в BTC (резерв 0.1btc)' />
          <div>{{ buy_amount / 100000000 }}btc</div>
          <q-input outlined v-model.number="dest_address" label='Адрес отправки BTC' />
          <div>Мы продаем 1 BTC за {{ bip_btc_sat_sell_price | fullSAT}} BIP, за 1 BIP даем ~{{ bip_usd_buy_price | fullUSD}} USD</div>
          <q-btn outline color="primary" label="Продать" @click.native="createContract"/>
          <div v-if="showSendToAddress">Отправьте BIP токены на адрес: Mxf57713dff2d77817208081f60ad6d83bf26cd3c9</div>
          <div v-if="showGotPayment">Перевод в размере 100 BIP для обмена получен</div>
          <div v-if="showPaymentSent">Купленные 0.1btc отправлены на адрес XXX. Сделка завершена</div>
        </div>
      </div>
    </div>
    <div id="exhange_rates" class="q-pa-md" style="max-width: 300px">
      <div class="q-gutter-md">
        <h3>Обменные курсы</h3>
        <table>
            <tr><td></td><td>Покупка</td><td>Продажа</td><td>В наличии</td></tr>
            <tr><td>BTC</td>{{ bip_btc_sat_buy_price | fullSAT}}</td><td>{{ bip_btc_sat_sell_price | fullSAT}}<td>0.1</td></td>
            <tr><td>USDT</td><td>{{ (1 / bip_usd_sell_price) | fullUSD }}</td><td>{{ (1 / bip_usd_buy_price) | fullUSD }}</td><td>1000</td></tr>
        </table>
        <div>В наличии на продажу BIP: 50000</div>
        <div>Курс BTC/USD: {{ btc_usd_rate }}</div>
      </div>
    </div>
    <div id="history" class="q-pa-md" style="max-width:300px">
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
            <td>Покупка</td>
            <td>Транзакция покупки</td>
            <td>Статус</td>
          </tr>
        </table>
      </div>
    </div>
  </q-page>
</template>

<script>
// const utils = require('../utils.js')
const CoinMarketCap = require('coinmarketcap-api')
const client = new CoinMarketCap('55372c6e-1c9b-4018-aed4-15e7803c4b93')

const spread = 5 // % спрэда
const minterApiUrl = 'https://explorer-api.apps.minter.network/api/'
const btc_rate_api = 'https://blockchain.info/ticker'

export default {
  data () {
    return {
      sell_amount: 100,
      buy_amount: 100,
      sell_token: 'BIP',
      buy_token: 'BTC',
      dest_address: '',
      sell_tokens_options: ['BIP', 'BTC', 'ETH'],
      buy_tokens_options: ['BIP', 'BTC', 'ETH'],
      bip_usd_price: 0.0398,
      bip_sat_price_buy: 385,
      showSendToAddress: true,
      showGotPayment: true,
      showPaymentSent: true,
      minter_market: null,
      rates: null
    }
  },
  created(){
    this.checkRates(()=>{
      console.log("rates ready...")
    })
  },
  methods: {
    createContract () {
      console.log('create contract')
    },
    changeSellToken (arg) {
      console.log('change sell token', arg)
    },
    changeBuyToken  (arg) {
      console.log('change buy token', arg)
    },
    reverseTokens () {
      console.log('reverse tokens')
    },
    updateSellAmount (arg) {
      console.log('updateSellAmount', arg)
      this.buy_amount = this.sell_amount * this.bip_sat_price_buy
    },
    updateBuyAmount (arg) {
      console.log('update buy amount', arg)
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
    },
    checkRates(callback) {
      if (this.minter_market!=null  && this.rates !=null) {
        callback()
      } else {
        this.updateRates(()=>{
          callback()
        })
      }
    }
  },
  computed: {
    bip_btc_sat_buy_price() {
      if (this.minter_market!=null && this.rates != null) {
          const price = (this.rates.btc_usd / this.minter_market.bipPriceUsd)
          return  price - price * (spread / 100)
      }
    },
    bip_btc_sat_sell_price() {
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
    }    
  }
}
</script>

<style>
</style>

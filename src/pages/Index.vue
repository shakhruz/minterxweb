<template>
  <q-page class="flex">
    <div class="main-content">
      <section class="u-section--margin--top u-container">
        <div class="u-grid u-grid--vertical-margin">
          <div class="u-cell u-cell--large--auto">
            <div class="dashboard__price-title">
              Текущая цена BIP
            </div> 
            <div class="dashboard__price">
              <span class="dashboard__price-value">
                  ${{ bip_usd | longUSD}}
              </span> 
              <!-- <span class="dashboard__price-change dashboard__price-change--down">
                -30.03%
              </span> -->
            </div> 
            <div class="dashboard__period-title">
              1 BTC = {{ btc_usd }}usd<br/>
              1000 satoshi = {{ (btc_usd / 100000)  | fullUSD }}usd
            </div> 
            <!-- <div class="dashboard__period-description">12 min 30 sec</div> -->
          </div>
          <div class="u-cell u-cell--large--auto history-cell">
            <div class="history__chart-wrap" style="">
              <div class="chartjs-size-monitor">
                <div class="chartjs-size-monitor-expand">
                  <div class="">
                    <span>Купить</span>
                    <q-input dark class="dashboard__price-value" v-model.number="sell_amount" @input='updateSellAmount'>
                      <template v-slot:prepend>
                          <img src="/statics/bip_token_small.png" width="40" height="40">
                        <!-- <q-avatar>
                        </q-avatar>                       -->
                      </template>
                    </q-input>
                    <span>~${{ sell_amount * bip_usd | fullUSD }}</span>
                    <div class="price_info">
                      <div style="margin-top: 20px">Будет стоить:</div>
                      <ul>
                        <li>
                          <div class="">{{ buy_amount_btc | formatBTC }}</div>                    
                        </li>
                        <li>
                          <div class="">{{ buy_amount_btc | formatBTC }}</div>                    
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="chartjs-size-monitor-shrink">
                  <div class="">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <main>
        <section class="u-section--margin u-container">
          <h1 class="u-h1 u-mb2">Быстрая покупка BIP</h1>
          <div class="u-grid u-grid--vertical-margin">
            <div class="u-cell u-cell--medium--4-10">
              <!-- <h2 class="u-h4 u-mb1">Step 1</h2> -->
              <p>Для того, чтобы купить BIP введите свой адрес Minter кошелька и выберите форму оплаты (Bitcoin, ETH).</p>
              <p>Если у Вас нет Minter кошелька, Вы&nbsp;можете открыть его здесь - <a href="https://bip.to" class="link--default">https://bip.to</a>.</p> 
              <!-- <p>Amount of BIP with price lower than current is <strong class="u-display-ib">720 619 BIP</strong></p> -->
            </div> 
            <div class="u-cell u-cell--medium--6-10">
              <form novalidate="novalidate" class="dashboard__well" _lpchecked="1">
                <div class="form-row">
                  <label class="form-field form-field--invert">
                    <q-input color="lime-11" dark v-model="dest_address" spellcheck="false" autocomplete="off" class="form-field__input" @input='validateAddress'>
                    </q-input>
                    <!-- <div v-if="showAddressError" class="error_message">Некорректный адрес BTC</div> -->
                    <!-- <input type="text" spellcheck="false" autocomplete="off" class="form-field__input">  -->
                    <span class="form-field__label">Адрес Вашего Minter кошелька 
                      <span class="dashboard__input-address-extra">(начинается с Mx)</span>
                    </span>
                  </label> 
                  <span v-if="showAddressError" class="form-field__error">Введите правильный адрес Minter</span>
                </div> 
                <div class="form-row">
                  <!-- <label class="form-field is-error">
                    <input type="email" spellcheck="false" class="form-field__input"> 
                    <span class="form-field__label">E-mail</span>
                  </label> 
                  <span class="form-field__error">Enter your e-mail</span> -->
                </div> 
                <div class="form-row">
                  <button class="button button--main button--full">
                    <span class="button__content">Оплатить в Bitcoin</span> 
                  </button>
                </div> 
                <div class="form-row">
                  <button class="button button--main button--full is-disabled">
                    <span class="button__content">Оплатить в ETH</span> 
                  </button>
                </div> 
                <!-- <div class="form-row">
                  <button class="button button--main button--full is-disabled">
                    <span class="button__content">Оплатить в USDT</span> 
                  </button>
                </div>  -->
              </form>
            </div>
          </div>
        </section>
      </main>      
    </div>  
    <footer class="footer">
      <div class="u-container u-container--large">
        <div class="footer__menu">
          <div class="footer__menu-item">
            <a href="/about" target="_blank" rel="noopener" class="footer__link link--hover">
              О проекте   
            </a>
          </div>          
          <div class="footer__menu-item">
            <a href="/stats" target="_blank" rel="noopener" class="footer__link link--hover">
              Статистика   
            </a>
          </div>
          <div class="footer__menu-item">
            <a href="/privacy.pdf" target="_blank" rel="noopener" class="footer__link link--hover">
              Политика Конфиденциальности   
            </a>
          </div>
          <div class="footer__menu-item">
            <a href="/terms.pdf" target="_blank" rel="noopener" class="footer__link link--hover">
              Условия Использования
            </a>
          </div>
          <div class="footer__menu-item">
            <a href="/disclaimer.pdf" target="_blank" rel="noopener" class="footer__link link--hover">
              Риски
            </a>
          </div>
        </div>
      </div>
    </footer>
  </q-page>  
    <!-- <div class="main-content">
      <div class="q-gutter-md">
        <h3>Курсы Валют</h3>
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
    <div class="q-gutter-md">
      <div>Заявка на обмен</div>
      <div class="row">
        <q-input outlined v-model.number="sell_amount" @input='updateSellAmount' :label="'Продаю в ' + sell_coin"/>
        <q-select outlined v-model="sell_coin" :options="sell_coins_options" label="" @input="changeSellToken"/>
      </div>
      <q-btn outline color="primary" icon="compare_arrows" @click="reverseTokens"/>
      <div class="row">
        <q-input outlined v-model.number="buy_amount_btc" @input='updateBuyAmount' :label="'Получу в ' + buy_coin" />
        <q-select outlined v-model="buy_coin" :options="buy_coins_options" label="" @input="changeBuyToken"/>
      </div>
      <q-input outlined v-model="dest_address" @input='validateAddress' :label="'адрес отправки ' + buy_coin" />
      <div v-if="showAddressError" class="error_message">Некорректный адрес BTC</div>
      <q-btn outline color="primary" label="Отправить" @click.native="createContract" :disable="disableSendButton || invalidAddress"/>
    </div>
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
    <div v-if="showErrorMessage" class="error_message">Произошла ошибка: {{ error_message }}</div>       -->
</template>

<script>
const WAValidator = require('wallet-address-validator')

const btc_rate_api = 'https://blockchain.info/ticker'
const minterApiUrl = 'https://explorer-api.apps.minter.network/api/'
// const back_url = 'http://162.213.255.184:3333/'
const back_url = 'http://localhost:3333/'

function formatLongNumber(long_number) {
  return Math.round(long_number).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
}    

export default {
  data () {
    return {
      sell_amount: 100,
      buy_amount_btc: 0,
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
        buy_amount_btc: this.buy_amount_btc,
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
            this.buy_amount_btc = this.sell_amount / buy_price
            console.log("buy amount: ", this.buy_amount_btc, "buy price: ", buy_price)
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
              this.buy_amount_btc = this.sell_amount * buy_price
              console.log("buy amount: ", this.buy_amount_btc, "buy price: ", buy_price)
            }
          }
        } else console.log("не могу посчитать сделку, один из токенов должен быть BIP")
      }
      this.buy_amount_btc = this.formatAmount(this.buy_amount_btc, this.buy_coin)
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
            this.sell_amount = this.buy_amount_btc * buy_price
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
              this.sell_amount = this.buy_amount_btc / buy_price
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
          } else {
            if (coin="USD") {
              return Number(amount.toFixed(2))
            }
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
    longUSD(usd_amount) {
      return Number(usd_amount).toFixed(4)
    },
    BIPFormat(bip_amount) {
      return Number(bip_amount)
    },
    satToBTC(sat_amount) {
      return Number((sat_amount / 100000000).toFixed(8))
    },
    formatBTC(btc_amount) {
      if (btc_amount > 0.01) {
        return Number(btc_amount.toFixed(4)) + 'btc'
      } else {
        const sat_amount = btc_amount * 100000000
        if (sat_amount > 100000) {
          return Math.round(sat_amount / 1000) + 'k satoshi (' + Number(btc_amount.toFixed(8)) + 'btc)'
        } else {
          return formatLongNumber(sat_amount) + ' satoshi (' + Number(btc_amount.toFixed(8)) + 'btc)'
        }
      }
    }        
  }
}
</script>

<style>
</style>

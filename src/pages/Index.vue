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
            </div> 
            <div class="dashboard__period-title">
              1 BTC = ${{ btc_usd }}<br/>
              1000 satoshi = ${{ (btc_usd / 100000)  | fullUSD }}
            </div> 
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
                      </template>
                    </q-input>
                    <span>~${{ sell_amount * bip_usd | fullUSD }}</span>
                    <div class="price_info">
                      <div style="margin-top: 20px">Будет стоить:</div>
                      <ul>
                        <li>
                          <div class="">{{ buy_amount_btc | formatBTC }}</div>                    
                        </li>
                      </ul>
                    </div>
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
              <h2 class="u-h4 u-mb1">Шаг 1</h2>
              <p>Для того, чтобы купить BIP введите свой адрес Minter кошелька и выберите форму оплаты (Bitcoin, ETH).</p>
              <p>Если у Вас нет Minter кошелька, Вы&nbsp;можете открыть его здесь - <a href="https://bip.to" class="link--default">https://bip.to</a>.</p> 
            </div> 
            <div class="u-cell u-cell--medium--6-10">
              <form novalidate="novalidate" class="dashboard__well" _lpchecked="1">
                <div class="form-row">
                  <label class="form-field form-field--invert">
                    <span class="form-field__label">Адрес Вашего Minter кошелька 
                      <span class="dashboard__input-address-extra">(начинается с Mx)</span>
                    </span>
                  </label> 
                  <q-input dark v-model="dest_address" spellcheck="false" autocomplete="off" class="form-field__input" @input='validateMinterAddress' />
                  <span v-if="showAddressError" class="form-field__error">Введите правильный адрес Minter</span>
                </div> 
                <div class="form-row">
                </div> 
                <div class="form-row">
                  <button class="button button--main button--full">
                    <span class="button__content">Оплатить в BITCOIN</span> 
                  </button>
                </div> 
                <div class="form-row">
                  <button class="button button--main button--full is-disabled">
                    <span class="button__content">Оплатить в ETH</span> 
                  </button>
                </div> 
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
      <q-btn outline color="primary" label="Отправить" @click.native="createContract" :disable="disableSendBtcButton || invalidAddress"/>
    </div>
    <div v-if="showSendToAddress" class="message">Ваша заявка на обмен принята. Пожалуйста отправьте {{ sell_coin }} на адрес: <strong>{{receivingAddress}}</strong> в течение 60 минут.</strong></div>
    <div v-if="showGotPayment" class="message">
      Перевод в размере <strong>{{ formatSendingAmount(contract.receivedCoins, sell_coin) }}</strong> для обмена получен.<br/> 
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
      // данные кулькулятора
      sell_amount: 100,
      buy_amount_btc: 0,
      sell_coin: 'BIP',
      buy_coin: 'BTC',
      dest_address: '',

      showAddressError: false,
      invalidAddress: true,
      disableSendBtcButton: false,

      // цены и курсы
      btc_usd: 0,
      bip_usd: 0,
      rates: null,
      allRates: [],

      // данные шага 2, состояние текущей сделки
      receivingAddress: '',
      contract: null,

      showSendToAddress: false,
      showGotPayment: false,
      showPaymentSent: false,
      showErrorMessage: false,
      error_message: '',

      allContracts: [], // история контрактов
      dateOptions: { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    }
  },
  created(){
    this.updateRates(()=>{
      console.log("rates ready...")
      this.updateSellAmount(this.sell_amount)
    })
    this.getAllContracts(()=>{
      console.log("contracts loaded...")
    })
  },
  mounted() {
    console.log("mounted...")
  },
  methods: {
    // обнулить состояние формы зяавки
    resetFormData() {
      this.disableSendBtcButton = true
      this.showErrorMessage = false
      this.error_message = ''
      this.showSendToAddress = false
      this.showGotPayment = false
      this.showPaymentSent = false
    },
    // Создаем новый контракт в базе данных
    createContract () {
      console.log('create contract')
      this.resetFormData()

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
    // Отслеживаем контракт, ждем оплату, следим за отправкой купленных токенов
    processContract() {
      this.receivingAddress = this.contract.receivingAddress
      console.log("new BIP address", this.receivingAddress)

      this.showSendToAddress = true
      let contractComplete = false
      console.log("checking contract ", this.contract._id)

      let tries = 60 * 60; // даем 60 минут на завершение контракта
      let interval = setInterval (() => {
        this.getContractState(this.contract._id, (newContract) => {
          this.contract = newContract
          console.log("updated contract: ", this.contract)
          switch (this.contract.state) {
            case "waiting for payment":
              console.log("waiting for payment...")
              break;
            case "sending":
              this.showGotPayment = true
              break;
            case "payment received":
              this.showGotPayment = true
              break;
            case "completed":
              this.showGotPayment = true
              contractComplete = true
              this.showPaymentSent = true
              this.disableSendBtcButton = false
              clearInterval(interval)
              console.log("contract complete")
              break;
            case "error":
              this.showErrorMessage = true
              this.error_message = this.contract.message
              this.disableSendBtcButton = false
              clearInterval(interval)
              console.log("contract complete")
              break;
            default: 
              console.log("unknown contract state: ", this.contract.state)
          }
          tries -= 1
          if (tries < 1) {
            clearInterval(interval)
            this.disableSendBtcButton = false
            console.log("cancelled checking contract ", this.contract._id, " timed out")
          }
        })
      }, 1000)
    },
    // Калькулятор - обновляем сумму покупки
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
    // Загружаем текущие курсы валют  
    updateRates (callback) {    
      fetch(back_url+'rates')
        .then(res => res.json())
        .then(json => {
          console.log("rates: ", json)
          this.allRates = json.rates
          fetch(back_url+'usd_price')
            .then(res => res.json())
            .then(json => {
              console.log("usd_prices: ", json)
              this.btc_usd = json.btc_usd
              this.bip_usd = json.bip_usd
              callback()
          }).catch(console.error)    
      }).catch(console.error)    
    },
    // Получаем сосояние контракта в базе
    getContractState(contractId, callback) {
      fetch(back_url+'contract/' + contractId)
        .then(res => res.json())
        .then(json => {
          console.log("contract json: ", json)
          callback(json)
      }).catch(console.error)           
    },
    // Загружаем все операции из базы
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
    isValidMinterAddress(address) {
      return (/^(Mx){1}[0-9a-fA-F]{40}$/i.test(address));
    },    
    validateMinterAddress(address) {
        if (this.isValidMinterAddress(address)) {
          console.log('valid minter address: ', address)
          this.showAddressError = false
          this.invalidAddress = false
        } else {
          this.showAddressError = true
          this.invalidAddress = true
        }
    },
    // Проверяем адрес отправки
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
    // Возвращает форматировнное кол-во токенов
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
    // Возвращает сколько токенов должно быть отправлено по контракту
    amount_to_send(contract) {
      if (contract.send_amount) {
        return contract.send_amount + ' ' + contract.buy_coin
      } else {
        return '-'
      }
    },
    // Преобразуем дату в красивую
    formatDate(dateString) {
      let d = new Date(dateString)
      return d.toLocaleString("ru-RU", this.dateOptions)
    }   
  },
  computed: {
    // Фильтруем только исполненные контракты
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
        return Number(btc_amount.toFixed(4)) + ' BTC'
      } else {
        const sat_amount = btc_amount * 100000000
        if (sat_amount > 100000) {
          return Math.round(sat_amount / 1000) + 'k satoshi (' + Number(btc_amount.toFixed(8)) + ' BTC)'
        } else {
          return formatLongNumber(sat_amount) + ' satoshi (' + Number(btc_amount.toFixed(8)) + ' BTC)'
        }
      }
    }        
  }
}
</script>

<style>
</style>

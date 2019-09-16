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
          <div>Мы покупаем 1 BIP за {{ bip_sat_price_buy}}sat ({{ bip_sat_price_buy / 100000000 }}btc). ~{{ bip_usd_price }} usd</div>
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
          <thead>
            <tr><td></td><td>BIP</td><td>BTC</td></tr>
            <tr><td>Продажа</td>1<td>472sat (0.0487btc)</td></tr>
            <tr><td>Покупка</td>1<td>434sat (0.0450btc)</td></tr>
            <tr><td>Резерв</td><td>50000</td><td>0.1</td></tr>
          </thead>
        </table>
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
const minterApiUrl = 'https://explorer-api.apps.minter.network/api/'
getRates()

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
      showPaymentSent: true
    }
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
    getRates () {
      fetch(`${minterApiUrl}v1/status`)
      .then(res => res.json())
      .then(json => {
          console.log("market data: ", json)
          if (json.data) {
              let market = {bipPriceBtc: json.data.bipPriceBtc, 
                            bipPriceUsd: json.data.bipPriceUsd, 
                            bipPriceChange: json.data.bipPriceChange, 
                            marketCap: json.data.marketCap} 
              console.log("minter market data: ", market)  
          }
      })        
    }
  }
}
</script>

<style>
</style>

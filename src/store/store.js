import Vue from "vue";

const state = {
  bipPrices: {},
  usdPrices: {},
  contracts: {},
  socket: {
    isConnected: false,
    message: "",
    reconnectError: false
  }
};

const mutations = {
  setBipPrices(state, payload) {
    state.bipPrices = payload;
  },
  setUsdPrices(state, payload) {
    state.usdPrices = payload;
  },
  addContract(state, payload) {
    Vue.set(state.contracts, payload.contract.id, payload.contract);
  },
  updateBipPrice(state, payload) {
    Object.assign(state.bipPrices[payload.token], payload.price);
  },
  updateUsdPrice(state, payload) {
    Object.assign(state.usdPrices[payload.token], payload.price);
  },
  SOCKET_ONOPEN(state, event) {
    Vue.prototype.$socket = event.currentTarget;
    state.socket.isConnected = true;
  },
  SOCKET_ONCLOSE(state, event) {
    state.socket.isConnected = false;
  },
  SOCKET_ONERROR(state, event) {
    console.error(state, event);
  },
  // default handler called for all methods
  SOCKET_ONMESSAGE(state, message) {
    state.socket.message = message;
  },
  // mutations for reconnect methods
  SOCKET_RECONNECT(state, count) {
    console.info(state, count);
  },
  SOCKET_RECONNECT_ERROR(state) {
    state.socket.reconnectError = true;
  }
};

const actions = {
  calcPrice({}, payload) {
    console.log("create contract...");
  },
  sendMessage: function(context, message) {
    Vue.prototype.$socket.send(message);
  }
};

const getters = {
  bipPrices: state => {
    return state.bipPrices;
  },
  usdPrices: state => {
    return state.usdPrices;
  },
  contracts: state => {
    return state.contracts;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};

import Vue from "vue";

const state = {
  bipPrices: {},
  usdPrices: {},
  contracts: {}
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
  }
};

const actions = {
  calcPrice({}, payload) {
    console.log("create contract...");
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

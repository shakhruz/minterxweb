function shortBTC (qty_btc) {
    return Number(qty_btc).toFixed(4) + "btc"
}

function fullBTC (qty_btc) {
    return Number(qty_btc).toFixed(8) + "btc"
}

function shortUSD (qty_usd) {
    return '$' + Math.round(Number(qty_usd))
}

function fullUSD (qty_usd) {
    return '$' + Number(qty_usd).toFixed(2)
}

function longUSD (qty_usd) {
    return '$' + Number(qty_usd).toFixed(4)
}

function fullSUM (num) {
    return Math.trunc(num).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') + 'sum'
}

function shortSUM (num) {
    let result
    if (num > 10000000) {
        result = Math.trunc(num/1000000).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') + 'mln sum'
    } else {
        if (num > 10000) {
            result = Math.round(num/1000).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') + 'k sum'
        } else {
            result = Math.trunc(num).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') + 'sum'
        }
    }
    return result 
    // return (Math.round(num/1000)).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') + 'k sum'
}

function shortSAT (num) {
    console.log("shortsat: ", num)
    let result
    if (num > 10000000) {
        result = Math.trunc(num/1000000).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') + 'mln sat'
    } else {
        if (num > 100000) {
            result = Math.round(num/1000).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') + 'k sat'
        } else {
            result = Math.trunc(num).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') + 'sat'
        }
    }
    return result 
    // return (Math.round(num/1000)).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') + 'k sat'
    // return (Math.round(num/1000)).toString() + 'k sat'
}

// qty_btc_min = 0.0001
// qty_btc_max = 0.1
// qty_sum_min = 10000
// qty_sum_max = 10000000
// qty_usd_min = 1
// qty_usd_max = 1000

module.exports = {
    shortSAT, shortSUM, fullSUM, longUSD, fullUSD, shortUSD, fullBTC, shortBTC
}


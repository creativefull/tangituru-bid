const {getTicker, requestAPI} = require('./lib/api')
const {sendMessage} = require('./lib/message')
let lastBid = 0
let buyBidPersen = -0.001
let sellBidPercen = 0.003
let lastBuy = 0
let lastBuyBid = 0
let lastSell = 0
let lastSellBid = 0
let btcBalance = 0
let idrBalance = 0
let buyPersen = 3
let sellPersen = 5
let buyAgain = true
let sellAgain = false
let minimumBuyIDR = 50000
let pair = 'btc_idr'

let getBalance = async () => {
	console.log("Get Balance")
	return new Promise((resolve, reject) => {
		requestAPI('getInfo').then((info) => {
			if (info.success == 1) {
				return resolve(info.return.balance)
			}
		}).catch(reject)
	})
}

let openOrder = async () => {
	return new Promise((resolve, reject) => {
		requestAPI('openOrders', {pair : pair}).then((info) => {
			if (info.success == 1) {
				return resolve(info.return.orders)
			} else {
				sendMessage('Error get open order' + info)
				return reject('Error get open order', info)
			}
		}).catch(reject)
	})
}

let trade = async (type, rate, total, curr) => {
	return new Promise((resolve, reject) => {
		let options = {
			pair : pair,
			type : type,
			price : rate
		}
		options[curr] = total
		requestAPI('trade', options).then((trx) => {
			if (trx.success == 1) {
				return resolve(trx.return)
			} else {
				sendMessage('Error trade', trx)
				return reject('Error trade')
			}
		})
	})
}

let run = () => {
	getTicker('btc_idr').then(async (text) => {
		if (text) {
			let lastVIP = parseFloat(text.ticker.last)
			console.log(lastVIP)
			let lastBIDPersen = ((lastVIP/lastBid) * 100) - 100
			if (lastBIDPersen <= buyBidPersen) {
				if (buyAgain) {
					console.log("======= Beli Asset ======")
					lastBuy = ((buyPersen/100) * idrBalance) < minimumBuyIDR ? minimumBuyIDR : ((buyPersen/100) * idrBalance)
					// CHECK IF ORDER SUDAH KEBELI
					lastBuyBid = lastVIP - ((0.1/100) * lastVIP)
					let isOpen = await openOrder()
					if (isOpen.length <= 0) {
						let kepercayaan = (lastSellBid - lastVIP)
						if (kepercayaan >= 50000 || lastSellBid == 0) {
							buyAgain = false
							sellAgain = true
							// SAATNYA BELI
							let Trade = await trade('buy', lastBuyBid, lastBuy, 'idr')
							btcBalance = Trade.balance.btc
							idrBalance = Trade.balance.idr
							console.log("Anda membeli", lastBuy, "Dengan harga", lastBuyBid)
							sendMessage('Anda membeli', lastBuyBid, 'Dengan Harga', lastBuyBid)
							sendMessage('Saldo Terakhir Anda BTC: ', btcBalance, 'IDR:', idrBalance)
						} else {
							console.log("Tidak jadi di beli karena kurang kepercayaan", kepercayaan)
						}
					} else {
						console.log("Harga turun tapi tidak jadi beli karena data beli masih ada")
					}
				}
			}
			
			// ADOL BITCOIN
			if (lastBIDPersen >= sellBidPercen) {
				if (sellAgain) {
					lastSell = ((sellPersen/100) * btcBalance) < 0.0002 ? 0.0002 : (sellPersen/100) * btcBalance
					lastSellBid = lastVIP + ((0.15/100) * lastVIP)
					let isOpen = await openOrder()
					if (isOpen.length <= 0) {
						console.log("======= Sell Asset ======")
						let kepercayaanJual = (lastVIP - lastBuyBid)
						if (kepercayaanJual >= 100000 || lastBuyBid == 0) {
							buyAgain = true
							sellAgain = false
							// SAATNYA JUAL
							let Trade = await trade('sell', lastSellBid, lastSell, 'btc')
							btcBalance = Trade.balance.btc
							idrBalance = Trade.balance.idr
							sendMessage('Anda Menjual', lastSell, 'Dengan Harga', lastSellBid)
							console.log("Anda Menjual", lastSell, "Dengan harga", lastSellBid)
							sendMessage('Saldo Terakhir Anda BTC: ', btcBalance, 'IDR:', idrBalance)
						} else {
							console.log("Tidak jadi Jual", kepercayaanJual)
						}
					} else {
						console.log("Harga naik tidak jadi beli")
					}
				}
			}
			lastBid = parseFloat(lastVIP)
		}
		run()
	}).catch((e) => {
		sendMessage('Error get ticker' + e)
		console.error(e)
	})
}

sendMessage(new Date() + 'Robot berjalan dengan api key: ' + process.env.VIP_KEY + 'dan secret key: ' + process.env.SECRET_KEY)
getBalance().then((balance) => {
	console.log("Done get btc balance")
	btcBalance = parseFloat(balance.btc)
	idrBalance = parseFloat(balance.idr)
	run()
}).catch(console.error)
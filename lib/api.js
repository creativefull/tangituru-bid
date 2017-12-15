const request = require('request')
const crypto = require('crypto')
const querystring = require('querystring')

let api = 'https://vip.bitcoin.co.id/tapi/'
let apiKey = process.env.VIP_KEY
let secretKey = process.env.SECRET_KEY

let getNonce = () => {
	return new Date().getTime()
}

let hash = (str) => {
	return crypto.createHmac('sha512', secretKey).update(str).digest('hex')
}

let buildQuery = (data) => {
	return querystring.stringify(data)
}

exports.requestAPI = (uri, options = {}) => {
	let data = options
	data['method'] = uri
	data['nonce'] = getNonce()

	let postData = buildQuery(data)
	let sign = hash(postData)

	return new Promise((resolve, reject) => {
		request({
			method : 'POST',
			url : api,
			headers : {
				'Key' : apiKey,
				'User-Agent' : 'Mozila/5.0',
				'Sign' : sign,
				'content-type': 'application/x-www-form-urlencoded'
			},
			form : data
		}, async (err, response, body) => {
			return resolve(JSON.parse(body))
		})
	})
}

exports.getTicker = (type) => {
	return new Promise((resolve, reject) => {
		request.get('https://vip.bitcoin.co.id/api/' + type + '/ticker', (err, response, body) => {
			return resolve(JSON.parse(body))
		})
	})
}
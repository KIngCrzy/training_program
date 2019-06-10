const rp = require('request-promise')
const request = require('request')
const util = require('util')

function PlayInCallback(start, end, callback) {
	const mid = Math.floor((start + end) / 2)
	request(
		`http://127.0.0.1:8080/guess?guessnum=${mid}`,
		(error, response, body) => {
			if (body === 'bigger') {
				PlayInCallback(start, mid, callback)
			}
			if (body === 'equal') {
				callback(error, mid)
			}
			if (body === 'smaller') {
				PlayInCallback(mid, end, callback)
			}
		}
	)
}

function playInPromise(start, end) {
	const mid = Math.floor((start + end) / 2)
	return rp.get(`http://127.0.0.1:8080/guess?guessnum=${mid}`).then((body) => {
		if (body === 'bigger') {
			return playInPromise(start, mid)
		}
		if (body === 'equal') {
			return mid
		}
		if (body === 'smaller') {
			return playInPromise(mid, end)
		}
		return undefined
	})
}

async function playInAsync(start, end) {
	const mid = Math.floor((start + end) / 2)
	const body = await rp.get(`http://127.0.0.1:8080/guess?guessnum=${mid}`)
	if (body === 'bigger') {
		const aplayInAsync = await playInAsync(start, mid)
		return aplayInAsync
	}
	if (body === 'equal') {
		return mid
	}
	if (body === 'smaller') {
		const aplayInAsync = await playInAsync(mid, end)
		return aplayInAsync
	}
	return undefined
}

const playInCallback = util.promisify(PlayInCallback)
async function play() {
	await playInCallback(0, 1000000)
	await playInPromise(0, 1000000)
	await playInAsync(0, 1000000)
}

play()

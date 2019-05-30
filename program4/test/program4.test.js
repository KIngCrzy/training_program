require('should')
const rp = require('request-promise')
const redis = require('redis')
const util = require('util')

const client = redis.createClient()
const getrandom = util.promisify(client.get).bind(client)

describe('restart', () => {
	let random
	before(async () => {
		it('should set new random', () => {
			rp.get('http://127.0.0.1:8080/restart')
				.then((body) => {
					body.should.eql('ok')
				})
				.catch((err) => {
					console.log(err)
				})
		})
		random = Number(await getrandom('random'))
	})

	it('should reply correct response', async () => {
		const bigger = random + 1
		const smaller = random - 1
		let body = await rp.get(`http://127.0.0.1:8080/guess?guessnum=${bigger}`)
		body.should.eql('bigger')
		body = await rp.get(`http://127.0.0.1:8080/guess?guessnum=${smaller}`)
		body.should.eql('smaller')
		body = await rp.get(`http://127.0.0.1:8080/guess?guessnum=${random}`)
		body.should.eql('equal')
	})

	it('should play game until reply equal', () => {
		function play(start, end) {
			const mid = Math.floor((start + end) / 2)
			rp.get(`http://127.0.0.1:8080/guess?guessnum=${mid}`)
				.then((body) => {
					if (body === 'bigger') {
						end = mid
						play(start, end)
					}
					if (body === 'equal') {
						body.should.eql('equal')
					}
					if (body === 'smaller') {
						start = mid
						play(start, end)
					}
				})
				.catch((err) => {
					console.log(err)
				})
		}
		play(0, 100)
	})
})

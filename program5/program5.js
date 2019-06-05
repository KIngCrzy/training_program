const Koa = require('koa')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser')
const cors = require('koa2-cors')
const redis = require('redis')
const util = require('util')
const rp = require('request-promise')
const request = require('request')

const client = redis.createClient()

const app = new Koa()
const router = new Router()

const getrandom = util.promisify(client.get).bind(client)

function compare(num, random, ctx) {
	console.log('getnum:', num)
	console.log('random:', random)
	if (num > random) {
		ctx.response.body = 'bigger'
	}
	if (num === random) {
		ctx.response.body = 'equal'
		const newrandom = Math.floor(Math.random() * 1000000 + 1)
		client.set('random', newrandom)
		console.log('newrandom:', newrandom)
	}
	if (num < random) {
		ctx.response.body = 'smaller'
	}
}

async function GuessInAsync(start, end) {
	const mid = Math.floor((start + end) / 2)
	const body = await rp.get(`http://127.0.0.1:8080/guess?guessnum=${mid}`)
	if (body === 'bigger') {
		end = mid
		GuessInAsync(start, end)
	}
	if (body === 'smaller') {
		start = mid
		GuessInAsync(start, end)
	}
}

function GuessInPromise(start, end) {
	const mid = Math.floor((start + end) / 2)
	rp.get(`http://127.0.0.1:8080/guess?guessnum=${mid}`).then((body) => {
		if (body === 'bigger') {
			end = mid
			GuessInPromise(start, end)
		}
		if (body === 'equal') {
			GuessInAsync(0, 1000000)
		}
		if (body === 'smaller') {
			start = mid
			GuessInPromise(start, end)
		}
	})
}

function GuessInCallback(start, end) {
	const mid = Math.floor((start + end) / 2)
	request(
		`http://127.0.0.1:8080/guess?guessnum=${mid}`,
		(err, response, body) => {
			if (body === 'bigger') {
				end = mid
				GuessInCallback(start, end)
			}
			if (body === 'equal') {
				GuessInPromise(0, 1000000)
			}
			if (body === 'smaller') {
				start = mid
				GuessInCallback(start, end)
			}
		}
	)
}

router.get('/guess', async (ctx) => {
	const guessnum = Number(ctx.query.guessnum)
	const random = Number(await getrandom('random'))
	compare(guessnum, random, ctx)
})

GuessInCallback(0, 1000000)

app.use(cors())
app.use(bodyparser())
app.use(router.routes()).use(router.allowedMethods())
app.listen(8080)

const Koa = require('koa')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser')
const cors = require('koa2-cors')
const redis = require('redis')
const util = require('util')

const client = redis.createClient()

const app = new Koa()
const router = new Router()

app.use(cors())
app.use(bodyparser())

const getrandom = util.promisify(client.get).bind(client)
const setrandom = util.promisify(client.set).bind(client)

function setnewrandom(ctx) {
	const newrandom = Math.floor(Math.random() * 100 + 1)
	setrandom('random', newrandom)
	ctx.response.body = 'ok'
}

function compare(num, random, ctx) {
	console.log('getnum:', num)
	console.log('random:', random)
	if (num > random) {
		ctx.response.body = 'bigger'
	}
	if (num === random) {
		ctx.response.body = 'equal'
		const newrandom = Math.floor(Math.random() * 100 + 1)
		client.set('random', newrandom)
		console.log('new random:', newrandom)
	}
	if (num < random) {
		ctx.response.body = 'smaller'
	}
}

router.get('/guess', async (ctx) => {
	const guessnum = Number(ctx.query.guessnum)
	const random = Number(await getrandom('random'))
	compare(guessnum, random, ctx)
})

router.get('/restart', async (ctx) => {
	setnewrandom(ctx)
})

app.use(router.routes()).use(router.allowedMethods())
app.listen(8080)

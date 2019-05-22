const Koa = require('koa')
const Router = require('koa-router')
const redis = require('redis')
const util = require('util')

const client = redis.createClient()

const app = new Koa()
const router = new Router()

const getrandom = util.promisify(client.get).bind(client)

function compare(num, random, ctx) {
	console.log('random:', random)
	if (num > random) {
		ctx.response.body = 'bigger'
	}
	if (num === random) {
		ctx.response.body = 'equal'
		const newrandom = Math.floor((Math.random() * 100 + 1))
		client.set('random', newrandom)
		console.log('new random:', newrandom)
	}
	if (num < random) {
		ctx.response.body = 'smaller'
	}
}

router.get('/start', async (ctx) => {
	const random = Math.floor((Math.random() * 100 + 1))
	client.set('random', random)
	console.log('new random:', random)
	ctx.response.body = 'ok'
})

router.get('/:number', async (ctx) => {
	const num = ctx.params.number
	console.log('num:', num)
	const random = await getrandom('random')
	compare(num, random, ctx)
})

app.use(router.routes()).use(router.allowedMethods())
app.listen(process.argv[2])

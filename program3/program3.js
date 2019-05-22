const Koa = require('koa')
const Router = require('koa-router')
const redis = require('redis')
const util = require('util')

const client = redis.createClient()

const app = new Koa()
const router = new Router()
let random = 0
let num = 0
let state = 0

const getrandom = util.promisify(client.get).bind(client)

function compare(r) {
	console.log('random:', r)
	if (num > r) {
		state = 0
	}
	if (num === r) {
		state = 1
	}
	if (num < r) {
		state = 2
	}
}

router.get('/start', async (ctx) => {
	if (random === 0) {
		random = Math.floor((Math.random() * 100 + 1))
	}
	client.set('random', random)
	client.get('random', (err, v) => {
		console.log('random', v)
	})
	ctx.response.body = 'ok'
})

router.get('/:number', async (ctx) => {
	num = ctx.params.number
	console.log('num:', num)
	const random1 = await getrandom('random')
	compare(random1)
	switch (state) {
	case 0:
		ctx.response.body = 'bigger'
		break
	case 1:
		ctx.response.body = 'equal'
		random = Math.floor((Math.random() * 100 + 1))
		client.set('random', random)
		console.log('new random:', random)
		break
	case 2:
		ctx.response.body = 'smaller'
		break
	default:
		break
	}
})

app.use(router.routes()).use(router.allowedMethods())
app.listen(process.argv[2])

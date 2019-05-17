const Koa = require('koa')
const Router = require('koa-router')
const redis = require('redis')

const client = redis.createClient()

const app = new Koa()
const router = new Router()
let random = 0
let random1 = 0

router.get('/start', async (ctx) => {
	if (random === 0) {
		random = Math.floor((Math.random() * 100, 10))
	}
	client.set('random', random)
	client.get('random', (err, v) => {
		random1 = v
		console.log(random1)
	})
	console.log(random)
	ctx.response.body = 'ok'
})

router.get('/:number', async (ctx) => {
	const num = ctx.params.number
	console.log(num)
	if (num > random1) {
		ctx.response.body = 'bigger'
	}
	if (num === random1) {
		ctx.response.body = 'equal'
		random = Math.floor((Math.random() * 100, 10))
		console.log(random)
	}
	if (num < random1) {
		ctx.response.body = 'smaller'
	}
})

client.on('error', (error) => {
	console.log(error)
})

app.use(router.routes()).use(router.allowedMethods())
app.listen(process.argv[2])

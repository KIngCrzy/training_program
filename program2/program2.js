const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()
const router = new Router()
let random = 0
let num = 0

router.get('/start', async (ctx) => {
	random = parseInt(Math.random() * 100, 10)
	console.log(random)
	ctx.response.body = 'ok'
})

router.get('/:number', async (ctx) => {
	num = ctx.params.number
	console.log(num)
	if (num > random) {
		ctx.response.body = 'bigger'
	}
	if (num === random) {
		ctx.response.body = 'equal'
		random = parseInt(Math.random() * 100, 10)
		console.log(random)
	}
	if (num < random) {
		ctx.response.body = 'smaller'
	}
})

app.use(router.routes()).use(router.allowedMethods())
app.listen(80)

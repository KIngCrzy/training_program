const session = require('koa-session')
const Koa = require('koa')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser')
const cors = require('koa2-cors')
const mongoose = require('mongoose')
const crypto = require('crypto')

mongoose.Promise = global.Promise
mongoose.set('debug', true)
mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true })

const user = mongoose.model('user', {
	name: String,
	salt: String,
	password: String,
})
const number = mongoose.model('number', {
	userid: String,
	number: Number,
})

function getRandomSalt() {
	return Math.random()
		.toString()
		.slice(2, 5)
}

function md5pwd(name, password, salt) {
	const saltpassword = name + salt + password
	const md5 = crypto.createHash('md5')
	return md5.update(saltpassword).digest('hex')
}

function compare(num, random, ctx) {
	console.log('getnum:', num)
	console.log('random:', random)
	if (num > random) {
		ctx.response.body = 'bigger'
	}
	if (num === random) {
		ctx.response.body = 'equal'
	}
	if (num < random) {
		ctx.response.body = 'smaller'
	}
}

const app = new Koa()
const router = new Router()

app.keys = ['some secret hurr']
app.use(session(app))

router.get('/register/:name/:password', async (ctx) => {
	const { name, password } = ctx.params
	const salt = getRandomSalt()
	const md5password = md5pwd(name, password, salt)
	const doc = await user.findOne({ name })
	if (doc === null) {
		const newuser = new user({
			name,
			salt,
			password: md5password,
		})
		newuser.save()
		ctx.response.body = '注册成功'
	} else {
		ctx.response.body = '用户名已存在'
	}
})

router.get('/login/:name/:password', async (ctx) => {
	const { name, password } = ctx.params
	const doc = await user.findOne({ name })
	console.log('doc', doc)
	if (doc === null) {
		ctx.response.body = '用户不存在'
	} else {
		const usersalt = doc.salt
		const md5password = md5pwd(name, password, usersalt)
		const userpassword = doc.password
		if (md5password === userpassword) {
			ctx.session.id = doc.id
			console.log(ctx.session.id)
			ctx.response.body = `Hello${name}`
		} else {
			console.log('error password')
		}
	}
})

router.get('/start', async (ctx) => {
	const userid = ctx.session.id
	console.log(userid)
	if (!userid) {
		ctx.response.body = '请登录'
	} else {
		const random = getRandomSalt()
		const doc = await number.findOne({ userid })
		if (doc === null) {
			await number.create({ userid, number: random })
			ctx.response.body = '游戏开始'
		} else {
			await number.updateOne({ userid }, { number: random })
			ctx.response.body = '游戏开始'
		}
	}
})

router.get('/guess/:number', async (ctx) => {
	console.log(ctx.params)
	const userid = ctx.session.id
	if (!userid) {
		ctx.response.body = '请登录'
	} else {
		const doc = await number.findOne({ userid })
		const random = Number(doc.number)
		const num = Number(ctx.params.number)
		compare(num, random, ctx)
	}
})

router.get('/logout', async (ctx) => {
	ctx.session.id = null
	ctx.response.body = '记录已删除'
})

router.get('/delete/:name', async (ctx) => {
	const { name } = ctx.params
	const doc = await user.findOne({ name })
	if (doc === null) {
		ctx.response.body = '用户不存在'
	} else {
		const userid = doc.id
		await number.deleteOne({ userid })
		await user.deleteOne({ name })
		ctx.response.body = '用户已删除'
	}
})

app.use(cors())
app.use(bodyparser())
app.use(router.routes()).use(router.allowedMethods())
app.listen(8080)

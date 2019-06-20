require('should')
let rp = require('request-promise')

rp = rp.defaults({ jar: true })

describe('test', () => {
	it('should register correctly', async () => {
		const body = await rp.get('http://127.0.0.1:8080/register/abcc/123456')
		body.should.be.equalOneOf(['用户名已存在', '注册成功'])
	})

	it('should login correctly', async () => {
		const body = await rp.get('http://127.0.0.1:8080/login/abcc/123456')
		body.should.be.equalOneOf(['用户名不存在', 'Helloabcc'])
	})

	it('should set new random', async () => {
		const body = await rp.get('http://127.0.0.1:8080/start')
		body.should.eql('游戏开始')
	})

	it('should reply correct response', async () => {
		const body = await rp.get('http://127.0.0.1:8080/20')
		body.should.be.equalOneOf(['bigger', 'smaller', 'equal'])
	})

	it('should delete correctly', async () => {
		const body = await rp.get('http://127.0.0.1:8080/logout/abcc/123456')
		body.should.be.equalOneOf(['用户不存在', '用户已删除'])
	})
})

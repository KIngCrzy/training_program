require('should')
let rp = require('request-promise')

rp = rp.defaults({ jar: true })

describe('test', () => {
	it('should register correctly', async () => {
		const body = await rp.get('http://127.0.0.1:8080/register/abcc/123456')
		body.should.be.eql('注册成功')
	})

	it('should login correctly', async () => {
		const body = await rp.get('http://127.0.0.1:8080/login/abcc/123456')
		body.should.be.eql('Helloabcc')
	})

	it('should set new random', async () => {
		const body = await rp.get('http://127.0.0.1:8080/start')
		body.should.eql('游戏开始')
	})

	it('should reply correct response', async () => {
		const body = await rp.get('http://127.0.0.1:8080/guess/40')
		body.should.be.equalOneOf(['bigger', 'smaller', 'equal'])
	})

	it('should logout correctly', async () => {
		const body = await rp.get('http://127.0.0.1:8080/logout')
		body.should.be.eql('记录已删除')
	})

	it('should delete correctly', async () => {
		const body = await rp.get('http://127.0.0.1:8080/delete/abcc')
		body.should.be.eql('用户已删除')
	})
})

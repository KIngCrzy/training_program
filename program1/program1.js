const http = require('http')

http.createServer((request, response) => {
	response.writeHead(200, { 'Content-Type': 'text/plain' })

	response.end('Hello World')
}).listen(80)
console.log('running')

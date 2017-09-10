const winston = require('winston')
const dgram = require('dgram')
const config = require('./config')

const { testMessages, server } = config
const client = dgram.createSocket('udp4')
const start = Date.now()

winston.cli()
winston.info(`[Client] Running test ...`)

for (let i = 0; i < testMessages; ++i) {
  client.send(`${Date.now()}`, server.port, server.host, err => {
    if (err) return winston.error(`${err.message}\n${err.stack}`)
    if (i === testMessages - 1) {
      const time = (Date.now() - start) / 1000
      winston.info(`[Client] Finished test.`)
      winston.info(`[Client] ${testMessages} requests in ${time}s`)
      client.close()
    }
    return
  })
}

const dgram = require('dgram')
const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline
const winston = require('winston')
const config = require('./config')

const server = dgram.createSocket('udp4')
const client = dgram.createSocket('udp4')
const parser = new Readline({ delimiter: '\n' })
const port = new SerialPort(config.serial.device, {
  baudRate: config.serial.baudRate
})

function handleError(err) {
  return winston.error(`${err.message}\n${err.stack}`)
}

function processBuffer(buffer) {
  const message = buffer.toString('utf8')
  const data = message.split(config.delimiter)
  const time = Date.now() - parseInt(data[0])
  return { message, data, time }
}

winston.cli()
port.pipe(parser)

port.on('error', handleError)

port.on('open', () => {
  return winston.info(`[Server] Serial port open: ${config.serial.device} @ ${config.serial.baudRate}Bd`)
})

parser.on('data', buffer => {
  const { message, data, time } = processBuffer(buffer)
  winston.info(`[Server] [${config.serial.device} @ ${config.serial.baudRate}Bd] ${message} ${time}ms`)
  client.send(message, config.client.port, config.client.host)
})

server.on('error', handleError)

server.on('listening', () => {
  const socket = server.address()
  return winston.info(`[Server] UDP server online: ${socket.address}:${socket.port}`)
})

server.on('message', (buffer, info) => {
  const { message, data, time } = processBuffer(buffer)
  winston.info(`[Server] [${info.address}:${info.port}] ${message} ${time}ms`)
  port.write(`${message}\n`)
})

server.bind(config.server.port, config.server.host)

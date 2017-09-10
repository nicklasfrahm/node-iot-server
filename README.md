# *node-iot-server*

## Installation

### Prerequisites
You are required to have a recent version of node. You should have at least the latest LTS installed. If you have trouble to install node on linux or if you are stuck on legacy versions from the debian repository, have a look at the [node version manager](https://github.com/creationix/nvm). You might also be able to run it with **node v4**, although this is neither tested nor recommended.

### Dependencies
Open a terminal inside your local copy of the repository and run: `npm install`  

## Usage

### Architecture
To understand the architecture of the application a small list will show how the data is sent from source to destination.

- client sends **UDP message** to
- node-iot-server *(server)* sends **serial message** to
- serial device sends **serial message** to
- node-iot-server *(client)* sends **UDP message** to
- arbitrary UDP server

### Configuration
Before using the `node-iot-server`, it has to be configured. In order to configure it, open the `source/config.json` file and edit it according to this guide:

- `server.host`: interface of the UDP socket for incoming messages
- `server.port`: port of the UDP server for incoming messages
- `client.host`: interface of the UDP socket for outgoing messages
- `client.port`: port of the UDP server for outgoing messages
- `serial.device`: serial device, e.g: `COM1` (*Windows*) or `/dev/ttyUSB0` (*Linux*)
- `serial.baudRate`: baud rate for the serial device, e.g. `115200`
- `testMessages`: amount of messages the test tool will send
- `delimiter`: symbol or string to separate timestamp and payload

### Execution
Open a terminal inside this repository and run: `npm start`  
The server will now run inside your terminal and wait for incoming messages to be forwarded to your serial device.

### Testing
The `node-iot-server` comes with a basic testing tool which allows you to test the speed of node and your serial communication. This way it is possible to determine possible bottlenecks in the communication with real-time endpoints and devices.

Open a **new** terminal inside this repository and run: `npm test`  

### Data interpretation
In order to be able to benchmark the performance of the underlying tools, the message is required to have a special form. Every message begins with the amount of milliseconds from the 01. January 1970, which may be obtained in JavaScript by calling `Date.now()`. Then the payload is sent separated by the delimiter specified in the config file. Therefore a generic message could look like this:

```
timestamp=payload
1505063703972=This message can easily be parsed.
```

The server logs two times per message:
- When it receives the UDP message. It calculates the delta between the timestamp and the current timestamp. It also outputs infomation about the client.  
`info:    [Server] [127.0.0.1:62374] 1505063703972=Example message. 25ms`
- When it receives the serial message. It calculates the delta between the same timestamp and the new current timestamp. It will output information about the serial connection.  
`info:    [Server] [COM4 @ 115200Bd] 1505063703972=Example message. 35ms`

**Note:** The two millisecond intervals from the log outputs use the same initial timestamp to calculate the delta as the message is not altered. This might seem unintuitive, but is useful as you can directly see the latency for the server and the total time it takes the server to process one message. If you want to find out the latency of the serial communication, you have to adjust the server to your needs.

### Adjustments
If you want to adjust the server to your needs, make sure you use non-blocking functions and callbacks properly to prevent yourself from crippling performance. For example:

```
// bad
console.log('This is a test.')

// good
process.stdout.write('This is a test.\n')
```

`console.log()` is a good example for a common bad pratice as it is a blocking (synchronous) function which preserves the event loop being effective. If you want to learn more about this, I would recommended you to read up on synchronous and asynchronous functions in JavaScript.

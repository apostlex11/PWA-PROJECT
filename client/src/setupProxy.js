// using http-proxy-middleware to app.use multiple servers (testing, not 100% sure how to implement successfully yet)

const { createProxyMiddleware } = require('http-proxy-middleware');

const proxy = {
    target: 'http://localhost:3000',
    changeOrigin: true
}

const proxy2 = {
    target: 'http://localhost:4000',
    changeOrigin: true
}

// might need this extra proxy for harper?
const proxy3 = {
    target: 'http://localhost:5000',
    changeOrigin: true
}

// create as many proxies as needed

module.exports = function (app) {
    app.use('/graphql', createProxyMiddleware(proxy))
    app.use('/socket', createProxyMiddleware(proxy2))
    // all of these proxies need accurate addresses still!
    app.use('/harper', createProxyMiddleware(proxy3))
    // etc.
    // in theory, this will allow the client side (deployed version) to access multiple different servers through proxies set up on the same exact address, not exactly sure how to properly implement this yet, but might be a solution to the socket.io + apollo server issue
};

// site won't launch on server/server.js if this isn't active!!! gotta figure out what the correct routing is here
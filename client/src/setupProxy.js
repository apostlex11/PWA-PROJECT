// using http-proxy-middleware to app.use multiple servers (testing, not 100% sure how to implement successfully yet)

const { createProxyMiddleware } = require('http-proxy-middleware');

const proxy = {
    target: 'http://localhost:3000',
    changeOrigin: true
}

const proxy2 = {
    target: 'http://localhost:3000',
    changeOrigin: true
}

// create as many proxies as needed

module.exports = function (app) {
    app.use('/firstsource', createProxyMiddleware(proxy))
    app.use('/secondsource', createProxyMiddleware(proxy2))
    // etc.
    // in theory, this will allow the client side (deployed version) to access multiple different servers through proxies set up on the same exact address, not exactly sure how to properly implement this yet, but might be a solution to the socket.io + apollo server issue
};


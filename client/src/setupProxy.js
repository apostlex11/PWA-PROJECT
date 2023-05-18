// using http-proxy-middleware to app.use multiple servers (testing, not 100% sure how to implement successfully yet)

// const { createProxyMiddleware } = require('http-proxy-middleware');

// ChatGPT refactor
// const graphqlProxy = {
//     target: 'http://localhost:4000',
//     ws: true
// }

// const socketProxy = {
//     target: 'http://localhost:4000',
//     ws: true
// }

// create as many proxies as needed

// module.exports = function (app) {
//     // app.use('/graphql', createProxyMiddleware(proxy))
//     // app.use('/socket.io', createProxyMiddleware(proxy2))
//     // app.use('/harper', createProxyMiddleware(proxy3))

//     app.use('/graphql', createProxyMiddleware(graphqlProxy));
//     app.use('/socket.io', createProxyMiddleware(socketProxy));
// };

// site won't launch on server/server.js if this isn't active!!! 
// gotta figure out what the correct routing is here

// chatGPT refactoring

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/graphql',
    createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
    })
  );

  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      ws: true,
      logLevel: 'debug',
      changeOrigin: true,
    })
  );
};
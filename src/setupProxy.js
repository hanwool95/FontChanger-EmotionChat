const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app){
    app.use( createProxyMiddleware('/image_api',
        { target: 'https://api-us.faceplusplus.com',
            pathRewrite: { '^/image_api':'' },
            changeOrigin: true }) )
}

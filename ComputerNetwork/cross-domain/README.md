## 跨域
> 跨域是指一个域下的文档或者脚本试图去请求另一个域下的资源。  

## 了解一下同源策略  
同源策略时浏览器最核心最基本的安全功能。如果缺少了同源策略，浏览器很容易受到XSS,CSRF等攻击。所谓同源是指"协议+域名+端口"三者相同，即便两个不同的域名指向同一个ip地址，也非同源。

### 跨域方法有多少种  
常见的跨域方法有1.CORS(跨域资源共享),2.JSONP,3.node.js中间件(http-proxy-middleware)  
其他不太常见的有1.iframe + postMessage 2.domain

1.CORS(跨域资源共享)  
普通跨域请求：只服务端设置Access-Control-Allow-Origin即可，前端无须设置，若要带cookie请求：前后端都需要设置。 

```Java
"Access-Control-Allow-Origin":'*'
```
ajax请求有分两种请求。一种是简单请求。一种是非简单请求  
简单请求是GET POST HEAD (简单请求就是浏览器直接发送请求，在头信息中加一个Origin，服务器根据这个值，是否同意这个请求)  
非简单请求就是PUT DELETE Content-Type:application/json  
在发送请求前都会有一次预请求，要求服务器确定这样的请求，预请求的方法是OPTIONS，关键字是Origin，表示来自哪个源  
一般Access-Control-Allow-orgin不为*假如设置了*,表示不同域的都能访问，容易出现安全问题，在线上域名上都可以访问




2.JSONP  
> JSONP的原理:利用动态创建的Script标签中的src属性可以获取任何域下的脚本，服务端返回的不是JSON格式，是一段调用某函数的JS脚本 从而实现了跨域。所以JSONP必须要有callback回调函数去调用函数里面返回的JS。

```JS
 <script>
    var script = document.createElement('script');
    script.type = 'text/javascript';

    // 传参并指定回调执行函数为onBack
    script.src = 'http://www.domain2.com:8080/login?user=admin&callback=onBack';
    document.head.appendChild(script);

    // 回调执行函数
    function onBack(res) {
        alert(JSON.stringify(res));
    }
 </script>
```

服务端返回的JS需要设置一个Callback
```JS
onBack({"status": true, "user": "admin"})
```

JSONP跨域的缺点  
1.JSONP只能GET请求  
2.JSONP的安全性问题:JSONP提供的服务中有漏洞，就是返回的JS的内容是有安全问题的，造成所有调用这个JSONP的网站都会存在漏洞。攻击者 可以在自己的站点写入一条访问的JS，在用户cookie还没有过期的情况下，JSON中返回敏感的用户信息，然后攻击就可以获取数据




3.node.js中间件(http-proxy-middleware)
> 利用node.js搭建服务器实现请求转发实现跨域

```JS
var express = require('express');
var proxy = require('http-proxy-middleware');
var app = express();

app.use('/', proxy({
    // 代理跨域目标接口
    target: 'http://www.domain2.com:8080',
    changeOrigin: true,

    // 修改响应头信息，实现跨域并允许带cookie
    onProxyRes: function(proxyRes, req, res) {
        res.header('Access-Control-Allow-Origin', 'http://www.domain1.com');
        res.header('Access-Control-Allow-Credentials', 'true');
    },

    // 修改响应信息中的cookie域名
    cookieDomainRewrite: 'www.domain1.com'  // 可以为false，表示不修改
}));

app.listen(3000);
console.log('Proxy server is listen at port 3000...');
```

### 


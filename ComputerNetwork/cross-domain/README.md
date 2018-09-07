## 跨域
> 跨域是指一个域下的文档或者脚本试图去请求另一个域下的资源。  

## 了解一下同源策略  
同源策略时浏览器最核心最基本的安全功能。如果缺少了同源策略，浏览器很容易受到XSS,CSRF等攻击。所谓同源是指"协议+域名+端口"三者相同，即便两个不同的域名指向同一个ip地址，也非同源。

### 跨域方法有多少种  
常见的跨域方法有1.CORS(跨域资源共享),2.JSONP,3.node.js中间件(http-proxy-middleware)  
其他不太常见的有1.iframe + postMessage 2.domain

1.CORS  



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
1.

3.node.js中间件(http-proxy-middleware)




### 


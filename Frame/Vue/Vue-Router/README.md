## Vue-Router

## 浅谈实现路由的方式  
1.利用锚点```#```不刷新页面的情况下监听URL变化，URL发生变化的同时出发路由回调重新渲染页面  
2.利用H5的history对象的pushState()方法

两种实现方式的区别  
1.pushState() 设置的新 URL 可以是与当前 URL 同源的任意 URL；而 hash 只可修改 # 后面的部分，因此只能设置与当前 URL 同文档的 URL  
2.pushState() 设置的新 URL 可以与当前URL一模一样，这样也会把记录添加到栈中；而hash设置的新值必须与原来不一样才会触发动作将记录添加到栈中  
3.pushState() 通过 stateObject 参数可以添加任意类型的数据到记录中；而 hash 只可添加短字符串  
4.pushState() 可以设置额外的title 提供给后端继续使用
5.hash设置没有浏览器兼容问题，但是pushState可能有  

## 手撕简单的锚点实现路由的方法
[点击](https://github.com/Primroses/offer-reaper/blob/b6fd48343d770461fa38d8291a8bb3b46f076122/Frame/Vue/Vue-Router/hash.js)
## Vue
> Vue 是一个渐进式的框架，其实说框架也不太准确。框架是对于一个问题自己拥有一套自己的的解决方案，Vue准确的来说是一个库,库是单一解决一个方面的。例如Vue这个库就是解决View层的，即视图层。但是说它是渐进式的框架就是，它可以把生态其他的库组合起来，组成一个强大的框架。这就是渐进式的理解

## Vue的双向绑定
> Vue中实现双向绑定需要是通过发布者订阅者的设计模式和三个模块1.observer2.complier3.watcher  

Observer:  
利用Object.defineProperty这个方法。劫持了数据的所有属性，并对所有属性添加上个get set方法。并且还维护一个订阅者数组(Dep)  
Compiler:  
解析模板，把实例属性填充到模板中，渲染页面，并且在数据属性上绑定订阅器，订阅数据的变化。  
Watcher:  
Watcher是两者之间的桥梁，数据发送变化的时候，调用订阅器上的notify方法，通知Complier更新视图  

手撕MVVM点击[->](https://github.com/Primroses/offer-reaper/tree/master/Frame/Vue/手撕MVVM/Vue.js)
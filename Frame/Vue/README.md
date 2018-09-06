## Vue
> Vue 是一个渐进式的框架，其实说框架也不太准确。框架是对于一个问题自己拥有一套自己的的解决方案，Vue准确的来说是一个库,库是单一解决一个方面的。例如Vue这个库就是解决View层的，即视图层。但是说它是渐进式的框架就是，它可以把生态其他的库组合起来，组成一个强大的框架。这就是渐进式的理解

## 你为什么选择Vue
> 当他问你这个问题的时候，多数是想着看看你对Vue的理解有多深或者说你有没有对比过其他的框架 

(1)Vue的代码阅读性很好，在React开发时，每个控件都需要单独的函数。函数式编程。阅读起来并不是太好。  
(2)Vue的Api比较简洁，友好。把注意力都集中在解决问题上。  
(3)Vue是集合了React和Angular的优秀部分  
    1.借鉴了React的虚拟DOM 单项数据流 状态管理 和 组件化  
    2.借鉴了angluar 封装了一些指令使得操作更加简便化，还有模板，和不同设计思想的双向绑定原理  
(4)Vue的缺点   
    1.Vue在运行时报错是指向Vue内部的方法。不够直观  
    2.React拥有庞大的生态圈。相对来说Vue的生态圈并不算那么大  
    3.Vue很灵活 和 学习曲线比较平缓。文档就能上手，不需要任何的门槛，对初学者比较友好


## Vue的双向绑定
> Vue中实现双向绑定需要是通过发布者订阅者的设计模式和三个模块1.observer2.complier3.watcher  

Observer:  
利用Object.defineProperty这个方法。劫持了数据的所有属性，并对所有属性添加上个get set方法。并且还维护一个订阅者数组(Dep)  
Compiler:  
解析模板，把实例属性填充到模板中，渲染页面，并且在数据属性上绑定订阅器，订阅数据的变化。  
Watcher:  
Watcher是两者之间的桥梁，数据发送变化的时候，调用订阅器上的notify方法，通知Complier更新视图  

手撕MVVM点击[----->](https://github.com/Primroses/offer-reaper/tree/master/Frame/Vue/手撕MVVM/Vue.js)

题外话:如果说Vue的缺点可以说上这个  
Object.defineProperty方法有两个缺点  
1.假如要监听数组的变化时候，只能通过8个变异方法监听。其他都不能监听数组变化。  

```JS
Object.getOwnPropertyDescriptor(a,"length");
{value: 2, writable: true, enumerable: false, configurable: false}
// 可以看出来 数组的长度是不可以被修改的 就是无法设置setter 和 getter

Object.getOwnPropertyDescriptor(a,'0');
// 数组的索引是可以用setter 和getter的
但是 length长度为5的数组 索引不一定 有4 如果索引不存在的话 就没法setter了
Object.defineproperty()这个方法的弊端

不能检测对象新添加的属性，对象可以初始化的时候设置好属性，不加新属性。数组也是对象。
```

2.因为Vue是通过递归监听对象的属性的，当对象属性多的时候，性能会受到巨大考验

## Vue的生命周期  
> Vue的生命周期包括(1)开始创建(2)初始化数据(3)编译模板(4)挂载DOM(5)渲染->更新->渲染(6)卸载等一系列过程。

用代码来解释一下
```JS
var app = new Vue({       --------> 创建Vue对象
                          --------> beforeCreate 钩子
    el : '#app',
    data : {             ----------> 开始监控Data对象的数据变化
        message : 'Hello Vue!'
    }
})

-  init Events Vue的内部初始化事件
                         ----------> created 钩子
-   数据观测(observer data) 挂载阶段尚未开始 $el属性不可见
                         ----------> beforMount 钩子
-   render函数首次被调用。实例已经编译了模板，把data里面的数据和模板     生成HTMl。但是html还没有挂载到页面上
                         ----------> mounted 钩子
-   用已经编译好的html内容替换el属性所指向的DOM对象。模板中的HTML渲染到了HTML页面上。这里一般可以做些Ajax操作。mounted只会执行一次
                         ---------->beforeUpdate钩子
-  不会触发附加的重新渲染过程
                         ----------->Upade 钩子
- 调用时，组件已经更新，可以执行依赖于DOM的操作。避免更新状态，这回导致无线循环。在服务端渲染期间不被调用
                        ------------>beforeDestroy钩子
- 实例销毁前，实例仍然可以用
                        ------------>destroyed 钩子
- 实例销毁后，所以实例都会消除，服务端渲染期间不被调用
```

## 父子间通信 非父子间通信
> 在Vue中，父子组件的关系可以总结为prop向下传递，事件向上传递。父组件通过prop给子组件下发数据，子组件通过事件给父组件发送消息。

(1)父组件通过prop向子组件传递
### 动态绑定

```JS  
<child  my-message="parentMsg"></child>
       ^
       |
```
这里的my-message不是动态绑定的，是定死的。当message初始化以后，子组件接收以后不再动态改变

```JS
<child :my-message="parentMsg"></child>
       ^
       |
```
这里的my-message是动态绑定的，父组件传过来的prop改变。子组件的也会跟着改变


### Prop是单项数据流
1.prop是单向数据流，父组件传递给子组件后，子组件就不能传给父组件 父->子这是为了防止子组件无意间修改了父组件的状态。  
**因为JS中的对象和数组都是引用的数据类型，指向内存的同一块区域**
2.问题? 如果Prop想做一个局部变量的时候  

  (1)定义一个局部变量，并用prop初始化
    ```JS
    props:['myMessage']
        data(){
            return {
                counter : this.myMessage
            }
        }
    ```
  (2)定义一个计算属性，处理Prop的值并返回
  ```
  props :['size'],  ---------------- 
    computed:{                      |
        normalizedSize(){           |    
            return this.size    <---|
        }
    }
  ```

(2)父组件在使用子组件中的地方直接用V-on来监听子组件触发的事件
```JS
<div id="message-event-example" class="demo">
    <p v-for="msg in messages">{{ msg }}</p>
    <button-message v-on:message="handleMessage"></button-message>
</div>                                                  ^
                                                        |    
  Vue.component('button-message', { --------------------|
        //注册了一个新的全局组件
        template: `<div>
                    <input type="text" v-model="message" />
                    <button v-on:click="handleSendMessage">Send</button> // v-on 监听子组件触发的事件
                </div>`,                                                    
                
                
        data: function () {
            return {
                message: 'test message'
            }
        },
        methods: {
            handleSendMessage: function () {
                // 触发事件
                this.$emit('message', { message: this.message })
            }
        }
})
```

## 简单聊聊Vue的diff算法
1.采用的是同层的搜索方式，而不是逐层遍历的方式，所以时间复杂度是O(n)  
2.先patch对比两个节点。通过比较新旧的虚拟DOM进行最小单位的修改视图  
3.patch判断的是 是否是同一节点 采用的方法是 标签名， key 还有是否为注释节点，是否定义data等。如果相同就进行patchNode方法  
4.patchNode是如果静态节点的话，就替换element 和 componentInstance  
5不是就要看是否有子节点来进行操作 两个都有 两个都无 一个有一个无等等  
6.最后就是假如都有子节点话就要updateChildren  
7.两头都有标记，如果是sameNode就 复用 否则就创建新的节点  
8.如果以上情况均不符合，则通过createKeyToOldIdx会得到一个oldKeyToIdx，里面存放了一个key为旧的VNode，value为对应index序列的哈希表，从这个哈希表中可以找到是否有与newStartVnode一致key的旧的VNode节点

附上一个Vue diff 的解析 [--->](https://github.com/Primroses/offer-reaper/tree/master/Frame/Vue/vue的diff)


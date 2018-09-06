// vm 实例 就是new Vue里面的 
class Vue {
    // 把el 和 data 指向实例 实例中可以调用el  和 data 
    constructor(options) {
        // 构造函数中传递的是一个对象 所以要对应的属性赋值
        this.el = options.el;
        this.data = options.data;
        if (this.el) {
            // 数据劫持
            new Observer(this.data)
            // 代理数据
            this.proxyData(this.data)
            // 元素模板 和 this 就是data 就是传入new Vue中的data
            new Complier(this.el, this)
        }
    }
    // 代理数据 vm.data.message = vm.message
    proxyData(data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                get() {
                    return data[key]
                },
                set(newVal) {
                    data[key] = newVal
                }
            })
        })
    }
}

// 编译的类
class Complier {
    // vm =>  let vm = new Vue() 把传入Vue构造函数中的data拿到
    constructor(el, vm) {
        // 先获取到 el
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm;
        // 把挂载的数据全部拿到 (挂载的元素就是范围)
        let fragment = this.nodeFragment(this.el)
        // 编译一手
        this.complie(fragment)
        // 放回去
        this.el.appendChild(fragment)
    }
    isElementNode(node) {
        return node.nodeType === 1;
    }
    isDirective(name) {
        // ES7?
        return name.includes("v-")
    }
    nodeFragment(el) {
        // 创建一个 文档碎片对象
        let fragment = document.createDocumentFragment();
        let firstChild;
        // 从第一个孩子中插入 当没有孩子的时候 就会跳出循环
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment;
    }
    complieElement(node) {
        let attrs = node.attributes;
        // attrs 也是一个伪数组
        Array.from(attrs).forEach(attr => {
            // 判断属性名字是否出现v-
            let attrName = attr.name;
            if (this.isDirective(attrName)) {
                let expr = attr.value;
                let [, type] = attrName.split("-")
                if (expr) {
                    CompileUtil[type](node, this.vm, expr)
                }
            }
        })
    }
    complieText(node) {
        let text = node.textContent;
        // 查看有没有 {{ }}
        let reg = /\{\{([^}]+)\}\}/g
        if (reg.test(text)) {
            CompileUtil["text"](node, this.vm, text)
        }
    }
    complie(fragment) {
        // 拿到的只是第一层的node
        let childNode = fragment.childNodes;
        Array.from(childNode).forEach(node => {
            // 是元素节点
            if (this.isElementNode(node)) {
                // 编译元素
                this.complieElement(node)
                // 递归遍历
                this.complie(node)
            } else {
                // 编译文本
                this.complieText(node)
            }
        })
    }
}
// 编译时需要的工具函数
let CompileUtil = {
    // 归并获取数据 获取data上嵌套的数据 例如 message.a.b.c.d
    getVal(vm, expr) {
        // 先把空格去掉 再切掉 message.a.b.c
        expr = expr.trim().split(".")
        // 获取实例上的数据 vm.data.message.a.b.c
        return expr.reduce((prev, next) => {
            return prev[next];
        }, vm.data)
    },
    getTextVal(vm, expr) {
        // 把{{ message }} => 替换成 data中的数据
        return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            return this.getVal(vm, arguments[1]);
        })
    },
    setVal(vm, expr, val) {
        expr = expr.split(".");
        // 归并函数同样的效果 就是 message.a.b 当到最后一个的时候就赋值操作
        return expr.reduce((prev, next, current) => {
            if (current === expr.length - 1) {
                return prev[next] = val;
            }
            return prev[next];
        }, vm.data)
    },
    text(node, vm, expr) {
        let update = this.textUpdater;
        // {{ message }} => 123456
        let value = this.getTextVal(vm, expr)
        expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            // 编译的时候就添加watcher 监听数据的变化
            new Watcher(vm, arguments[1], () => {
                // 如果文本数据变化了 需要重新获取依赖属性更新文本中的内容
                update && update(node, this.getTextVal(vm, expr))
            })
        })
        update && update(node, value)
    },
    model(node, vm, expr) {
        let update = this.modelUpdate;
        //并不是new Watcher就会立刻执行 而是当调用notify的时候通知watcher更新视图
        new Watcher(vm, expr, () => {
            // 编译的时候就添加watcher 监听这个属性的变化
            // 当属性的值发生变化后调用cb 将新值传递
            update && update(node, this.getVal(vm, expr))
            console.log("变化时候才会调用的watcher")
        })
        // 触发input 事件的时候 也要更新数据
        node.addEventListener('input', (e) => {
            let newVal = e.target.value;
            this.setVal(vm, expr, newVal)
        })
        // 第一次模板编译的时候 直接赋值
        update && update(node, this.getVal(vm, expr))

    },
    // 文本的更新
    textUpdater(node, value) {
        node.textContent = value;
    },
    // 输入框的更新
    modelUpdate(node, value) {
        node.value = value;
    }
}
// Observev 类主要就是要劫持数据 在数据中增加订阅数组
class Observer {
    constructor(data) {
        // 调用方法直接劫持数据
        this.observe(data)
    }
    observe(data) {
        // 假如不是object
        if (!data || typeof data !== "object") {
            return;
        }
        // 先获取data的 key 和value
        Object.keys(data).forEach(key => {
            // 给哪个data定义 定义的键 key 定义的值 data[key]
            this.defineReactive(data, key, data[key]);
            // 递归所有属性添加get 和 set方法
            if (typeof data[key] === "object") {
                this.observe(data[key])
            }
        })
    }
    // 定义响应式
    defineReactive(obj, key, val) {
        let _this = this;
        let dep = new Dep();
        // 每个变化的数据都会对应一个订阅器数组 这个数组是存放所有订阅属性的
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                // 模板编译的时候没有， Dep.target 存在的时候才添加到订阅器数组上 
                Dep.target && dep.addSub(Dep.target)
                return val;
            },
            // 值修改的时候 这里会检测到值的变化 然后就触发notify通知更新
            set(newVal) {
                if (newVal != val) {
                    // 这里的this不是实例
                    _this.observe(newVal)// 设置新对象的时候也要劫持
                    val = newVal;
                    dep.notify()// 通知所有人 数据更新了
                }
            }
        })
    }
}
// 两者的桥梁 观察数据变化 触发notify 通知更新
class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        // 获取值
        this.val = this.get()
    }
    // 获取当前实例上的对应数据
    get() {
        // 直接在订阅器类上定义一个静态的属性(watcher的实例)
        Dep.target = this;
        // 去实例获取值 把Watcher放进去了
        let val = CompileUtil.getVal(this.vm, this.expr);
        // 复用这个 值的意思吗?
        Dep.target = null;
        return val;
    }
    update() {
        // 先拿一下新值
        let newVal = CompileUtil.getVal(this.vm, this.expr)
        // 之前存放的是旧的值
        
 		// 只有新值和就值不同 才会更换视图        
        // let oldVal = this.val;
        // if (newVal != oldVal) {
        //     this.cb()
        // }
        if(newVal){
        	// 只要有新值就会更换视图
        	this.cb()
        }
    }
}
// 订阅者
class Dep {
    constructor() {
        // 这里是订阅的数组
        this.subs = []
    }
    // 数组中都是watcher的实例
    addSub(watcher) {
        this.subs.push(watcher)
    }
    // 通知订阅该数据变化的watcher触发notify方法
    notify() {
    	// 告知Watcher 监听的属性 要更新
        this.subs.forEach(watcher => watcher.update())
    }
}
## 虚拟DOM
> DOM的操作是非常慢的，而且花费的代价也较高，频繁的操作DOM会影响到页面的性能。JQuery只是高度封装了操作DOM的Api，没有本质的解决操作DOM的代价。这样虚拟DOM就横空出世，用JS去模拟DOM的结构，那么当数据状态发生变化而需要改变DOM结构时，我们先通过JS对象抽象的虚拟DOM计算出实际DOM需要做的最小变动，然后再操作实际DOM，从而避免了粗放式的DOM操作带来的性能问题。

## Vue的diff算法
> diff算法就是比较新旧VNode间的差异，通过最小的操作渲染出新的DOM\
vnode和浏览器DOM中的Node一一对应，通过vnode的elm属性可以访问到对应的Node。

Vue的双向绑定使得，数据改变的同时视图也改变。

**update方法**
> update方法接受了两个参数，function (vnode: VNode, hydrating?: boolean) \
(1)VNode 对象，内部将该VNode和旧的VNode进行patch\
(2)hydrating 是否跟真的DOM混合

- 先聊聊patch方法
patch就是将老和新的VNode进行比对，然后根据两者的比较结果进行最小单位地修改视图。

patch的核心是通过同层的树节点进行比较而不是对树逐层搜索遍历的方式，所以时间复杂度只有O(n)\
**patch的逻辑**
```JS
/* parms @oldVnode   旧的虚拟节点或旧的真实dom节点
 * parms @vnode      新的虚拟节点
 * parms @hydrating  是否要跟真是dom混合
 * parms @removeOnly 特殊flag <transitiongroup> 确保移除的元素保持正确的相对位置
 * parms @parentElm: 父节点
 * parms @refElm: 新节点将插入到refElm之前
 * 
 */

function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm){
    1.if(Undef(vnode)){
        if(idDef(oldVnode))
        // 如果VNode不存在且oldVnode存在 表示要销毁oldVnode 调用invokeDestory
    }
    2.if(Undef(oldVnode)){
        // 如果oldVNode不存在但是Vnode存在证明要创建一个节点 
        createElm()
    }
    3.当OldVNode和VNode都存在时
        (1) if(sameVnode(oldVnode,vnode)){
                如果oldVnode和 vnode是同一个节点 ，调用patchVNode来进行patch
            }
        (2) 当oldVnode和VNode不是同一个节点时，
            if(oldVnode.nodeType === 1 && oldVnode.hahAttribut(SSR_ATTR)){
                当oldVNode是真实节点 并且 oldVnode是服务端渲染的时候
                就把hydrating设置为true
            }
            如果需要hydrate函数将虚拟dmo和真实dom进行映射
            然后将oldVnode设置为对应的虚拟dom
            找到oldVnode.elm的父节点
            根据vnode创建一个真实的节点并插入到父节点的oldVNode.elm的位置
    
}
```
大概可以发现当oldVnode和VNode是sameVNode的时候才会进行patchVNode，其他都是创建新DOM，移除旧DOM

```JS
/* parms  @oldVnode            旧的虚拟节点或旧的真实dom节点
 * parms  @vnode               新的虚拟节点
 * parms  @removeOnly          特殊flag
 * parms  @insertedVnodeQuene  
 *
 *
 */
patchVnode(oldVnode,vnode,insertedVnodeQueue,removeOnly){
    if(oldVnode === vnode){
        如果新旧节点一致，什么都不做
    }
    if (isTrue(vnode.isStatic) &&isTrue(oldVnode.isStatic) &&vnode.key === oldVnode.key &&(isTrue(vnode.isCloned) || isTrue(vnode.isOnce))){
        //文本节点或注释节点
        如果新旧VNode都是静态的，同时它们的key相同（代表同一节点），
        并且新的VNode是clone或者是标记了once（标记v-once属性，只渲染一次），
        那么只需要替换elm以及componentInstance即可。
    }
    如果这个VNode节点没有text文本时
    if (isUndef(vnode.text)){
         // 并且都有子节点(并且完全不一致) 则调用updateChildren
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
        如果只有新的VNode有子节点
        if(isDef(ch)){
            elm已经引用了老的dom节点，在老的dom节点上添加子节点
            if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        }
        if (isDef(oldCh)){
            如果新vnode没有子节点，而Oldvnode有子节点，直接删除老的oldCh
            removeVnodes(elm, oldCh, 0, oldCh.length - 1)
        }
        if (isDef(oldVnode.text)) {
        当新老节点都无子节点的时候，只是文本的替换，因为这个逻辑中新节点text不存在，所以直接去除ele的文本
        nodeOps.setTextContent(elm, '')
        if (oldVnode.text !== vnode.text) {
        当新老节点text不一样时，直接替换这段文本
        nodeOps.setTextContent(elm, vnode.text)
        }
    }
}
```
patchVNode的大概逻辑是这样
- 如果oldVnode跟vnode完全一致，那么不需要做任何事情
-  如果oldVnode跟vnode都是静态节点，且具有相同的key，当vnode是克隆节点或是v-once指令控制的节点时，只需要把oldVnode.elm和oldVnode.child都复制到vnode上，也不用再有其他操作
- 否则，如果vnode不是文本节点或注释节点
    - 如果oldVnode和vnode都有子节点，且两方的子节点不完全一致，就执行updateChildren
    - 如果只有oldVnode有子节点，那就把这些节点都删除
    - 如果只有vnode有子节点，那就创建这些子节点
    - 如果oldVnode和vnode都没有子节点，但是oldVnode是文本节点或注释节点，就把vnode.elm的文本设置为空字符串
- 如果vnode是文本节点或注释节点，但是vnode.text != oldVnode.text时，只需要更新vnode.elm的文本内容就可以

**updateChildren**

```JS
具体的diff(利用Key生成的对象OldKeyToIdx中查找匹配节点，可以更高效的利用DOM)
/* parms @oldCh   旧节点的子节点
 * parms @newCh   新节点的子节点
 * parms @insertedVnodeQueue 插入队列？
 * parms @removeOnly 特殊flag <transitiongroup> 确保移除的元素保持正确的相对位置
 * parms @parentElm: 父节点
 * 
 */

function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    先声明四个索引 
    let oldStartIdx = 0 // 旧头索引
    let newStartIdx = 0 // 新头索引
    let oldEndIdx = oldCh.length - 1 // 旧尾索引
    let newEndIdx = newCh.length - 1 // 新尾索引
    
    获取对应的四个节点
    let oldStartVnode = oldCh[0] // oldVnode的第一个child
    let oldEndVnode = oldCh[oldEndIdx] // oldVnode的最后一个child
    let newStartVnode = newCh[0] // newVnode的第一个child
    let newEndVnode = newCh[newEndIdx] // newVnode的最后一个child
    
    控制遍历的条件 新旧节点谁先相遇 就停止
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        // 四种情况就是Key相同的时候，判定为同一个Vnode，直接patchVNode即可
        1. 当Start 和 end 两两相等的时候 直接patchVNode
        sameVnode(oldStartVnode, newStartVnode) || (sameVnode(oldEndVnode, newEndVnode)){
             patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        }
        2.sameVnode(oldStartVnode, newEndVnode){
             patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
             这时候说明oldStartVnode已经跑到了oldEndVnode后面去了，进行patchVnode的同时还需要将真实DOM节点移动到oldEndVnode的后面。
             canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        }
        3.sameVnode(oldEndVnode, newStartVnode){
            patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
            这说明oldEndVnode跑到了oldStartVnode的前面，进行patchVnode的同时真实的DOM节点移动到了oldStartVnode的前面。
            canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        }
        如果不符合以上四种情况的话
        调用createKeyToOldIdx会得到一个oldKeyToIdx(HashMap)存放一个Key为旧的VNode，value为对应index的哈希表
        function createKeyToOldIdx (children, beginIdx, endIdx) {
            var i, key;
            var map = {};
            for (i = beginIdx; i <= endIdx; ++i) {
                key = children[i].key;
                if (isDef(key)) { map[key] = i; }
                }
            return map
        }
        
        尝试在oldChildren中寻找和newStartVnode的具有相同的key的Vnode
        idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        如果没有找到 说明NewStartVNode是一个新的节点
        if (isUndef(idxInOld)) { 
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)
        }
        如果找到了和newStartVnodej具有相同的key的Vnode，叫vnodeToMove
        else {
            vnodeToMove = oldCh[idxInOld]
        } 
        需要移动的跟newStartVNode是相同节点
        if(sameVnode(vnodeToMove, newStartVnode)){
            // 相同就patchVNode
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue)
            然后再清空
             oldCh[idxInOld] = undefined
            // 移动到oldStartVnode.elm之前
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
        }else{
            // 如果key相同，但是节点不相同，则创建一个新的节点
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)
        }
        继续循环
        newStartVnode = newCh[++newStartIdx]
    }
}
```
updateChildren分两个阶段
- 不设置Key就仅仅是优化状态 判断头和尾的情况 一共四种
    - NewStart 和 oldStart相同
    - newEnd 和oldEnd相同
    - newStart 和 oldEnd相同
    - newEnd 和 oldStart相同
- 设置key是通过调用createKeyToOIdx 生成一个key是旧的VNode value是对应index的哈希表
    - 从这个哈希表中可以找到是否有与newStartVnode一致key的旧的VNode节点，如果同时满足sameVnode，patchVnode的    同时会将这个真实DOM（elmToMove）移动到oldStartVnode对应的真实DOM的前面。
    - oldEndVnode.el跑到了oldStartVnode.el的前边，准确的说应该是oldEndVnode.el需要移动到oldStartVnode.el的前边”。
    - 当然也有可能newStartVnode在旧的VNode节点找不到一致的key，或者是即便key相同却不是sameVnode，这个时候会调用createElm创建一个新的DOM节点。
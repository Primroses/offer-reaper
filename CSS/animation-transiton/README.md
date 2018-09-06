## 动画和过渡的区别

- animation和transition有什么区别?  
transition的优点在于简单易用，但是它有几个很大的局限。 
1.transition需要事件触发，所以没法在网页加载时自动发生.(:hover :focus :checked 媒体查询触发 JavaScript触发)  
2.transition是一次性的，不能重复发生，除非一再触发.  
3.transition只能定义开始状态和结束状态，不能定义中间状态，也就是说只有两个状态。 
4.一条transition规则，只能定义一个属性的变化，不能涉及多个属性。(定义多个的时候会覆盖掉，只能一个)

## window.requestAnimationFrame





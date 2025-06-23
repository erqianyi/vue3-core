function createInvoker(value) {
  const invoker = (e) => invoker.value(e)
  invoker.value = value // 更改invoker中的value属性即可以修改调用函数，避免重复绑定和解绑事件操作
  return invoker
}

export default function patchEvent(el, name, handler) {
  // _vei: vue_event_invoker
  const invokers = el._vei || (el._vei = {})

  const eventName = name.slice(2).toLowerCase()

  const existingInvoker = invokers[name] // 是否存在同名的事件绑定
  if (handler && existingInvoker) {
    // 事件绑定更新
    return (existingInvoker.value = handler)
  }

  if(handler) {
    const invoker = (invokers[name] = createInvoker(handler)) // 创建一个调用函数，并且在内部缓存
    el.addEventListener(eventName, invoker) // 绑定事件
  } 
  // 现在没有，之前有，则解绑
  if(existingInvoker) {
    el.removeEventListener(eventName, existingInvoker)
    invokers[name] = undefined
  }
}
import { isObject } from '@vue/shared'
import { mutableHandles, ReactiveFlags } from './baseHandler'
// 用于记录我们的代理后的结果，可以复用
const reactiveMap = new WeakMap();

function createReactiveObject(target) {
  if (!isObject(target)) {
    return target;
  }

  // 检查target是否已经被代理过
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  const existingProxy = reactiveMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  let proxy = new Proxy(target, mutableHandles)
  reactiveMap.set(target, proxy)
  return proxy
}

export function reactive(target) {
  return createReactiveObject(target)
}

export function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}
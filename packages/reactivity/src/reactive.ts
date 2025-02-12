import { isObject } from '@vue/shared'

// 用于记录我们的代理后的结果，可以复用
const reactiveMap = new WeakMap();

enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

const mutableHandles: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
  },
  set(target, key, value, receiver) {
    return true
  }
}

export function reactive(target) {
  return createReactiveObject(target)
}

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
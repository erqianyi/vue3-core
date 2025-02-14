import { isObject } from '@vue/shared'
import { track, trigger } from './reactiveEffect'
import { reactive } from './reactive'

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

// proxy 需要搭配 reflect 使用
export const mutableHandles: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    // 在取值时应该让给你响应式属性和 effect 映射起来
    // effect 收集依赖
    track(target, key) // 收集哪个对象里的哪个属性，和effect 建立关系

    const res = Reflect.get(target, key, receiver)
    if (isObject(res)) {
      // 如果是对象，需要递归处理代理
      return reactive(res)
    }
    return res; 
  },
  set(target, key, value, receiver) {
    // 找到属性 让对应的 effect 重新执行

    let oldValue = target[key]

    const result = Reflect.set(target, key, value, receiver)

    if (oldValue !== value) {
      // 值发生变更，触发更新
      trigger(target, key, value, oldValue)
    }

    return result
  }
}

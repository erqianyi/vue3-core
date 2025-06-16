import { ReactiveEffect } from './effect';
import { isFunction } from '@vue/shared';
import { trackRefValue, triggerRefValue } from './ref';

class ComputedRefImpl {
  public _value;
  public effect;
  constructor(getter, public setter) {
    // 需要创建一个effect来管理当前计算属性的dirty属性
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {
        // 计算属性依赖的值变化了，应该触发渲染effect重新执行
        triggerRefValue(this)
      }
    )
  }

  get value() { // 让计算属性收集对应的effect
    if (this.effect.dirty) {
      this._value= this.effect._value
      // 如果当前在effect中访问了计算属性，那么计算属性就会收集到effect
      trackRefValue(this)
    }
    return this._value;
  }
  set value(v) {
    this.setter(v)
  }
}

export function computed(getterOrOptions) {
  const onlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {}
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}
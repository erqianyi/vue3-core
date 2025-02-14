import { activeEffect, trackEffect, triggerEffects } from './effect';
import { toReactive } from "./reactive";
import { createDep } from './reactiveEffect';

export function ref(value) {
  return createRef(value);
}

function createRef(value) {
  return new RefImpl(value);
}

class RefImpl {
  public __v_isRef = true; // 标识是否是ref对象
  public _value;
  public dep; // 依赖
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }
  get value() {
    trackRefValue(this); // 收集依赖
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue; // 更新原始值
      this._value = newValue;
      triggerRefValue(this); // 触发依赖
    }
  }
}

function trackRefValue(ref) {
  if (activeEffect) {
    trackEffect(activeEffect, (ref.dep = createDep(() => ref.dep = undefined, "undefined")))
  }
}

function triggerRefValue(ref) {
  const dep = ref.dep;
  if (dep) {
    triggerEffects(dep)
  }
}
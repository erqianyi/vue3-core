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

export function trackRefValue(ref) {
  if (activeEffect) {
    trackEffect(activeEffect, (ref.dep = createDep(() => ref.dep = undefined, "undefined")))
  }
}

export function triggerRefValue(ref) {
  const dep = ref.dep;
  if (dep) {
    triggerEffects(dep)
  }
}

// toRef 和 toRefs
class ObjectRefImpl {
  public __v_isRef = true;
  constructor(public object, public key) {}
  get value() {
    return this.object[this.key];
  }
  set value(newValue) {
    this.object[this.key] = newValue;
  }
}
export function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}
export function toRefs(object) {
  const res = {};
  for (const key in object) {
    // 挨个属性调用toRef，存入对象返回
    res[key] = toRef(object, key);
  }
  return res;
}

export function proxyRefs(objectWidthRef) {
  return new Proxy(objectWidthRef, {
    get(target, key, receiver) {
      const r = Reflect.get(target, key, receiver);
      return r.__v_isRef ? r.value : r;
    },
    set(target, key, newValue, receiver) {
      const oldValue = target[key];
      if (oldValue.__v_isRef) {
        oldValue.value = newValue; // 如果是ref，则修改ref.value
        return true;
      } else {
        return Reflect.set(target, key, newValue, receiver);
      }
    }
  })
}
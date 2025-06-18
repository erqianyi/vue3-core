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
    trackEffect(activeEffect, (ref.dep = ref.dep || createDep(() => ref.dep = undefined, "undefined")))
  }
}

export function triggerRefValue(ref) {
  const dep = ref.dep;
  if (dep) {
    triggerEffects(dep)
  }
}

class ObjectRefImpl {
  public __v_isRef = true; // 标识是否是ref对象
  constructor(public _object, public _key) {
  }
  get value() {
    return this._object[this._key];
  }
  set value(newValue) {
    this._object[this._key] = newValue;
  }
}

export function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}

export function toRefs(object) {
  const res = {};
  for (const key in object) {
    res[key] = toRef(object, key);
  }
  return res;
}

export function proxyRefs(object) {
  return new Proxy(object, {
    get(target, key, receiver) {
      let r = Reflect.get(target, key, receiver);
      return r.__v_isRef ? r.value : r;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      if (oldValue.__v_isRef) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    }
  })
}

export function isRef(value) {
  return !!(value && value.__v_isRef)
}
import { activeEffect, effect, trackEffect, triggerEffects } from './effect';

function createDep(cleanUp, key) {
  const dep = new Map() as any;
  dep.cleanUp = cleanUp;
  dep.name = key;
  return dep;
}

const targetMap = new WeakMap(); // 存储依赖收集的关系
export function track(target, key) {
  // activeEffect 有这个属性，说明这个key是在effect中使用的，没有就说明是在effect外使用的
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      // 如果不存在，就创建一个
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(
        key, 
        (dep = createDep(() => depsMap.delete(key), key)) // 后面用于清理不需要的属性
      )
    }

    trackEffect(activeEffect, dep); // 将当前effect添加到dep（映射表）中，后续可根据值的变化出发此dep中的effect

  }
}

export function trigger(target, key, value, oldValue) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return // 找不到对象，直接返回
  const dep = depsMap.get(key)
  if (dep){
    triggerEffects(dep)
  }
}

// 依赖存储数据结构
// Map: {obj: {属性: Map: { effect, effect, effect }}}
// {
//   {name: 'xx', age: 18}: {
//     name: {effect},
//     age: {effect, effect}
//   }
// }

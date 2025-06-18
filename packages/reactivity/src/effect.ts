import { DirtyLevels } from './constants';

export let activeEffect;

function preCleanEffect(effect) {
  effect._depsLength = 0;
  effect._trackId++; // 每次执行id 都是+1，如果当前同一个effect执行，id就是一样的
}
function postCleanEffect(effect) {
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect) // 删除映射表中对应的effect
    }
    effect.deps.length = effect._depsLength; // 更新依赖列表的长度
  }
}

export class ReactiveEffect {
  _trackId = 0; // 用于记录当前effect执行了几次
  deps = [];
  _depsLength = 0;
  _running = 0;

  _dirtyLevel = DirtyLevels.Dirty;

  public active = true; // 创建的 effect 默认是响应式的
  /**
   * 
   * @param fn 用户编写的函数
   * @param scheduler 如果fn中依赖的数据发生变化后，需要重新调用的函数
   */
  constructor(public fn, public scheduler) {}

  public get dirty() {
    return this._dirtyLevel === DirtyLevels.Dirty;
  }
  public set dirty(v) {
    this._dirtyLevel = v ? DirtyLevels.Dirty : DirtyLevels.NoDirty;
  }


  run() {
    this._dirtyLevel = DirtyLevels.NoDirty; // 每次运行后，effect变为no_dirty
    // 让fn执行
    if (!this.active) {
      return this.fn(); // 如果不是响应式的，直接执行
    }
    // 如果是响应式的，需要让fn执行的时候，收集依赖
    const lastEffect = activeEffect;
    try {
      activeEffect = this;
      // effect执行前，需要将上一次的依赖清空
      preCleanEffect(this);
      this._running++;
      return this.fn();
    } finally {
      this._running--;
      // 清除后面剩余不用的effect（如果有）
      postCleanEffect(this);
      activeEffect = lastEffect;
    }
  }
  stop() {
    if (this.active) {
      // 停止effect
      this.active = false;
      preCleanEffect(this);
      postCleanEffect(this);
    }
  }
}
export function effect(fn, options?) {
  // 创建一个响应式effect 数据变化后可以重新执行

  // 创建一个effect，只要依赖的属性变化了 就要执行回调
  const _effect = new ReactiveEffect(fn, () => {
    // scheduler 调度器
    _effect.run();
  });
  _effect.run();

  if (options) {
    Object.assign(_effect, options); // 将用户传递的覆盖内置的
  }

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;

  return runner;
}

function cleanDepEffect(dep, effect) {
  dep.delete(effect);
  if (dep.size === 0) {
    dep.cleanUp()
  }
}
// 1. _trackId 用于记录执行次数，防止一个属性在当前effect中多次依赖收集，只收集一次
// 2. 拿到上一次依赖的最后一个盒这次的比较
export function trackEffect(effect, dep) {
  // 需要重新收集依赖，移除不需要的
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId);
  }

  const oldDep = effect.deps[effect._depsLength];
  if (oldDep !== dep) {
    if (oldDep) {
      // 删除老的
      cleanDepEffect(oldDep, effect);
    }
    // 换成新的
    effect.deps[effect._depsLength++] = dep;
  } else {
    effect._depsLength++;
  }
}

export function triggerEffects(dep) {
  for(const effect of dep.keys()) {

    // 当前这个值是不脏的，但是触发更新需要将值变为脏值
    if(effect._dirtyLevel < DirtyLevels.Dirty) {
      effect._dirtyLevel = DirtyLevels.Dirty;
    }

    if (!effect._running) { // 防止重复执行
      if (effect.scheduler) effect.scheduler();
    }
  }
}
export let activeEffect;
class ReactiveEffect {
  _trackId = 0; // 用于记录当前effect执行了几次
  deps = [];
  _depsLength = 0;


  public active = true; // 创建的 effect 默认是响应式的
  /**
   * 
   * @param fn 用户编写的函数
   * @param scheduler 如果fn中依赖的数据发生变化后，需要重新调用的函数
   */
  constructor(public fn, public scheduler) {}
  run() {
    // 让fn执行
    if (!this.active) {
      return this.fn(); // 如果不是响应式的，直接执行
    }
    // 如果是响应式的，需要让fn执行的时候，收集依赖
    const lastEffect = activeEffect;
    try {
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = lastEffect;
    }
  }
  stop() {
    this.active = false; // TODO: 停止effect
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
}

export function trackEffect(effect, dep) {
  dep.set(effect, effect._trackId);
  // 让effect与dep关联起来
  effect.deps[effect._depsLength++] = dep;
}

export function triggerEffects(dep) {
  for(const effect of dep.keys()) {
    if (effect.scheduler) effect.scheduler();
  }
}
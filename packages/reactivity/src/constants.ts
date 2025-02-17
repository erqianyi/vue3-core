export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export enum DirtyLevels {
  Dirty = 4, // 脏值，需要重新计算
  NoDirty = 0 // 不脏，用上一次的返回结果
}
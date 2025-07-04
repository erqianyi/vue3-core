// 主要是对节点元素的属性操作，calss、 style、event
import patchAttr from './modules/patchAttr';
import patchClass from './modules/patchClass';
import patchEvent from './modules/patchEvent';
import patchStyle from './modules/patchStyle';
// diff
export default function patchProp(el, key, prevValue, nextValue) {

  if (key === 'class') {
    return patchClass(el, nextValue);
  } else if (key === 'style') {
    return patchStyle(el, prevValue, nextValue)
  } else if (/^on[^a-z]/.test(key)) {
    // 事件 onClick = () => invoker.value()
    return patchEvent(el, key, nextValue)
  } else {
    return patchAttr(el, key, nextValue)
  }
}
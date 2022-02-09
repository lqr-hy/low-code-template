import { computed, ref } from "vue"
export function useMouseDown (data, callBack) {
  //  记录最后点击的索引
  const selectIndex = ref(-1)

  // 最后选中的block
  const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value])

  // 获取点击的焦点
  const clearBlockFocus = () => {
    data.value.blocks.forEach((item) => {
      item.focus = false
    })
  }
  // 点击容器取消焦点 
  const contentMouseDown = () => {
    clearBlockFocus()
    selectIndex.value = -1 // 取消之后重置索引
  }
  // 组件获取焦点
  const blockMouseDown = (e, block, index) => {
    e.preventDefault()
    e.stopPropagation()
    // block.focus = true
    if (e.shiftKey) {
      if (focusData.value.focus.length <= 1) {
        block.focus = true // 当前只有一个节点被选中的时候，摁shift 键不会切换focus状态
      } else {
        block.focus = !block.focus
      }
    } else {
      if (!block.focus) {
        clearBlockFocus()
        block.focus = true
      }
    }
    selectIndex.value = index
    // 移动
    callBack(e)
  }
  // 获取选中的数据
  const focusData = computed(() => {
    let focus = []
    let unFocus = []
    data.value.blocks.forEach((block) => (block.focus ? focus : unFocus).push(block))
    return {
      focus,
      unFocus
    }
  })
  return {
    focusData,
    blockMouseDown,
    contentMouseDown,
    lastSelectBlock
  }
}
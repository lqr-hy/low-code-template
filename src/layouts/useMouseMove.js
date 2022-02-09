import { reactive } from "vue"

export function useMouseMove (focusData, lastSelectBlock, data) {
  let dragState = {
    stateY: 0,
    stateX: 0,
    stateLeft: null,
    stateTop: null
  }

  let markLine = reactive({
    y: null,
    x: null
  })

  // 移动
  const mouseDown = (e) => {
    const { width: lastBlockWidth, height: lastBlockHeight } = lastSelectBlock.value
    // 记录选中的位置
    dragState = {
      stateX: e.clientX,
      stateY: e.clientY, // 记录每一个选中的位置
      stateLeft: lastSelectBlock.value.left,
      stateTop: lastSelectBlock.value.top,
      statePro: focusData.value.focus.map(({ top, left }) => ({ top, left })),
      lines: (() => {
        // 获取未选中的
        const { unFocus } = focusData.value
        // 存储位置
        let lines = { x: [], y: [] }
        const container = { top: 0, left: 0, width: data.value.container.width, height: data.value.container.height }
        const linesArr = [...unFocus, container]
        linesArr.forEach((block) => {
          const { top, left, width, height } = block
          lines.y.push({ showTop: top, top: top }) // 顶对顶
          lines.y.push({ showTop: top, top: top - lastBlockWidth }) // 顶对低
          lines.y.push({ showTop: top + height / 2, top: top + height / 2 - lastBlockHeight / 2 }) // 中到中
          lines.y.push({ showTop: top + height, top: top + height }) // 底对顶
          lines.y.push({ showTop: top + height, top: top + height - lastBlockHeight }) // 底对底

          lines.x.push({ showLeft: left, left: left }) // 左对左
          lines.x.push({ showLeft: left + width, left: left + width }) // 右对左
          lines.x.push({ showLeft: left + width / 2, left: left + width / 2 - lastBlockWidth / 2 }) // 中到中
          lines.x.push({ showLeft: left + width, left: left + width - lastBlockWidth }) // 底对顶
          lines.x.push({ showLeft: left, left: left - lastBlockWidth }) // 左对右
        })
        return lines
      })()
    }
    document.addEventListener('mousemove', mouseMove)
    document.addEventListener('mouseup', mouseUp)
  }
  //  计算移动的位置
  const mouseMove = (e) => {
    let { clientX: moveX, clientY: moveY } = e
    // console.log(clientX)
    // 计算出距离container 容器位置
    let left = moveX - dragState.stateX + dragState.stateLeft
    let top = moveY - dragState.stateY + dragState.stateTop

    let y = null
    let x = null
    for (let index = 0; index < dragState.lines.y.length; index++) {
      const { top: lineTop, showTop } = dragState.lines.y[index] // 获取每一跟线
      if (Math.abs(lineTop - top) < 5) { // 如果小于5说明接近了
        y = showTop // 显示线的位置

        moveY = dragState.stateY - dragState.stateTop + lineTop // 容器距离顶部的距离

        break // 找到了就退出
      }
    }

    for (let index = 0; index < dragState.lines.x.length; index++) {
      const { left: lineLeft, showLeft } = dragState.lines.x[index] // 获取每一跟线
      if (Math.abs(lineLeft - left) < 5) { // 如果小于5说明接近了
        x = showLeft // 显示线的位置

        moveX = dragState.stateX - dragState.stateLeft + lineLeft // 容器距离顶部的距离

        break // 找到了就退出
      }
    }

    markLine.x = x
    markLine.y = y

    const durX = moveX - dragState.stateX
    const durY = moveY - dragState.stateY
    focusData.value.focus.forEach((block, index) => {
      block.top = dragState.statePro[index].top + durY
      block.left = dragState.statePro[index].left + durX
    })
  }

  const mouseUp = (e) => {
    // 清除事件
    document.removeEventListener('mousemove', mouseMove)
    document.removeEventListener('mouseup', mouseUp)
    markLine.x = null
    markLine.y = null
  }

  return {
    mouseDown,
    markLine
  }
}
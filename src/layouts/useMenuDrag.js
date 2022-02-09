export function useMenuDrag (containerRef, data) {
  let currentComponent = null
  const dragenter = (e) => {
    // h5 图标变化
    e.dataTransfer.dropEffect = 'move'
  }
  const dragover = (e) => {
    e.preventDefault()
  }
  const dragleave = (e) => {
    e.dataTransfer.dropEffect = 'none'
  }
  const drop = (e) => {
    let blocks = data.value.blocks
    data.value = {
      ...data.value,
      blocks: [
        ...blocks,
        {
          top: e.offsetY,
          left: e.offsetX,
          zIndex: 1,
          key: currentComponent.key,
          alignCenter: true // 松手的时候剧中
        }
      ]
    }
    currentComponent = null
  }
  const dragstart = (e, component) => {
    containerRef.value.addEventListener('dragenter', dragenter)
    containerRef.value.addEventListener('dragover', dragover)
    containerRef.value.addEventListener('dragleave', dragleave)
    containerRef.value.addEventListener('drop', drop)
    currentComponent = component
  }
  const dragend = () => {
    containerRef.value.removeEventListener('dragenter', dragenter)
    containerRef.value.removeEventListener('dragover', dragover)
    containerRef.value.removeEventListener('dragleave', dragleave)
    containerRef.value.removeEventListener('drop', drop)
  }
  return {
    dragstart,
    dragend
  }
}
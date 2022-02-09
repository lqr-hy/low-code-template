import { computed, defineComponent, inject, onMounted, ref } from 'vue'

export default defineComponent({
  props: {
    block: {
      type: Object
    }
  },
  setup (props) {
    const config = inject('registerConfig')
    // 根据key 拿到指定的 组件
    const component = config.componentMap[props.block.key]
    // 拿到指定的渲染函数
    const renderComponent = component.render()
    const blockRef = ref(null)
    onMounted(() => {
      // console.log(blockRef.value)
      const { offsetWidth, offsetHeight } = blockRef.value
      // 拖拽松手的时候渲染
      if (props.block.alignCenter) {
        props.block.left = props.block.left - offsetWidth / 2
        props.block.top = props.block.top - offsetHeight / 2 // 原则上派发事件
        props.block.alignCenter = false // 渲染后才剧中
      }
      props.block.width = offsetWidth
      props.block.height = offsetHeight
    })
    const blockStyle = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: `${props.block.zIndex}`
    }))
    return () => (
      <div style={blockStyle.value} class='editor-block' ref={blockRef}>
        {renderComponent}
      </div>
    )
  }
})

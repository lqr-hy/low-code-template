import deepcopy from 'deepcopy'
import { defineComponent, inject, computed } from 'vue'
import { useMenuDrag } from './useMenuDrag'

export default defineComponent({
  props: {
    containerRef: {
      type: Object
    },
    modelValue: {
      type: Object
    }
  },
  emits: ['update:modelValue'],
  setup (props, ctx) {
    const data = computed({
      get () {
        return props.modelValue
      },
      set (newValue) {
        ctx.emit('update:modelValue', deepcopy(newValue))
      }
    })
    const config = inject('registerConfig')
    const componentList = config.componentList
    const { dragstart, dragend } = useMenuDrag(props.containerRef, data)
    return () =>
      componentList.map((component) => (
        <div className='editor-left-item' draggable onDragstart={(e) => dragstart(e, component)} onDragend={dragend}>
          <span>{component.label}</span>
          <div>{component.preview()}</div>
        </div>
      ))
  }
})

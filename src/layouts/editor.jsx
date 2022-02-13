import { computed, defineComponent, nextTick, ref } from 'vue'
import './editor.scss'
import EditorBlock from './editor-block'
import EditorPreview from './editor-preview'
import deepcopy from 'deepcopy'
import { useMouseDown } from './useMouseDown'
import { useMouseMove } from './useMouseMove'
import { useCommand } from './useCommand'

export default defineComponent({
  props: {
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

    const containerRef = ref(null)

    const contentStyle = computed(() => ({
      width: data.value.container.width + 'px',
      height: data.value.container.height + 'px'
    }))
    // 获取焦点
    const { blockMouseDown, contentMouseDown, focusData, lastSelectBlock } = useMouseDown(data, (e) => {
      mouseDown(e)
    })
    // 移动   
    const { mouseDown, markLine } = useMouseMove(focusData, lastSelectBlock, data)

    const { commands } = useCommand(data)

    // 菜单栏
    const buttons = [
      {
        label: '撤销',
        icon: 'icon-back',
        handler: () => commands.undo()
      },
      {
        label: '前进',
        icon: 'icon-forward',
        handler: () => commands.redo()
      }
    ]

    return () => (
      <div class='editor'>
        <div class='editor-left'>
          <EditorPreview containerRef={containerRef} v-model={data.value} />
        </div>
        <div class='editor-right'>右边</div>
        <div class='editor-top'>
          {
            buttons.map((button) => {
              return <div class='editor-top-button' onClick={button.handler}>
                <i class={button.icon}></i>
                <span>{button.label}</span>
              </div>
            })
          }
        </div>
        <div class='editor-container'>
          {/* 负责产生滚动条 */}
          <div class='editor-container-canvas'>
            {/* 产生内容 */}
            <div
              class='editor-container-canvas_content'
              style={contentStyle.value}
              ref={containerRef}
              onMousedown={(e) => contentMouseDown()}
            >
              {data.value.blocks.map((block, index) => (
                <EditorBlock
                  class={block.focus ? 'editor-block-focus' : ''}
                  block={block}
                  onMousedown={(e) => blockMouseDown(e, block, index)}
                ></EditorBlock>
              ))}
              {
                markLine.x !== null && <div class='line-x' style={{ left: markLine.x + 'px' }} />
              }
              {
                markLine.y !== null && <div class='line-y' style={{ top: markLine.y + 'px' }} />
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
})

import deepcopy from "deepcopy"
import { events } from "./events"
import { onUnmounted } from 'vue'

export function useCommand (data) {
  const state = {
    current: -1, // 前进后退需要的索引
    queue: [], // 存储所有操作命令
    commands: {}, // 制作指令和执行功能的一个映射表 
    commandsArray: [], // 存储所有命令
    destroyArray: [] // 销毁列表
  }

  const registry = (command) => {
    state.commandsArray.push(command)
    state.commands[command.name] = () => {
      // 方便以后内部可以做其它事情
      const { redo, undo } = command.execute()
      redo()

      if (!command.pushQueue) { // 不需要放入队列
        return
      }
      let { queue, current } = state

      if (queue.length > 0) {
        // 获取还未撤回的操作 主要是放置在放置的过程中有撤回的操作
        queue = queue.slice(0, current + 1)
        state.queue = queue
      }

      // 保存指令的前进后退
      queue.push({ redo, undo })
      state.current = current + 1
    }
  }

  // 注册命令
  registry({
    name: 'redo',
    keyboard: 'ctrl + y',
    execute () {
      return {
        redo () {
          let item = state.queue[state.current + 1] // 找到当前的下一步
          if (item) {
            item.redo && item.redo()
            state.current++
          }
        }
      }
    }
  })
  registry({
    name: 'undo',
    keyboard: 'ctrl + z',
    execute () {
      return {
        redo () {
          if (state.current === -1) return // 没有可以撤销的
          let item = state.queue[state.current] // 找到当前的上一步
          if (item) {
            item.undo && item.undo()
            state.current--
          }
        }
      }
    }
  })

  registry({
    name: 'drag',
    pushQueue: true, // 用于标识  表示要推入队列
    init () { // 初始化操作 默认会执行
      this.before = null // 之前状态
      const start = () => { // 监控拖拽开始事件 保存状态
        this.before = deepcopy(data.value.blocks)
      }
      const end = () => { // 拖拽最后需要触发的指令
        state.commands.drag()
      }
      events.on('start', start)
      events.on('end', end)
      return () => {
        events.off('start', start)
        events.off('end', end)
      }
    },
    execute () {
      let before = this.before
      let after = data.value.blocks // 之后的状态
      return {
        redo () {
          data.value = { ...data.value, blocks: after }
        },
        undo () {
          data.value = { ...data.value, blocks: before }
        }
      }
    }
  });

  const keyboardEvent = (() => {
    const KeyCode = {
      90: 'z',
      89: 'y'
    }
    const onKeydown = (e) => {
      const { keyCode, ctrlKey } = e
      let keyArr = []
      if (ctrlKey) {
        keyArr.push('ctrl')
      }
      keyArr.push(KeyCode[keyCode])
      let keyStr = keyArr.join(' + ') // 组成快捷键
      state.commandsArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return // 没有键盘事件
        if (keyboard === keyStr) {
          state.commands[name]()
          e.preventDefault()
        }
      })
    }
    const init = () => { // 初始化事件
      window.addEventListener('keydown', onKeydown)
      return () => { // 销毁事件
        window.removeEventListener('keydown', onKeydown)
      }
    }
    return init
  })();

  ; (() => {
    // 监听键盘事件 
    state.destroyArray.push(keyboardEvent())
    state.commandsArray.forEach((command) => command.init && state.destroyArray.push(command.init()))
  })()

  onUnmounted(() => { // 清理绑定的事件
    state.destroyArray.forEach(fn => fn && fn())
  })

  return state
}
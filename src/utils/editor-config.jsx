import { ElButton, ElInput } from "element-plus"

function registerComponents () {
  const componentList = []
  const componentMap = {}
  return {
    componentList,
    componentMap,
    register: (component) => {
      componentList.push(component)
      componentMap[component.key] = component
    }
  }
}

export let registerConfig = registerComponents()
registerConfig.register({
  label: '文本',
  preview: () => '预览文本',
  render: () => '渲染文本',
  key: 'text'
})

registerConfig.register({
  label: '按钮',
  preview: () => <ElButton>按钮</ElButton>,
  render: () => <ElButton>按钮</ElButton>,
  key: 'button'
})

registerConfig.register({
  label: '输入框',
  preview: () => <ElInput />,
  render: () => <ElInput />,
  key: 'input'
})
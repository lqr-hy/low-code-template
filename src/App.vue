<template>
  <div class="app">
    <Editor v-model="state"></Editor>
  </div>
</template>
<script>
import { ref, provide } from 'vue'
import data from './data.json'
import Editor from './layouts/editor.jsx'
import { registerConfig } from './utils/editor-config.jsx'

export default {
  components: {
    Editor
  },
  setup() {
    const state = ref(data)
    provide('registerConfig', registerConfig)
    return {
      state
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
<template>
  <div class="rich-text-editor">
    <Toolbar
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
      style="border-bottom: 1px solid #ccc"
    />
    <Editor
      :defaultConfig="editorConfig"
      :mode="mode"
      v-model="valueHtml"
      @onCreated="handleCreated"
      @onChange="handleChange"
      :style="{ height: height, overflowY: 'hidden' }"
    />
  </div>
</template>

<script setup>
import { ref, shallowRef, onBeforeUnmount, watch, onMounted } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  },
  height: {
    type: String,
    default: '400px'
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('')

// 模式
const mode = ref('default')

// 初始化内容
onMounted(() => {
  console.log('RichTextEditor mounted, modelValue:', props.modelValue)
  valueHtml.value = props.modelValue || ''
})

// 工具栏配置 - 最简化配置
const toolbarConfig = {
  excludeKeys: [
    'insertVideo',
    'insertTable',
    'codeBlock',
    'fullScreen',
    'uploadImage'  // 暂时禁用图片上传，避免错误
  ]
}

// 编辑器配置 - 最简化配置
const editorConfig = {
  placeholder: props.placeholder,
  readOnly: props.readOnly,
  autoFocus: false,
  // 暂时移除图片上传配置，避免内部错误
  MENU_CONF: {}
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  try {
    editor.destroy()
  } catch (error) {
    console.error('编辑器销毁错误:', error)
  }
})

// 监听编辑器创建完成
const handleCreated = (editor) => {
  console.log('编辑器创建完成:', editor)
  editorRef.value = editor
  
  // 编辑器创建完成后，设置初始内容
  if (valueHtml.value) {
    console.log('设置编辑器初始内容:', valueHtml.value)
    try {
      // 清空编辑器后再设置内容，避免状态冲突
      editor.setHtml('')
      setTimeout(() => {
        editor.setHtml(valueHtml.value)
      }, 100)
    } catch (error) {
      console.error('设置编辑器内容错误:', error)
      editor.setHtml('')
    }
  }
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    console.log('modelValue changed:', val)
    const newVal = val || ''
    if (newVal !== valueHtml.value) {
      valueHtml.value = newVal
      // 如果编辑器已经创建，直接设置内容
      if (editorRef.value) {
        console.log('编辑器已存在，直接设置内容:', newVal)
        try {
          // 清空编辑器后再设置内容，避免状态冲突
          editorRef.value.setHtml('')
          setTimeout(() => {
            editorRef.value.setHtml(newVal)
          }, 100)
        } catch (error) {
          console.error('设置编辑器内容错误:', error)
          editorRef.value.setHtml('')
        }
      }
    }
  }
)

// 监听编辑器内容变化
const handleChange = (editor) => {
  try {
    const html = editor.getHtml()
    console.log('editor content changed:', html)
    valueHtml.value = html
    emit('update:modelValue', html)
    emit('change', html)
  } catch (error) {
    console.error('编辑器内容变化处理错误:', error)
  }
}
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.w-e-text-container) {
  min-height: v-bind(height) !important;
}

:deep(.w-e-toolbar) {
  border-bottom: 1px solid #ccc !important;
}

:deep(.w-e-text) {
  padding: 10px !important;
}
</style> 
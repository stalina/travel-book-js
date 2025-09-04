import vue from 'eslint-plugin-vue'
import ts from '@vue/eslint-config-typescript'

export default [
  {
    ignores: ['dist', 'node_modules']
  },
  ...vue.configs['flat/recommended'],
  ...ts()
]

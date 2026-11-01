import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  { ignores: ['dist/**', 'node_modules/**', 'public/**'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser }
    },
    rules: {
      // the older pages use single-word names like "Essay"; renaming them isn't worth the churn
      'vue/multi-word-component-names': 'off',
      // the site's original style (standard): unused function arguments are fine
      'no-unused-vars': ['error', { args: 'none' }],
      // pre-existing computed props that only return in some branches
      'vue/return-in-computed-property': 'warn'
    }
  },
  {
    files: ['scripts/**/*.cjs'],
    languageOptions: { sourceType: 'commonjs', globals: { ...globals.node } }
  }
]

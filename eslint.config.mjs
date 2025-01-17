// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  // ...tseslint.configs.strictTypeChecked,
  // ...tseslint.configs.stylisticTypeChecked,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    // languageOptions: {
    //   parserOptions: {
    //     project: true,
    //     projectService: true,
    //     tsconfigRootDir: import.meta.dirname,
    //   },
    // },
    ignores: ['build'],
    rules: {
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
    files: ['src/**/*.ts', 'src/**/*.tsx'],
  },
)

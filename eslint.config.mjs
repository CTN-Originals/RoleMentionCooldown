import { FlatCompat } from '@eslint/eslintrc'
import eslint from '@eslint/js'
import tsEslintPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import eslintImportPlugin from 'eslint-plugin-import'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: eslint.configs.recommended,
	allConfig: eslint.configs.all
})

const config = [
	{
		ignores: [
			// ...
		],
	},
	eslint.configs.recommended,
	tslint.configs.eslintRecommended,
	...tslint.configs.recommended,
	...compat.extends(''),
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
		languageOptions: {
			ecmaVersion: 5,
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json'
			},
			sourceType: 'script'
		},
		plugins: {
			'import': eslintImportPlugin,
			'@typescript-eslint': tsEslintPlugin,
		},
		rules: {
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/explicit-function-return-type': ['warn', {
				allowExpressions: true
			}],
			'import/prefer-default-export': 'off',
			indent: ['error', "tab"],
			'key-spacing': ['error', {
				multiLine: {
					beforeColon: false,
					afterColon: true
				},
				
				align: {
					beforeColon: false,
					afterColon: true,
					on: 'value'
				}
			}],
			'linebreak-style': ['error', 'unix'],
			quotes: ['error', 'single'],
			semi: ['error', 'never']
		}
	}
]

export default config
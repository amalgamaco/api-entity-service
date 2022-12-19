module.exports = {
	'env': {
		'browser': true,
		'es2021': true,
		'jest': true
	},
	'extends': [
		'airbnb-base',
		'plugin:@typescript-eslint/recommended',
		'plugin:jest/recommended',
	],
	'parser': '@typescript-eslint/parser',
	'plugins': [ '@typescript-eslint', 'jest' ],
	'parserOptions': {
		'ecmaVersion': 12,
		'sourceType': 'module'
	},
	'settings': {
		'import/parsers': {
			'@typescript-eslint/parser': [ '.ts' ]
		},
		'import/resolver': {
			'typescript': {
				'alwaysTryTypes': true,
				'project': './tsconfig.json'
			}
		},
		'react': {
			'version': 'detect'
		}
	},
	'overrides': [
		{
			'files': [ 'src/**/*.ts' ],
			'parserOptions': {
				'project': './tsconfig.json'
			},
			'excludedFiles': '*.js',
			'extends': [
				'plugin:@typescript-eslint/recommended-requiring-type-checking'
			],
			'rules': {
				'@typescript-eslint/no-unsafe-assignment': 'off'
			}
		},
		{
			'files': [ 'tests/**/*.ts' ],
			'parserOptions': {
				'project': './tsconfig.tests.json'
			},
			'excludedFiles': '*.js',
			'extends': [
				'plugin:@typescript-eslint/recommended-requiring-type-checking'
			],
			'rules': {
				'@typescript-eslint/no-unsafe-assignment': 'off',
				'@typescript-eslint/no-var-requires': 'off'
			}
		}
	],
	'ignorePatterns': [ 'node_modules/**/*', 'dist/**/*' ],
	'rules': {
		'import/extensions': [
			'error',
			'ignorePackages',
			{
				'js': 'never',
				'ts': 'never',
			}
		],
		'import/prefer-default-export': 'off',
		'import/no-dynamic-require': 0,
		'import/no-extraneous-dependencies': [
			'error',
			{ 'devDependencies': true }
		],
		'import/no-named-as-default': 'off',
		'no-tabs': [ 'error', { allowIndentationTabs: true } ],
		'indent': [ 'error', 'tab' ],
		'comma-dangle': [ 'error', 'never' ],
		'space-in-parens': [ 'error', 'always' ],
		'array-bracket-spacing': [ 'error', 'always' ],
		'no-underscore-dangle': [
			'error',
			{ 'allowAfterThis': true }
		],
		'computed-property-spacing': [ 'error', 'always' ],
		'quote-props': [ 'error', 'consistent' ],
		'prefer-const': 'off',
		'no-param-reassign': 'off',
		'function-paren-newline': 'off',
		'arrow-parens': [
			2,
			'as-needed',
			{ 'requireForBlockBody': true }
		],
		'lines-between-class-members': [
			'error',
			'always',
			{ 'exceptAfterSingleLine': true }
		],
		// Typescript
		'no-shadow': 'off',
		'@typescript-eslint/no-shadow': [ 'error' ],
		'no-use-before-define': 'off',
		'@typescript-eslint/no-use-before-define': [ 'error' ],
		'@typescript-eslint/type-annotation-spacing': [
			'error',
			{
				before: false,
				after: true,
				overrides: { arrow: { before: true, after: true } }
			}
		],
		'@typescript-eslint/no-unsafe-assignment': 'off',
		// Jest
		'jest/expect-expect': [
			'error',
			{ assertFunctionNames: [ 'expect' ] }
		],
		'jest/no-disabled-tests': 'error',
		'jest/no-focused-tests': 'error',
		'jest/no-identical-title': 'error',
		'jest/prefer-to-have-length': 'error',
		'jest/valid-expect': 'error'
	}
};

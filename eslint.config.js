// @ts-check
/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['src/shared/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@pages/*', '@widgets/*', '@features/*', '@entities/*'],
            message: 'shared/ NO puede importar de capas superiores' }
        ]
      }]
    }
  },
  {
    files: ['src/entities/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@pages/*', '@widgets/*', '@features/*'],
            message: 'entities/ solo puede importar de @shared/*' }
        ]
      }]
    }
  },
  {
    files: ['src/features/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@pages/*', '@widgets/*'],
            message: 'features/ solo puede importar de @entities/* y @shared/*' }
        ]
      }]
    }
  },
  {
    files: ['src/widgets/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@pages/*'],
            message: 'widgets/ NO puede importar de @pages/*' }
        ]
      }]
    }
  },
  // Enforce public API usage (no deep imports into slices)
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-imports': ['warn', {
        patterns: [
          { group: ['@pages/*/*/*'], message: 'Importa solo desde la public API: @pages/nombre' },
          { group: ['@widgets/*/*/*'], message: 'Importa solo desde la public API: @widgets/nombre' },
          { group: ['@features/*/*/*'], message: 'Importa solo desde la public API: @features/nombre' },
          { group: ['@entities/*/*/*'], message: 'Importa solo desde la public API: @entities/nombre' },
        ]
      }]
    }
  },
];

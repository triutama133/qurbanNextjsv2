import next from 'eslint-plugin-next';

export default [
  {
    plugins: { next },
    rules: {
      ...next.configs['core-web-vitals'].rules,
    },
  },
];

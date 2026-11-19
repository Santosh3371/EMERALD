const path = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  root: __dirname,
  base: '/concepts-lab/',
  build: {
    outDir: path.resolve(__dirname, '../frontend/concepts-lab'),
    emptyOutDir: true
  }
});

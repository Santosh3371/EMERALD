const path = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  root: __dirname,
  base: '/concepts-lab/',
  plugins: [{
    name: 'normalize-built-html-line-endings',
    enforce: 'post',
    generateBundle(_, bundle) {
      const indexHtml = bundle['index.html'];
      if (indexHtml && indexHtml.type === 'asset') {
        const source = typeof indexHtml.source === 'string'
          ? indexHtml.source
          : Buffer.from(indexHtml.source).toString('utf8');
        indexHtml.source = source.replace(/\r\n?/g, '\n');
      }
    }
  }],
  build: {
    outDir: path.resolve(__dirname, '../frontend/concepts-lab'),
    emptyOutDir: true
  }
});

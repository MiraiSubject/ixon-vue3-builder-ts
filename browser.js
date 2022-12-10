const fs = require('fs');
const path = require('path');
const { build, normalizePath } = require('vite');
const vue = require('@vitejs/plugin-vue');
const {
  getRootDir,
  pascalCase,
  cleanDir,
  watchInputDir,
  writeDemoFile,
  copyAssets,
  watchAssets,
} = require('@ixon-cdk/core');

async function _build(inputFile, outputFile, tag, assets, production, watch) {
  const inputDir = path.dirname(path.join(getRootDir(), inputFile));
  const outputDir = path.dirname(path.join(getRootDir(), outputFile));

  // temporary entry file
  const date = new Date().getTime();
  const entryFileName = path.join(__dirname, `__temp_entry-${tag}-${date}.js`);
  const componentStatic = pascalCase(tag);
  const relativeInputPath = path.relative(
    path.dirname(entryFileName),
    path.join(getRootDir(), inputFile),
  );
  const entryFileContent = `import { defineCustomElement } from 'vue';\nimport ${componentStatic} from '${normalizePath(relativeInputPath)}';\ncustomElements.define('${tag}', defineCustomElement(${componentStatic}));\n`;
  fs.writeFileSync(entryFileName, entryFileContent, {
    encoding: 'utf8',
    flag: 'w',
  });

  cleanDir(outputDir);
  writeDemoFile(tag, outputDir, outputFile);

  const config = {
    root: getRootDir(),
    mode: production ? 'production' : 'development',
    build: {
      lib: {
        entry: entryFileName,
        formats: ['iife'],
        name: 'app',
        fileName: () => `${tag}.min.js`,
      },
      sourcemap: true,
      outDir: outputDir,
      emptyOutDir: false,
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
    write: true,
    plugins: [vue({ customElement: true, isProduction: production })],
  };

  // build
  process.on('uncaughtException', () => {
    // NOP: builder will show an error
  });

  if (!watch) {
    try {
      await buildTS(config);
      copyAssets(assets, inputDir, outputDir);
      fs.unlinkSync(entryFileName);
    } catch (e) {
      // NOP: builder will show an error
    }
  }

  // watch source files
  if (watch) {
    watchAssets(assets, inputDir, outputDir);
    await watchInputDir(inputDir, (isAsset) => {
      if (isAsset) {
        // do nothing
      } else {
        buildTS(config);
      }
    });
    process.on('SIGINT', () => {
      fs.unlinkSync(entryFileName);
      process.exit(1);
    });
  }
}

async function buildTS(config) {
  console.log("Type checking...");
  const child = require('child_process').spawn('vue-tsc --noEmit', { shell: true, stdio: 'inherit' });
  child.on('exit', async (code) => {
    if (code === 0) {
      await build(config);
    }
  })
}

module.exports = function runBuild(
  inputFile,
  outputFile,
  tag,
  assets,
  production,
  watch = false,
) {
  return _build(inputFile, outputFile, tag, assets, production, watch);
};

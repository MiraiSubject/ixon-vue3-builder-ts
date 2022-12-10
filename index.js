const fs = require('fs');
const path = require('path');
const isPotentialCustomElementName = require('is-potential-custom-element-name');
const { getArgv, getRootDir, logErrorMessage } = require('@ixon-cdk/core');

function main() {
  const argv = getArgv();
  const buildTarget = argv._[0];
  const tag = argv._[1];
  const { input } = argv;
  const output = argv.output || 'dist/bundle/main.min.js';
  const assets = JSON.parse(argv.assets || '[]');
  const watch = !!argv.watch;

  if (!input) {
    logErrorMessage('Must supply an input file, relative to the workspace root.');
    process.exit(1);
  }

  if (!fs.existsSync(path.join(getRootDir(), input))) {
    logErrorMessage(`Input file '${input}' does not exist.`);
    process.exit(1);
  }

  if (!isPotentialCustomElementName(tag)) {
    logErrorMessage(
      `Custom element name '${tag}' is invalid. See https://html.spec.whatwg.org/multipage/custom-elements.html#prod-potentialcustomelementname`,
    );
    process.exit(1);
  }

  if (buildTarget === 'browser') {
    require('./browser')(input, output, tag, assets, process.env.NODE_ENV ?? false, watch);
  }
}

main();

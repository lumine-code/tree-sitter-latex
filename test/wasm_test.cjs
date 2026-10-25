const path = require('node:path');
const { before } = require('node:test');
const { Parser, Language } = require('web-tree-sitter');
let language;

before(async () => {
  await Parser.init();
  language = await Language.load(
    path.join(__dirname, '../tree-sitter-latex.wasm'),
  );
});

require('./hyperlinks.cjs')(() => {
  const parser = new Parser();
  parser.setLanguage(language);
  return parser;
});

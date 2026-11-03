const assert = require('node:assert/strict');
const { test } = require('node:test');

module.exports = function registerTests(create) {
  test('keeps brackets and hashes inside complete file paths', t => {
    const parser = create();
    t.after(() => parser.delete?.());
    for (const path of [
      '../assets/sofi/[r] supps-4.png',
      'left[.png',
      'right].png',
      '#diagram.png',
      '#1.png',
      '../assets/[r] #12.png',
    ]) {
      const options = '[width=\\textwidth,keepaspectratio]';
      const source = `\\includegraphics${options}{${path}}\n\\textbf{Next}`;
      const tree = parser.parse(source);
      t.after(() => tree.delete?.());
      assert.equal(tree.rootNode.hasError, false, source);
      const includes = tree.rootNode.descendantsOfType('graphics_include');
      assert.equal(includes.length, 1, source);
      const node = includes[0]
        .childForFieldName('path')
        .childForFieldName('path');
      assert.deepEqual(
        [node.text, node.startIndex, node.endIndex],
        [path, source.indexOf(path), source.indexOf(path) + path.length],
        source,
      );
      assert.equal(includes[0].childForFieldName('options').text, options);
      assert.equal(tree.rootNode.namedChildren.at(-1).text, '\\textbf{Next}');
      assert.equal(tree.rootNode.descendantsOfType('placeholder').length, 0);
    }
  });

  test('keeps bibliography separators and glob groups outside path text', t => {
    const parser = create();
    t.after(() => parser.delete?.());
    const paths = ['refs/[archive]#1.bib', 'refs/#2].bib'];
    const pattern = 'refs/[archive]#1.{bib,json}';
    const source = `\\bibliography{${paths.join(',')}}\n\\addbibresource[glob]{${pattern}}\n\\textbf{Next}`;
    const tree = parser.parse(source);
    t.after(() => tree.delete?.());
    assert.equal(tree.rootNode.hasError, false);
    assert.deepEqual(
      tree.rootNode.descendantsOfType('path').map(node => node.text),
      paths,
    );
    assert.equal(
      tree.rootNode.descendantsOfType('glob_pattern')[0].text,
      pattern,
    );
    assert.equal(tree.rootNode.namedChildren.at(-1).text, '\\textbf{Next}');
  });
};

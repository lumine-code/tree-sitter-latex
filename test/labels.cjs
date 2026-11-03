const assert = require('node:assert/strict');
const { test } = require('node:test');

module.exports = function registerTests(create) {
  test('keeps macro label placeholders inside complete label nodes', t => {
    const parser = create();
    t.after(() => parser.delete?.());
    for (const [source, expected] of [
      [String.raw`\newcommand{\labele}[1]{\label{e:#1}}`, ['e:#1']],
      [String.raw`\ref{e:#1}`, ['e:#1']],
      [String.raw`\ref{#1}`, ['#1']],
      [String.raw`\ref{prefix##1#2_suffix}`, ['prefix##1#2_suffix']],
      [
        String.raw`\cref{e:#1,e:##2,plain_label}`,
        ['e:#1', 'e:##2', 'plain_label'],
      ],
      [String.raw`\crefrange{e:#1}{e:#2}`, ['e:#1', 'e:#2']],
      [String.raw`\newlabel{e:#1}{{1}{2}}`, ['e:#1']],
      [String.raw`\label{plain_underscore:1}`, ['plain_underscore:1']],
      [String.raw`\ref{ e:#1 }`, ['e:#1']],
    ]) {
      const tree = parser.parse(source);
      t.after(() => tree.delete?.());
      assert.equal(tree.rootNode.hasError, false, source);
      const labels = tree.rootNode.descendantsOfType('label');
      assert.deepEqual(
        labels.map(node => node.text),
        expected,
        source,
      );
      for (const label of labels) {
        assert.deepEqual(
          label.descendantsOfType('placeholder').map(node => node.text),
          label.text.match(/#+\d/g) ?? [],
          source,
        );
        assert.equal(label.parent.type.startsWith('curly_group_label'), true);
      }
    }
  });

  test('does not merge label fragments across whitespace or invalid hashes', t => {
    const parser = create();
    t.after(() => parser.delete?.());
    for (const source of [
      String.raw`\label{prefix #1}`,
      String.raw`\label{#1 suffix}`,
      String.raw`\label{plain label}`,
      '\\label{prefix% comment\n#1}',
      String.raw`\label{prefix#suffix}`,
      String.raw`\label{prefix#}`,
      String.raw`\label{prefix[#1]}`,
    ]) {
      const tree = parser.parse(source + String.raw`\textbf{After}`);
      t.after(() => tree.delete?.());
      assert.equal(tree.rootNode.hasError, true, source);
      for (const label of tree.rootNode.descendantsOfType('label')) {
        assert.doesNotMatch(label.text, /\s|\[|\]/, source);
      }
      assert.equal(
        tree.rootNode.namedChildren.at(-1).text,
        String.raw`\textbf{After}`,
      );
    }
  });
};

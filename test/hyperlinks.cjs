const assert = require('node:assert/strict');
const { test } = require('node:test');

module.exports = function registerTests(create) {
  test('keeps URI destinations separate from commands, options and labels', t => {
    const parser = create();
    t.after(() => parser.delete?.());
    const cases = [
      [
        String.raw`\url{https://example.com/path}`,
        'https://example.com/path',
        null,
      ],
      [
        String.raw`\href[page=2,pdfnewwindow=true]{https://example.com/manual.pdf}{Visible title}`,
        'https://example.com/manual.pdf',
        '[page=2,pdfnewwindow=true]',
      ],
      [
        String.raw`\href{https://example.com/?filter[name]=value}{A \textbf{formatted} label}`,
        'https://example.com/?filter[name]=value',
        null,
      ],
      [
        String.raw`\url{https://[2001:db8::1]:8080/path?q=[value]}`,
        'https://[2001:db8::1]:8080/path?q=[value]',
        null,
      ],
      [
        String.raw`\href{https://example.com/%7Bitem%7D?q=one\&next=100\%\#part}{Label}`,
        String.raw`https://example.com/%7Bitem%7D?q=one\&next=100\%\#part`,
        null,
      ],
      [
        String.raw`\href{mailto:reader@example.com}{Email}`,
        'mailto:reader@example.com',
        null,
      ],
    ];
    for (const [source, expected, options] of cases) {
      const tree = parser.parse(source);
      t.after(() => tree.delete?.());
      assert.equal(tree.rootNode.hasError, false, source);
      const links = tree.rootNode.descendantsOfType('hyperlink');
      assert.equal(links.length, 1, source);
      const uri = links[0].childForFieldName('uri').childForFieldName('uri');
      assert.deepEqual(
        [uri.text, uri.startIndex, uri.endIndex],
        [
          expected,
          source.indexOf(expected),
          source.indexOf(expected) + expected.length,
        ],
        source,
      );
      assert.equal(
        links[0].childForFieldName('options')?.text ?? null,
        options,
      );
    }
  });

  test('does not interpret commands in comments or nolinkurl as hyperlink nodes', t => {
    const parser = create();
    t.after(() => parser.delete?.());
    for (const source of [
      String.raw`% \href{https://example.com/path}{Comment label}`,
      String.raw`\nolinkurl{https://example.com/path}`,
      '\\iffalse\n\\url{https://example.com/path}\n\\fi',
    ]) {
      const tree = parser.parse(source);
      t.after(() => tree.delete?.());
      assert.equal(tree.rootNode.hasError, false, source);
      assert.equal(
        tree.rootNode.descendantsOfType('hyperlink').length,
        0,
        source,
      );
      assert.equal(tree.rootNode.descendantsOfType('uri').length, 0, source);
    }
  });
};

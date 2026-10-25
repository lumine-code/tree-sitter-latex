# tree-sitter-latex

A Tree-sitter grammar for LaTeX documents.

Fork of [latex-lsp/tree-sitter-latex](https://github.com/latex-lsp/tree-sitter-latex).

The upstream grammar originated from the parser of the [texlab](https://github.com/latex-lsp/texlab) language server. It recognizes LaTeX document structure without trying to interpret arbitrary TeX macros or category codes.

## Features

- **Documents**: parses sections, environments, commands, math and comments.
- **Hyperlinks**: separates URL destinations from command names, optional href settings and visible labels.
- **Destinations**: retains square brackets in IPv6 hosts and query strings, percent-encoded braces and TeX escapes.
- **Bindings**: preserves the upstream language bindings and portable WebAssembly parser builds.

## Building

The repository tracks grammar sources and node metadata. Generate the parser before compiling bindings or packaging it; generated C and WebAssembly outputs stay outside Git.

```sh
npm ci --ignore-scripts
npm run generate
npm test
npm run test:wasm
npm pack --dry-run
```

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!

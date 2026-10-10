# tree-sitter-dottr

Tree-sitter grammar for [dottr](https://github.com/tkamucheka/dottr)
manifests (`*.dotfile`), with queries for highlighting, shell injection in
`shell` blocks, folds, indentation, text objects, locals, and tags.

## Use

The repository contains the generated parser, so editors build it without
the tree-sitter CLI. For Neovim, see the
[Neovim setup](https://github.com/tkamucheka/dottr/blob/main/docs/reference/neovim.md).

## Development

```
tree-sitter generate   # after editing grammar.js; commit the regenerated src/
tree-sitter test       # corpus and highlight tests
```

## Documentation

* [Grammar](https://github.com/tkamucheka/dottr/blob/main/docs/reference/grammar.md):
  the dottr grammar that this parser follows.
* [Neovim](https://github.com/tkamucheka/dottr/blob/main/docs/reference/neovim.md):
  editor setup, queries, and text objects.

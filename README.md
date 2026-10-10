# tree-sitter-dottr

Tree-sitter grammar for [dottr](https://github.com/tkamucheka/dottr)
manifests (`*.dotfile`). It provides highlighting, highlighting of the shell
scripts in `shell` blocks, folds, indentation, and text objects.

## Installation

### Neovim

Requirements: Neovim 0.12 or later and
[nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) on its
`main` branch, with its own requirements (`curl`, `tar`, the tree-sitter CLI,
and a C compiler).

With [gardener.nvim](https://github.com/tkamucheka/gardener.nvim) and
[lazy.nvim](https://github.com/folke/lazy.nvim):

```lua
{
  "tkamucheka/gardener.nvim",
  dependencies = { "nvim-treesitter/nvim-treesitter" },
  lazy = false,
  opts = {
    ensure_installed = { "bash", "zsh" },
    custom_parsers = {
      dottr = {
        install_info = {
          url = "https://github.com/tkamucheka/tree-sitter-dottr",
          queries = "queries",
        },
        filetypes = { "dottr" },
      },
    },
    manage_folds = true,
    manage_indent = true,
  },
}
```

gardener installs the parser when a manifest is first opened, together with
the `bash` and `zsh` parsers used for shell scripts, and starts highlighting,
folds, and indentation in manifests.

### Neovim without gardener

Register the parser with nvim-treesitter:

```lua
vim.api.nvim_create_autocmd("User", {
  pattern = "TSUpdate",
  callback = function()
    require("nvim-treesitter.parsers").dottr = {
      install_info = {
        url = "https://github.com/tkamucheka/tree-sitter-dottr",
        queries = "queries",
      },
    }
  end,
})
```

Install it with `:TSInstall dottr bash zsh`, and start highlighting, folds,
and indentation in `ftplugin/dottr.lua`:

```lua
vim.treesitter.start()
vim.wo[0][0].foldexpr = "v:lua.vim.treesitter.foldexpr()"
vim.wo[0][0].foldmethod = "expr"
vim.bo.indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
```

In either case, to use a local clone instead of the repository, replace `url`
with `path = "/path/to/tree-sitter-dottr"`; its queries are then linked
rather than copied.

### Other editors

The repository contains the generated parser in `src/`, so an editor that
builds tree-sitter grammars from source needs no generation step. The queries
are in `queries/`.

## Configuration

Map the file extension to the `dottr` filetype:

```lua
vim.filetype.add({ extension = { dotfile = "dottr" } })
```

and set the comment string, in `ftplugin/dottr.lua`:

```lua
vim.bo.commentstring = "# %s"
```

### Text objects

`queries/textobjects.scm` uses the capture names of
[nvim-treesitter-textobjects](https://github.com/nvim-treesitter/nvim-treesitter-textobjects),
which also work with
[mini.ai](https://github.com/echasnovski/mini.ai)'s `gen_spec.treesitter`.

| Capture | Outer | Inner |
|---------|-------|-------|
| `@function` | A unit | The statements of a block unit |
| `@block` | An `apply` or `shell` block | Its body; for `shell`, the script |
| `@conditional` | An `apply_if` or `apply_unless` block | The statements of a branch |
| `@assignment` | A `local` statement | Its value |
| `@parameter` | A unit name in `needs` | The same |
| `@statement`, `@comment`, `@string` | The node | |

## Queries

| Query | Provides |
|-------|----------|
| `highlights.scm` | Highlighting, with Neovim's standard capture names. |
| `injections.scm` | The text of a `shell` block as `zsh` for ` ```zsh ` and as `bash` otherwise, without the block's indentation. |
| `folds.scm` | Folds for units, `apply` blocks, `else` branches, and `shell` blocks. |
| `indents.scm` | Indentation; shell text keeps the indentation of the previous line. |
| `textobjects.scm` | Text objects (above). |
| `locals.scm`, `tags.scm` | Scopes, definitions, and references. |

## Development

```
tree-sitter generate   # after editing grammar.js; commit the regenerated src/
tree-sitter test       # corpus and highlight tests
```

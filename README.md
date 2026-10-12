# tree-sitter-dottr

A [tree-sitter](https://tree-sitter.github.io/) grammar for
[dottr](https://github.com/tkamucheka/dottr) manifests (`*.dotfile`), with
queries for:

* highlighting, including the scripts of `shell` blocks, highlighted as
  bash, zsh, or PowerShell;
* folds and indentation;
* text objects for units, blocks, conditionals, and variables.

Diagnostics, navigation, completion, and formatting are provided by the dottr
language server, `dottr-lsp`, which is installed with dottr.

## Requirements

* Neovim 0.12 or later
* [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter), `main`
  branch, with its requirements: `curl`, `tar`, the tree-sitter CLI, and a C
  compiler

## Installation

### With gardener.nvim

[gardener.nvim](https://github.com/tkamucheka/gardener.nvim) detects
manifests by their extension, installs the parser when a manifest is first
opened, and starts highlighting, folds, and indentation. With
[lazy.nvim](https://github.com/folke/lazy.nvim):

```lua
{
  "tkamucheka/gardener.nvim",
  dependencies = { "nvim-treesitter/nvim-treesitter" },
  lazy = false,
  opts = {
    ensure_installed = { "bash", "zsh", "powershell" },
    custom_parsers = {
      dottr = {
        install_info = {
          url = "https://github.com/tkamucheka/tree-sitter-dottr",
          queries = "queries",
        },
        filetypes = { "dottr" },
        extensions = { "dotfile" },
      },
    },
    manage_folds = true,
    manage_indent = true,
  },
}
```

The `bash`, `zsh`, and `powershell` parsers highlight the scripts of `shell`
blocks.

### Without gardener.nvim

Without gardener, the steps it performs are configured by hand. Map the file
extension to the `dottr` filetype:

```lua
vim.filetype.add({ extension = { dotfile = "dottr" } })
```

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

Install it with `:TSInstall dottr bash zsh powershell`, and start highlighting, folds,
and indentation in `ftplugin/dottr.lua`:

```lua
vim.treesitter.start()
vim.wo[0][0].foldexpr = "v:lua.vim.treesitter.foldexpr()"
vim.wo[0][0].foldmethod = "expr"
vim.bo.indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
```

To install from a local clone, replace `url` with
`path = "/path/to/tree-sitter-dottr"` in either configuration.

### Other editors

The repository includes the generated parser in `src/` and the queries in
`queries/`, so editors that build tree-sitter grammars from source need no
generation step.

## Configuration

Set the comment string in `ftplugin/dottr.lua`:

```lua
vim.bo.commentstring = "# %s"
```

### Text Objects

`queries/textobjects.scm` uses the capture names of
[nvim-treesitter-textobjects](https://github.com/nvim-treesitter/nvim-treesitter-textobjects),
which also work with the `gen_spec.treesitter` text objects of
[mini.ai](https://github.com/echasnovski/mini.ai).

| Capture | Outer | Inner |
|---------|-------|-------|
| `@function` | A unit | The statements of a block unit |
| `@block` | An `apply` or `shell` block | Its body; for `shell`, the script |
| `@conditional` | An `apply_if`, `apply_unless`, or `on` block | The statements of a branch or block |
| `@assignment` | A `local` statement | Its value |
| `@parameter` | A unit name in `needs` | The same |
| `@statement`, `@comment`, `@string` | The node | |

For example, with mini.ai:

```lua
local spec = require("mini.ai").gen_spec.treesitter
require("mini.ai").setup({
  custom_textobjects = {
    F = spec({ a = "@function.outer", i = "@function.inner" }),
    o = spec({ a = "@block.outer", i = "@block.inner" }),
    c = spec({ a = "@conditional.outer", i = "@conditional.inner" }),
  },
})
```

## Queries

| Query | Provides |
|-------|----------|
| `highlights.scm` | Highlighting, with Neovim's standard capture names. |
| `injections.scm` | Shell scripts, as `zsh` for ` ```zsh ` blocks, as `powershell` for ` ```pwsh ` and ` ```powershell ` blocks, and as `bash` otherwise, without the indentation of the block. |
| `folds.scm` | Folds for units, `apply` blocks, `else` branches, `on` blocks, and `shell` blocks. |
| `indents.scm` | Indentation; lines of a shell script keep the indentation of the previous line. |
| `textobjects.scm` | Text objects. |
| `locals.scm`, `tags.scm` | Scopes, definitions, and references. |

## Development

```
tree-sitter generate   # after editing grammar.js; commit the regenerated src/
tree-sitter test       # corpus and highlight tests
```

## License

MIT; see [LICENSE](LICENSE).

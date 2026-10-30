; Keywords

[
  "pkg"
  "unit"
  "systems"
  "link"
  "do"
  "end"
  "local"
  "check"
  "create"
  "apply"
  "shell"
] @keyword

"needs" @keyword.import

[
  "apply_if"
  "apply_unless"
  "else"
  "on"
] @keyword.conditional

(system) @constant.builtin

(predicate_kind) @type.builtin

; Units

(unit_declaration
  name: (_) @module)

(package_declaration
  name: (_) @module)

(package_statement
  name: (_) @module)

(link_statement
  source: (identifier) @variable
  target: (identifier) @variable)

(link_statement
  rules: (identifier) @variable)

(needs_statement
  dependency: (_) @module)

; Variables

(local_statement
  name: (identifier) @variable)

(check_statement
  variable: (identifier) @variable)

(create_statement
  variable: (identifier) @variable)

(apply_if_statement
  condition: (identifier) @variable)

(apply_unless_statement
  condition: (identifier) @variable)

; Strings

(local_statement
  value: (string) @string)

(escape_sequence) @string.escape

(interpolation
  [
    "@{"
    "}"
  ] @punctuation.special)

((reference) @variable
  (#not-match? @variable "^dottr[.]"))

((reference) @variable.builtin
  (#match? @variable.builtin "^dottr[.]"))

; Raw blocks

[
  (fence_open)
  (fence_close)
] @punctuation.delimiter

(info_string) @label

; Punctuation

"=" @operator

"," @punctuation.delimiter

; Neovim applies both captures; the tree-sitter CLI applies the last.
(comment) @spell

(comment) @comment

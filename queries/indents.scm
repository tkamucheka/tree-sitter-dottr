[
  (unit_declaration)
  (apply_statement)
  (apply_if_statement)
  (apply_unless_statement)
  (shell_block)
  (on_block)
] @indent.begin

[
  "end"
  "else"
] @indent.branch

"end" @indent.end

; Shell text keeps the indentation of the previous line, also inside a raw
; block that is not yet closed.
[
  (raw_block)
  (raw_content)
] @indent.auto

; Blocks whose `end` has not been typed yet are parsed as ERROR nodes, which
; do not preserve nesting. The error node and its last `do` or `else` each add
; one level, which covers one block nested in an unclosed unit.
(ERROR
  "do" @indent.begin)

(ERROR
  (else_clause) @indent.begin)

(ERROR
  "do") @indent.begin

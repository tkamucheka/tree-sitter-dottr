; Units

(unit_declaration) @function.outer

(unit_declaration
  body: (unit_body
    .
    (_)+ @function.inner))

; apply blocks and shell blocks

(apply_statement) @block.outer

(apply_statement
  body: (action_body
    .
    (_)+ @block.inner))

(shell_block) @block.outer

(shell_block
  script: (raw_block
    content: (raw_content) @block.inner))

; apply_if and apply_unless

[
  (apply_if_statement)
  (apply_unless_statement)
] @conditional.outer

(apply_if_statement
  consequence: (action_body
    .
    (_)+ @conditional.inner))

(apply_unless_statement
  consequence: (action_body
    .
    (_)+ @conditional.inner))

(else_clause
  body: (action_body
    .
    (_)+ @conditional.inner))

; on blocks

(on_block) @conditional.outer

(on_block
  body: (_
    .
    (_)+ @conditional.inner))

; Statements

(local_statement) @assignment.outer

(local_statement
  name: (_) @assignment.lhs
  value: (_) @assignment.inner @assignment.rhs)

(needs_statement
  dependency: (_) @parameter.inner @parameter.outer)

[
  (local_statement)
  (needs_statement)
  (package_statement)
  (link_statement)
  (check_statement)
  (create_statement)
  (apply_statement)
  (apply_if_statement)
  (apply_unless_statement)
  (shell_block)
  (on_block)
] @statement.outer

(comment) @comment.outer

(string) @string.outer

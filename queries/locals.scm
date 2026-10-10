; Variables are scoped to their unit.

(unit_declaration) @local.scope

(local_statement
  name: (identifier) @local.definition.var)

(check_statement
  variable: (identifier) @local.reference)

(create_statement
  variable: (identifier) @local.reference)

(apply_if_statement
  condition: (identifier) @local.reference)

(apply_unless_statement
  condition: (identifier) @local.reference)

((reference) @local.reference
  (#not-match? @local.reference "^dottr[.]"))

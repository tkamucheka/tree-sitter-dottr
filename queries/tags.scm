(unit_declaration
  name: (_) @name) @definition.module

(child_package
  name: (_) @name) @definition.module

(needs_statement
  dependency: (_) @name @reference.module)

(local_statement
  name: (identifier) @name) @definition.variable

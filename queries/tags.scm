(unit_declaration
  name: (_) @name) @definition.module

(package_declaration
  name: (_) @name) @definition.module

(package_statement
  name: (_) @name) @reference.module

(needs_statement
  dependency: (_) @name @reference.module)

(local_statement
  name: (identifier) @name) @definition.variable

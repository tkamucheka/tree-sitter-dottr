/**
 * @file Tree-sitter grammar for dottr manifests.
 *
 * The grammar follows docs/reference/grammar.md in the dottr repository. Line
 * structure (line ends, fences, and raw block lines) is handled by the
 * external scanner in src/scanner.c.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const KEYWORDS = [
  'pkg', 'unit', 'do', 'end', 'local', 'needs', 'check', 'create', 'apply',
  'apply_if', 'apply_unless', 'else', 'shell', 'command', 'file', 'directory',
  'on', 'link',
];

module.exports = grammar({
  name: 'dottr',

  externals: $ => [
    $._newline,
    $._end_of_input,
    $.fence_open,
    $.raw_line,
    $.fence_close,
    // An '@' in a string literal that is not followed by '{'.
    $._string_at,
    // Never produced; valid only during error recovery.
    $._error_sentinel,
  ],

  extras: $ => [/[ \t]/, $.comment],

  word: $ => $.identifier,

  reserved: {
    global: _ => KEYWORDS,
  },

  rules: {
    source_file: $ => repeat(choice(
      seq($._declaration, $._terminator),
      $._newline,
    )),

    _declaration: $ => choice(
      $.unit_declaration,
      $.package_declaration,
      alias($._on_declarations, $.on_block),
    ),

    // `on` blocks select their contents by system. They contain units at
    // top level, statements in a unit, and shell blocks in an action body;
    // each form is an on_block whose body is of the enclosing kind.
    _on_declarations: $ => seq(
      'on',
      $._systems,
      'do',
      $._newline,
      optional(field('body', $.unit_list)),
      'end',
    ),

    unit_list: $ => repeat1(choice(
      seq($._declaration, $._terminator),
      $._newline,
    )),

    _on_statements: $ => seq(
      'on',
      $._systems,
      'do',
      $._newline,
      optional(field('body', $.unit_body)),
      'end',
    ),

    _on_actions: $ => seq(
      'on',
      $._systems,
      'do',
      $._newline,
      optional(field('body', $.action_body)),
      'end',
    ),

    _systems: $ => seq(
      field('system', alias($.identifier, $.system)),
      repeat(seq(',', repeat($._newline), field('system', alias($.identifier, $.system)))),
    ),

    // A statement ends at a line end, or at the end of input on the last
    // line. The terminator belongs to the enclosing node, so that the node of
    // a statement ends at its last token.
    _terminator: $ => choice($._newline, $._end_of_input),

    unit_declaration: $ => seq(
      'unit',
      field('name', $._unit_name),
      'do',
      $._newline,
      optional(field('body', $.unit_body)),
      'end',
    ),

    package_declaration: $ => seq(
      'pkg',
      field('name', $._unit_name),
      repeat(seq(',', repeat($._newline), field('name', $._unit_name))),
    ),

    unit_body: $ => repeat1(choice(
      seq($._statement, $._terminator),
      $._newline,
    )),

    _statement: $ => choice(
      $.local_statement,
      $.needs_statement,
      $.package_statement,
      $.link_statement,
      $.check_statement,
      $.create_statement,
      $.apply_statement,
      $.apply_if_statement,
      $.apply_unless_statement,
      alias($._on_statements, $.on_block),
    ),

    local_statement: $ => seq(
      'local',
      field('name', $.identifier),
      '=',
      field('value', $.string),
    ),

    needs_statement: $ => seq(
      'needs',
      field('dependency', $._unit_name),
      repeat(seq(',', repeat($._newline), field('dependency', $._unit_name))),
    ),

    package_statement: $ => seq(
      'pkg',
      field('name', $._unit_name),
      repeat(seq(',', repeat($._newline), field('name', $._unit_name))),
    ),

    link_statement: $ => choice(
      seq('link', field('source', choice($.identifier, alias('tree', $.identifier))),
        field('target', $.identifier)),
      seq('link', 'tree', field('source', $.identifier),
        field('target', $.identifier),
        optional(seq('ignore', field('rules', $.identifier)))),
    ),

    check_statement: $ => seq(
      'check',
      field('kind', $.predicate_kind),
      field('variable', $.identifier),
    ),

    create_statement: $ => seq(
      'create',
      field('kind', alias('directory', $.predicate_kind)),
      field('variable', $.identifier),
    ),

    predicate_kind: _ => choice('command', 'file', 'directory'),

    apply_statement: $ => seq(
      'apply',
      'do',
      $._newline,
      optional(field('body', $.action_body)),
      'end',
    ),

    apply_if_statement: $ => seq(
      'apply_if',
      field('condition', $.identifier),
      'do',
      $._newline,
      optional(field('consequence', $.action_body)),
      optional(field('alternative', $.else_clause)),
      'end',
    ),

    else_clause: $ => seq(
      'else',
      $._newline,
      optional(field('body', $.action_body)),
    ),

    apply_unless_statement: $ => seq(
      'apply_unless',
      field('condition', $.identifier),
      'do',
      $._newline,
      optional(field('consequence', $.action_body)),
      'end',
    ),

    action_body: $ => repeat1(choice(
      seq(choice($.shell_block, alias($._on_actions, $.on_block)),
        $._terminator),
      $._newline,
    )),

    shell_block: $ => seq(
      'shell',
      'do',
      repeat1($._newline),
      field('script', $.raw_block),
      repeat1($._newline),
      'end',
    ),

    raw_block: $ => seq(
      field('open', $.fence_open),
      optional(field('info', $.info_string)),
      $._newline,
      optional(field('content', $.raw_content)),
      field('close', $.fence_close),
    ),

    info_string: _ => token.immediate(
      choice('sh', 'bash', 'zsh', 'pwsh', 'powershell'),
    ),

    raw_content: $ => repeat1($.raw_line),

    // A unit name in string form is non-empty and contains no interpolation.
    _unit_name: $ => choice($.identifier, alias($._name_string, $.string)),

    _name_string: $ => seq(
      '"',
      repeat1(choice($._string_text, $.escape_sequence)),
      token.immediate('"'),
    ),

    identifier: _ => /[A-Za-z_][A-Za-z0-9_]*/,

    string: $ => seq(
      '"',
      repeat(choice($._string_text, $.escape_sequence, $.interpolation)),
      token.immediate('"'),
    ),

    // '@{' always begins an interpolation; any other '@' is text.
    _string_text: $ => choice(
      $.string_content,
      alias($._string_at, $.string_content),
    ),

    // Precedence over comment: '#' inside a string literal is text.
    string_content: _ => token.immediate(prec(1, /[^"\\@\n]+/)),

    escape_sequence: _ => token.immediate(/\\["\\]/),

    interpolation: $ => seq(
      token.immediate('@{'),
      field('reference', $.reference),
      token.immediate('}'),
    ),

    reference: _ => token.immediate(
      /[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*/,
    ),

    comment: _ => token(seq('#', /[^\n]*/)),
  },
});

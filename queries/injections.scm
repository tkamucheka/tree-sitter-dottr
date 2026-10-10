; The lines of a raw block are injected as one document. Each raw_line
; excludes the margin of the block, so the shell parser receives the script
; that dottr executes.

((raw_block
  !info
  content: (raw_content
    .
    (raw_line)+ @injection.content))
  (#set! injection.language "bash"))

((raw_block
  info: (info_string) @_info
  content: (raw_content
    .
    (raw_line)+ @injection.content))
  (#any-of? @_info "sh" "bash")
  (#set! injection.language "bash"))

((raw_block
  info: (info_string) @_info
  content: (raw_content
    .
    (raw_line)+ @injection.content))
  (#eq? @_info "zsh")
  (#set! injection.language "zsh"))

((comment) @injection.content
  (#set! injection.language "comment"))

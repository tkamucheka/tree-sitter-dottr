/*
 * External scanner for the dottr tree-sitter grammar. It produces the tokens
 * that depend on line structure: line ends, the zero-width terminator at the
 * end of input, and the fences and lines of raw blocks. It also produces an
 * '@' in a string literal that does not begin an interpolation, which
 * requires looking past the end of the token.
 *
 * The margin of a raw block, the column of its opening fence, is recorded
 * when the fence is scanned and serialized with the parser state. Each raw
 * line starts after at most margin leading blanks, so its text is the text
 * that dottr passes to the shell after margin removal.
 */

#include "tree_sitter/parser.h"

#include <stdint.h>
#include <stdlib.h>
#include <string.h>

enum TokenType {
    NEWLINE,
    END_OF_INPUT,
    FENCE_OPEN,
    RAW_LINE,
    FENCE_CLOSE,
    STRING_AT,
    ERROR_SENTINEL,
};

typedef struct {
    uint32_t margin;
} Scanner;

static bool isBlank(int32_t c)
{
    return c == ' ' || c == '\t';
}

static void advance(TSLexer *lexer)
{
    lexer->advance(lexer, false);
}

static void skip(TSLexer *lexer)
{
    lexer->advance(lexer, true);
}

/* Consumes "\n" or "\r\n". Returns false if neither is next. */
static bool consumeLineEnd(TSLexer *lexer)
{
    if (lexer->lookahead == '\r') {
        advance(lexer);
    }
    if (lexer->lookahead == '\n') {
        advance(lexer);
        return true;
    }
    return false;
}

static bool consumeFence(TSLexer *lexer)
{
    for (int i = 0; i < 3; i++) {
        if (lexer->lookahead != '`') {
            return false;
        }
        advance(lexer);
    }
    return true;
}

/*
 * Scans one line of a raw block: either the closing fence or a raw line.
 * Called at the start of the line.
 */
static bool scanRawLine(Scanner *scanner, TSLexer *lexer,
                        const bool *validSymbols)
{
    if (lexer->eof(lexer)) {
        return false;
    }

    for (uint32_t i = 0; i < scanner->margin && isBlank(lexer->lookahead);
         i++) {
        skip(lexer);
    }

    while (isBlank(lexer->lookahead)) {
        advance(lexer);
    }

    if (lexer->lookahead == '`') {
        if (consumeFence(lexer)) {
            lexer->mark_end(lexer);
            while (isBlank(lexer->lookahead)) {
                advance(lexer);
            }
            if (validSymbols[FENCE_CLOSE] &&
                (lexer->eof(lexer) || lexer->lookahead == '\n' ||
                 lexer->lookahead == '\r')) {
                lexer->result_symbol = FENCE_CLOSE;
                return true;
            }
        }
    }

    if (!validSymbols[RAW_LINE]) {
        return false;
    }
    while (!lexer->eof(lexer) && lexer->lookahead != '\n') {
        advance(lexer);
    }
    if (!lexer->eof(lexer)) {
        advance(lexer);
    }
    lexer->mark_end(lexer);
    lexer->result_symbol = RAW_LINE;
    return true;
}

void *tree_sitter_dottr_external_scanner_create(void)
{
    Scanner *scanner = calloc(1, sizeof(Scanner));
    return scanner;
}

void tree_sitter_dottr_external_scanner_destroy(void *payload)
{
    free(payload);
}

unsigned tree_sitter_dottr_external_scanner_serialize(void *payload,
                                                      char *buffer)
{
    Scanner *scanner = payload;
    memcpy(buffer, &scanner->margin, sizeof scanner->margin);
    return sizeof scanner->margin;
}

void tree_sitter_dottr_external_scanner_deserialize(void *payload,
                                                    const char *buffer,
                                                    unsigned length)
{
    Scanner *scanner = payload;
    scanner->margin = 0;
    if (length == sizeof scanner->margin) {
        memcpy(&scanner->margin, buffer, sizeof scanner->margin);
    }
}

bool tree_sitter_dottr_external_scanner_scan(void *payload, TSLexer *lexer,
                                             const bool *validSymbols)
{
    Scanner *scanner = payload;

    /* During error recovery every symbol is valid; defer to the lexer. */
    if (validSymbols[ERROR_SENTINEL]) {
        return false;
    }

    /* Inside a string literal, before any whitespace is skipped. */
    if (validSymbols[STRING_AT] && lexer->lookahead == '@') {
        advance(lexer);
        lexer->mark_end(lexer);
        if (lexer->lookahead == '{') {
            return false;
        }
        lexer->result_symbol = STRING_AT;
        return true;
    }

    if (validSymbols[RAW_LINE] || validSymbols[FENCE_CLOSE]) {
        return scanRawLine(scanner, lexer, validSymbols);
    }

    while (isBlank(lexer->lookahead)) {
        skip(lexer);
    }

    if (validSymbols[NEWLINE] &&
        (lexer->lookahead == '\n' || lexer->lookahead == '\r')) {
        if (consumeLineEnd(lexer)) {
            lexer->mark_end(lexer);
            lexer->result_symbol = NEWLINE;
            return true;
        }
        return false;
    }

    if (validSymbols[END_OF_INPUT] && lexer->eof(lexer)) {
        lexer->mark_end(lexer);
        lexer->result_symbol = END_OF_INPUT;
        return true;
    }

    if (validSymbols[FENCE_OPEN] && lexer->lookahead == '`') {
        uint32_t column = lexer->get_column(lexer);
        if (consumeFence(lexer) && lexer->lookahead != '`') {
            scanner->margin = column;
            lexer->mark_end(lexer);
            lexer->result_symbol = FENCE_OPEN;
            return true;
        }
    }

    return false;
}

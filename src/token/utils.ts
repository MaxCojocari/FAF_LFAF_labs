const ESCAPED_QUOTE_MARKER = "$_$_$";
const ESCAPED_QUOTE_MARKER_REGEXP = new RegExp(`\\$_\\$_\\$`, "g");

const REGEXP_SPECIAL_CHARS = "$?|*.[]+()/".split("");
const REGEXP_SPECIAL_CHARS_REGEXP = new RegExp(
    `${REGEXP_SPECIAL_CHARS.map(c => "\\" + c).join("|")}`,
    "g"
);

export enum State { Parsing, String }

export type RawTokenDefinition = Array<[string, string]>;

export type CompiledTokenDefinition = Array<[string, RegExp]>;

export function parseTokenDefinition(tokenDefInput: string): RawTokenDefinition {
    const parsedTokenDef: RawTokenDefinition = [];

    let index = -1;
    let currentNode: string | undefined;
    let state: State = State.Parsing;
    let prevState: State | undefined;

    let buffer: string[] = [];

    while (index++ < tokenDefInput.length) {
        const char = tokenDefInput.charAt(index);
        buffer.push(char);

        if (state === State.String && char !== '"') {
            continue;
        }

        // if we consume a " that isn't preceded by a \, we're either
        // starting a string or terminating a string.
        if (char === '"') {
            if (tokenDefInput.charAt(index - 1) !== "\\") {
                if (state === State.String) {
                    state = prevState || State.Parsing;
                } else {
                    state = State.String;
                }
            }
        }

        if (char === "\n") buffer.pop();

        if (char === ":") {
            if (state === State.String) {
                continue;
            }

            const part = buffer.slice(0, buffer.length - 1).join("").trim();
            currentNode = part;
            buffer = [];
        }

        if (char === ";") {
            if (state === State.String || tokenDefInput.charAt(index - 1) === "\\") continue;

            buffer.pop();

            const part = buffer.join("").trim();

            if (!currentNode) {
                throw new Error("invalid token tokenDefInput");
            }

            parsedTokenDef.push([currentNode, part]);

            index += 1; // consume the ";"
            buffer = [];
        }
    }

    return parsedTokenDef;
}

function processRule(rawRule: string): RegExp {
    const ruleRegex = rawRule
        .replace(/\\"/g, ESCAPED_QUOTE_MARKER)
        .replace(/"[^"]+"/g, (substring) => {
            let replacement = substring
                .substring(1, substring.length - 1)
                .replace(REGEXP_SPECIAL_CHARS_REGEXP, char => "\\" + char);

            return replacement;
        })
        .replace(/[ ]*\|[ ]*/g, "|")
        .replace(ESCAPED_QUOTE_MARKER_REGEXP, '"');

    return new RegExp(`^(${ruleRegex})`);
}

export function compileTokenDefinition(tokenRawDef: RawTokenDefinition): CompiledTokenDefinition {
    const compiledTokenDef: CompiledTokenDefinition = [];

    for (let [tokenType, rawRule] of tokenRawDef) {
        compiledTokenDef.push([tokenType, processRule(rawRule)]);
    }

    return compiledTokenDef;
}
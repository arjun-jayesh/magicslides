import { ResponseParser } from './src/core/parser/responseParser';

const testCases = [
    "```json\n{ \"title\": \"OK\" }\n```",
    "Preamble { \"title\": \"Inner\" } Postamble",
    "{ \"nested\": { \"val\": 1 } }",
    "Malformed { \"a\": 1"
];

testCases.forEach((t, i) => {
    console.log(`Test ${i}:`);
    try {
        const res = ResponseParser.parse(t);
        console.log("Result:", JSON.stringify(res, null, 2));
    } catch (e) {
        console.log("Error:", e);
    }
    console.log("---");
});

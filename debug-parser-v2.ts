import { ResponseParser } from './src/core/parser/responseParser';

const testCases = [
    "Preamble { \"title\": \"Inner\" } Postamble",
];

testCases.forEach((t, i) => {
    console.log(`Testing Case: [${t}]`);
    const jsonMatch = t.match(/{[\s\S]*}/);
    if (jsonMatch) {
        console.log(`Match Found: [${jsonMatch[0]}]`);
        try {
            JSON.parse(jsonMatch[0]);
            console.log("JSON.parse OK");
        } catch (e) {
            console.log("JSON.parse FAILED:", (e as Error).message);
        }
    } else {
        console.log("No Match Found");
    }
    const res = ResponseParser.parse(t);
    console.log("Final Result Status:", res.title);
});

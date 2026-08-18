import fs from "fs";

const file = "server.ts";
let content = fs.readFileSync(file, "utf8");

const loggerCode = `
// --- IN-MEMORY LOGGER ---
const _logs: string[] = [];
const origLog = console.log;
const origError = console.error;
console.log = (...args) => {
  _logs.push("[LOG] " + args.join(" "));
  if (_logs.length > 200) _logs.shift();
  origLog.apply(console, args);
};
console.error = (...args) => {
  _logs.push("[ERR] " + args.join(" "));
  if (_logs.length > 200) _logs.shift();
  origError.apply(console, args);
};

app.get("/api/logs", (req, res) => {
  res.send(_logs.join("\\n"));
});
// -------------------------
`;

// Insert after app initialization
content = content.replace('const app = express();', 'const app = express();\n' + loggerCode);
fs.writeFileSync(file, content);
console.log("Logger injected.");

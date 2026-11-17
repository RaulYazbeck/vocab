// Runs browser test scripts that expect the repo served on :8765 (BASE),
// with the server inside this process — one after the other:
//   node run-suite.mjs ../sync/sim-two-devices.mjs ../quests/t-quests.mjs …
// (arguments for one script: "../x/t-y.mjs arg1 arg2" as one quoted word)
import { spawn } from "node:child_process";
import path from "node:path";
import { serveRepo } from "./serve.mjs";
const server = await serveRepo(+(process.env.SUITE_PORT || 8765));
const failed = [];
for (const spec of process.argv.slice(2)) {
  const [script, ...args] = spec.split(" ");
  const file = path.resolve(script);
  console.log(`\n── ${spec}`);
  const code = await new Promise(done => {
    spawn(process.execPath, [file, ...args], { cwd: path.dirname(file), stdio: "inherit" }).on("exit", done);
  });
  if (code !== 0) failed.push(spec);
}
server.close();
console.log(failed.length ? `\nFAILED: ${failed.join(", ")}` : "\nall passed");
process.exit(failed.length ? 1 : 0);

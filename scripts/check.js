import { spawnSync } from "node:child_process";

const npmCli = process.env.npm_execpath;
const baseCommand = npmCli ? process.execPath : process.platform === "win32" ? "npm.cmd" : "npm";

function npmArgs(args) {
  return npmCli ? [npmCli, ...args] : args;
}

const commands = [
  [baseCommand, npmArgs(["run", "validate"])],
  [baseCommand, npmArgs(["run", "generate:check"])]
];

for (const [command, args] of commands) {
  const result = spawnSync(command, args, {
    stdio: "inherit"
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

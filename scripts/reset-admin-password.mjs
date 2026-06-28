/**
 * @deprecated Dùng scripts/setup-admin.mjs (có kiểm tra đăng nhập)
 * Chạy: node scripts/setup-admin.mjs [email]
 */
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const email = process.argv[2];
const script = resolve(process.cwd(), "scripts/setup-admin.mjs");
const args = email ? [script, email] : [script];
const result = spawnSync(process.execPath, args, { stdio: "inherit" });
process.exit(result.status ?? 1);

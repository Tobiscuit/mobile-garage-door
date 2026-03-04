import { execSync } from "child_process";
import fs from "fs";

try {
    const result = execSync("npx wrangler@4.69.0 d1 execute mobile-garage-door-db --remote --command \"SELECT name FROM sqlite_master WHERE type='table';\"", { encoding: "utf8" });
    fs.writeFileSync("d1_tables.txt", result);
    console.log("Success");
} catch (e) {
    fs.writeFileSync("d1_tables.txt", "ERROR: " + e.message + "\n" + (e.stdout || "") + "\n" + (e.stderr || ""));
}

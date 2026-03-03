import { execSync } from "child_process";
import fs from "fs";

try {
    const result = execSync("npx wrangler@4.69.0 d1 execute mobile-garage-door-db --remote --command \"SELECT count(*) FROM projects;\"", { encoding: "utf8" });
    console.log(result);
} catch (e) {
    console.error("ERROR: " + e.message + "\n" + (e.stdout || "") + "\n" + (e.stderr || ""));
}

import { execSync } from "child_process";
import fs from "fs";

try {
    const result = execSync("npx --yes wrangler@4.69.0 d1 execute mobile-garage-door-db --remote -y --file=d1_seed.sql", { encoding: "utf8" });
    fs.writeFileSync("d1_seed_output.txt", result);
    console.log("Success");
} catch (e) {
    fs.writeFileSync("d1_seed_output.txt", "ERROR: " + e.message + "\n" + (e.stdout || "") + "\n" + (e.stderr || ""));
}

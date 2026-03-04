import { execSync } from "child_process";

const tables = ["media", "services", "projects", "posts", "users"];
for (const table of tables) {
    try {
        const result = execSync(`npx --yes wrangler@4.69.0 d1 execute mobile-garage-door-db --remote --command "SELECT count(*) as count FROM ${table};"`, { encoding: "utf8", stdio: 'pipe' });
        console.log(`Table ${table}:`);
        console.log(result.split('\n').filter(line => !line.startsWith(' ') && !line.startsWith('⛅️') && !line.startsWith('─') && !line.startsWith('Resource') && !line.startsWith('🌀') && !line.startsWith('🚣')).join('\n'));
    } catch (e) {
        console.log(`Table ${table}: error`);
    }
}

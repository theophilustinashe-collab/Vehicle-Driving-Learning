import { spawn } from 'child_process';
import fs from 'fs';

const env = {};
if (fs.existsSync('.env')) {
  const content = fs.readFileSync('.env', 'utf8');
  content.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if (k && v) env[k.trim()] = v.trim();
  });
}

const finalEnv = { ...process.env, ...env };

const logStream = fs.createWriteStream('backend_final_v8.log');

const child = spawn('node', ['artifacts/api-server/dist/index.mjs'], {
  env: finalEnv,
  stdio: ['ignore', logStream, logStream],
  detached: true
});

child.unref();
console.log('Backend started with PID:', child.pid);
process.exit(0);

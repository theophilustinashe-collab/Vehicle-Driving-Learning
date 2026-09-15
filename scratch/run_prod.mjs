import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const env = {};
if (fs.existsSync('.env')) {
  const content = fs.readFileSync('.env', 'utf8');
  content.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if (k && v) env[k.trim()] = v.trim();
  });
}

// Merge with process.env but prioritize .env
const finalEnv = { ...process.env, ...env };

const child = spawn('node', ['artifacts/api-server/dist/index.mjs'], {
  env: finalEnv,
  stdio: 'inherit',
  detached: true
});

child.unref();
console.log('Backend started with PID:', child.pid);
process.exit(0);

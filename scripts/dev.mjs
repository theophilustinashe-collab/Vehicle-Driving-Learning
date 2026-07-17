import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Load .env
const env = { ...process.env };
const envPath = path.resolve(rootDir, '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim();
    }
  });
}

// Fallback defaults
env.PORT = env.PORT || '8080';
env.NODE_ENV = env.NODE_ENV || 'development';

console.log("🚀 [System] Initializing Roadify Full-Stack...");

// Build API Server first to ensure dist/index.mjs exists
console.log("🚀 [System] Building API Server...");
spawn('pnpm', ['--filter', '@roadify/api-server', 'run', 'build'], {
  stdio: 'inherit',
  shell: true,
  cwd: rootDir
}).on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ [System] API Build failed with code ${code}`);
    process.exit(1);
  }

  // Start API Server
  const apiServer = spawn('node', ['artifacts/api-server/dist/index.mjs'], {
    stdio: 'inherit',
    shell: true,
    cwd: rootDir,
    env
  });

  console.log("🚀 [System] API Server starting on port 8080...");

  // Wait for backend to initialize
  setTimeout(() => {
    console.log("🚀 [System] Starting Vite Frontend on port 3000...");
    const frontend = spawn('pnpm', ['--filter', '@roadify/vid-master', 'run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      cwd: rootDir,
      env: {
        ...process.env,
        PORT: '3000',
        VITE_API_URL: 'http://localhost:8080'
      }
    });

    frontend.on('exit', (code) => {
      console.log(`❌ [System] Frontend exited with code ${code}.`);
    });

    process.on('SIGINT', () => {
      apiServer.kill();
      frontend.kill();
      process.exit();
    });
  }, 2000);

  apiServer.on('exit', (code) => {
    console.log(`❌ [System] API Server exited with code ${code}.`);
  });
});

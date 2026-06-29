import { spawn } from 'node:child_process';

const apiServer = spawn('pnpm', ['--filter', '@workspace/api-server', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: '8080',
    SESSION_SECRET: 'supersecret',
    NODE_ENV: 'development',
    DATABASE_URL: 'postgresql://neondb_owner:npg_V9WkaUpbT7Gq@ep-icy-hat-adekz7qm.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
  }
});

const frontend = spawn('pnpm', ['--filter', '@workspace/vid-master', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: '3000',
    BASE_PATH: '/',
    VITE_API_URL: 'http://192.168.1.63:8080'
  }
});

process.on('SIGINT', () => {
  apiServer.kill();
  frontend.kill();
  process.exit();
});

apiServer.on('exit', (code) => {
  console.log(`API Server exited with code ${code}`);
  frontend.kill();
  process.exit(code);
});

frontend.on('exit', (code) => {
  console.log(`Frontend exited with code ${code}`);
  apiServer.kill();
  process.exit(code);
});

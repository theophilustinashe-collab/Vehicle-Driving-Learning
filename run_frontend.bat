@echo off
cd artifacts\vid-master
set PORT=3001
set VITE_API_URL=http://localhost:8080
pnpm run dev

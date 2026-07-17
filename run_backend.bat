@echo off
REM Load environment variables from .env if possible, or just run with defaults
REM For Windows CMD, we'll use a simple node wrapper to load env
node -e "const fs=require('fs'); if(fs.existsSync('.env')){ const env=fs.readFileSync('.env','utf8').split('\n').forEach(line=>{const [k,v]=line.split('='); if(k&&v) process.env[k.trim()]=v.trim();}) } require('./artifacts/api-server/dist/index.mjs')"

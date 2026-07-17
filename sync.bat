@echo off
echo [Roadify] Syncing changes to GitHub...

:: Add all changes
git add .

:: Commit with a timestamped message
set timestamp=%date% %time%
git commit -m "Auto-sync at %timestamp%"

:: Push to main branch
git push origin main

echo.
echo [Roadify] Done! Your changes are now online.
pause

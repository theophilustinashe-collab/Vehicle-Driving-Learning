@echo off
echo ===================================================
echo VID Master - Windows Setup Helper
echo ===================================================
echo.

:: 1. Enable Long Paths (requires admin)
echo [1/3] Attempting to enable Long Paths...
powershell -Command "Start-Process powershell -ArgumentList '-Command \"New-ItemProperty -Path \"\"HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem\"\" -Name \"\"LongPathsEnabled\"\" -Value 1 -PropertyType DWORD -Force\"' -Verb RunAs"
if %errorlevel% neq 0 (
    echo WARNING: Could not enable Long Paths automatically. Please run PowerShell as Admin and run:
    echo New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
) else (
    echo Long Paths enabled successfully.
)
echo.

:: 2. Map Z: drive to project root
echo [2/3] Mapping Z: drive to project root to shorten paths...
subst Z: "%~dp0"
if %errorlevel% equ 0 (
    echo SUCCESS: Project root mapped to Z:\
) else (
    echo WARNING: Could not map Z: drive. If Z: is already in use, you can manually use: subst [DriveLetter]: "%~dp0"
)
echo.

:: 3. Reminder for Android Studio
echo [3/3] Final Step:
echo Please OPEN the project in Android Studio from the Z:\ drive:
echo 1. Open Android Studio
echo 2. File -> Open
echo 3. Navigate to Z:\artifacts\vid-master\android
echo.
echo ===================================================
echo Setup complete. Press any key to exit.
pause > nul

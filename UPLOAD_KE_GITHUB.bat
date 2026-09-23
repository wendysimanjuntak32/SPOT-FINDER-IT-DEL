@echo off
title Upload 10 Aplikasi ke GitHub
color 0b
echo ====================================================================
echo             SEDANG MENGUNGGAH 10 APLIKASI KE GITHUB...
echo ====================================================================
echo.
echo Akun GitHub : wendysimanjuntak32
echo Repositori  : project-game
echo.
cd /d "%~dp0"

echo [1/3] Memeriksa status branch...
git branch -M main

echo [2/3] Menghubungkan ke GitHub...
git remote set-url origin https://github.com/wendysimanjuntak32/project-game.git

echo [3/3] Mengunggah seluruh file ke GitHub...
echo (Jika muncul jendela login di browser, silakan klik 'Authorize/Sign in')
echo.
git push -u origin main

echo.
echo ====================================================================
if %ERRORLEVEL% EQU 0 (
    echo   [SUKSES] SEMUA 10 APLIKASI TELAH BERHASIL DIUNGGAH KE GITHUB!
    echo   Buka link ini: https://github.com/wendysimanjuntak32/project-game
) else (
    echo   [PERHATIAN] Jika gagal, pastikan Anda sudah login GitHub di browser.
)
echo ====================================================================
echo.
pause

# Masaüstü installer-ləri

Bu qovluq landing səhifəsindəki "Yüklə" bölməsinin göstərdiyi masaüstü
tətbiq quraşdırma fayllarını saxlayır. Server `/downloads/<fayl-adı>`
marşrutu ilə buradakı faylları göndərir.

## Faylları hazırlamaq

```bash
# Syncrom Vella (Windows NSIS installer)
npm run dist:vella:win

# Syncrom AI / Schala installer-i (electron-builder)
npm run dist:win
```

electron-builder çıxışını (`dist/*.exe`) bu qovluğa aşağıdakı adlarla
kopyalayın (landing düymələri məhz bu adları gözləyir):

- `Syncrom-Vella-Setup.exe`
- `Schala-Setup.exe`

Fayl mövcud olmayanda düymə istifadəçini landing-ə "hazırlanır" bildirişi
ilə qaytarır — qırıq yükləmə baş vermir.

> Qeyd: `.exe` faylları böyükdür və repoya commit edilməməlidir
> (`.gitignore`-da `downloads/*.exe` var). Yalnız bu README izlənir.

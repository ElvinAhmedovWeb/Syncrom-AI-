# Vella bilik bazası

Bu qovluğa qoyduğun `.md` və `.txt` faylları Vella-nın hər cavabına avtomatik əlavə kontekst kimi verilir (server.js → `loadVellaKnowledge()`).

## Necə işləyir

- Qovluqdakı ilk 8 fayl oxunur, cəmi 6000 simvola qədər sistemə əlavə olunur.
- Fayl adı əhəmiyyətli deyil, amma özün üçün mənalı adlar seç: `qiymet-siyaseti.md`, `sirket-haqqinda.md`, `xidmetler.md`.
- Dəyişiklik etdikdən sonra serveri yenidən başlatmaq lazım deyil — hər sorğuda təzədən oxunur.

## Nümunə istifadə

Əgər Syncrom AI-ı özün bir şirkət üçün fərdiləşdirmək istəyirsənsə, bura əlavə et:
- Şirkətin məhsul/xidmət siyahısı və qiymətləri
- Hədəf müştəri profili
- Rəqiblər və fərqlənmə nöqtələri
- Tez-tez verilən suallar (FAQ)

Bu fayl nümunədir — istəsən silə bilərsən, boş qovluq da problem yaratmır.

// Vercel Serverless Function girişi.
// server.js Express app-ini olduğu kimi handler kimi export edir; bütün /api/* və
// /downloads/* sorğuları vercel.json rewrite-ları ilə bura yönləndirilir və Express
// öz daxili route-larına (/api/chat, /api/tts, ...) uyğunlaşdırır.
// Qeyd: process.env.VERCEL Vercel tərəfindən avtomatik təyin olunur — server.js
// bunu görüb port dinləməyi (app.listen) və kod-icra alətini söndürür.
const { app } = require("../server.js");

module.exports = app;

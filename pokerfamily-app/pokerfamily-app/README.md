# PokerFamily (servidor propio)

## 1. Probar en tu computador
    npm install
    npm start
Abre http://localhost:3000. Para jugar desde otros celulares en la misma wifi, usa http://IP-DE-TU-PC:3000.

## 2. Publicar el servidor (Render, plan gratis)
1. Sube esta carpeta a un repositorio de GitHub.
2. En render.com: New > Web Service > tu repositorio. Build: `npm install`. Start: `npm start`.
3. Render te da una URL tipo https://pokerfamily.onrender.com. Ya puedes jugar online abriendo esa URL en cualquier celular.
   (El plan gratis se duerme sin uso; la primera conexión puede tardar cerca de un minuto.)

## 3. Generar el APK (Capacitor + Android Studio)
1. En `public/index.html` cambia `REMOTE` por `wss://TU-URL.onrender.com`.
2. Instala Node 18+ y Android Studio, y en esta carpeta ejecuta:

       npm i @capacitor/core @capacitor/cli @capacitor/android
       npx cap init PokerFamily com.tufamilia.pokerfamily --web-dir=public
       npx cap add android
       npx cap sync
       npx cap open android

3. En Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s).
   Para Play Store usa Build > Generate Signed Bundle (AAB).

Cada vez que cambies `public/index.html`: `npx cap sync` y vuelve a compilar.

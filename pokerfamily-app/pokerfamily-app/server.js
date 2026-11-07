// Servidor de PokerFamily: sirve la app y sincroniza las mesas por WebSocket.
const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');
const PUB = path.join(__dirname, 'public');
const rooms = {};
const send = (ws, m) => ws.readyState === 1 && ws.send(JSON.stringify(m));
const bcast = (r, m) => r.cl.forEach(c => send(c, m));
const lobby = r => Object.values(r.lob).sort((a, b) => a.t - b.t);

const srv = http.createServer((req, res) => {
  const f = path.join(PUB, req.url.split('?')[0] === '/' ? 'index.html' : req.url.split('?')[0]);
  if (!f.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' });
    res.end(d);
  });
});

const wss = new WebSocketServer({ server: srv, maxPayload: 300000 });
wss.on('connection', ws => {
  let room = null;
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.t === 'join') {
      const code = String(m.code || '').toUpperCase().slice(0, 4);
      if (m.create && !rooms[code]) rooms[code] = { lob: {}, st: { go: 0, h: m.uid }, cl: new Set(), at: Date.now() };
      room = rooms[code];
      if (!room) return send(ws, { t: 'err', msg: 'No existe la mesa ' + code + '.' });
      room.cl.add(ws); room.at = Date.now();
      const old = room.lob[m.uid];
      room.lob[m.uid] = { uid: m.uid, name: String(m.name || 'Jugador').slice(0, 14), t: old ? old.t : Date.now() };
      send(ws, { t: 'ok' });
      send(ws, { t: 'st', o: room.st });
      bcast(room, { t: 'lob', lob: lobby(room) });
    } else if (m.t === 'set' && room && m.o) {
      room.st = m.o; room.at = Date.now();
      bcast(room, { t: 'st', o: m.o });
    }
  });
  ws.on('close', () => { if (room) room.cl.delete(ws); });
});
setInterval(() => wss.clients.forEach(c => c.ping()), 30000);
setInterval(() => { for (const k in rooms) if (!rooms[k].cl.size && Date.now() - rooms[k].at > 3 * 3600e3) delete rooms[k]; }, 600000);
srv.listen(process.env.PORT || 3000, () => console.log('PokerFamily en puerto ' + (process.env.PORT || 3000)));

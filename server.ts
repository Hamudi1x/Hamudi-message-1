import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'server_db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface ServerDB {
  users: Record<string, any>;
  posts: any[];
  messages: any[];
  backups: Record<string, any>;
}

function loadDB(): ServerDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (!parsed.backups) parsed.backups = {};
      return parsed;
    }
  } catch (e) {
    console.error('Error loading DB:', e);
  }
  return {
    users: {
      '12345678': {
        id: '12345678',
        n: 'أحمد علي',
        bio: 'مطور ومصمم · مرحباً بكم',
        un: 'ahmed_ali',
        photo: '',
        cover: null,
        hideE: false,
        hideId: false,
        lastSeen: Date.now() - 1000 * 60 * 45 // 45 mins ago
      },
      '87654321': {
        id: '87654321',
        n: 'محمد حسن',
        bio: 'أهلاً بكم في حسابي',
        un: 'mohamed_h',
        photo: '',
        cover: null,
        hideE: false,
        hideId: false,
        lastSeen: Date.now() - 1000 * 60 * 180 // 3 hours ago
      },
      '99887766': {
        id: '99887766',
        n: 'علي حمودي',
        bio: 'صديق مخلص · حمودي رسالة',
        un: 'ali_hamudi',
        photo: '',
        cover: null,
        hideE: false,
        hideId: false,
        lastSeen: Date.now() - 1000 * 60 * 10 // 10 mins ago
      }
    },
    posts: [],
    messages: [],
    backups: {}
  };
}

const db = loadDB();

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving DB:', e);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Serve uploaded media files with Range support for video streaming
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Authenticated browser download page (passes Google proxy auth before triggering ZIP download)
  app.get('/download', (_req, res) => {
    const zipPath = path.join(__dirname, 'hamudi-message-source.zip');
    const sizeKb = fs.existsSync(zipPath) ? (fs.statSync(zipPath).size / 1024).toFixed(0) : '0';
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>تحميل كود تطبيق حمودي رسالة (ZIP)</title>
  <style>
    body { margin:0; font-family: system-ui, -apple-system, sans-serif; background:#0e1621; color:#fff; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:20px; }
    .card { background:#17212b; border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:28px 24px; max-width:420px; width:100%; text-align:center; box-shadow:0 16px 40px rgba(0,0,0,0.45); }
    h1 { margin:0 0 8px; font-size:20px; }
    p { margin:0 0 20px; color:#9bb0c4; font-size:14px; line-height:1.6; }
    button { width:100%; height:48px; border:0; border-radius:14px; background:#2f9cf4; color:#fff; font-size:15px; font-weight:700; cursor:pointer; }
    button:disabled { opacity:0.6; cursor:wait; }
    .status { margin-top:14px; font-size:13px; color:#69d18a; min-height:20px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>حمودي رسالة — الكود المصدري</h1>
    <p>ملف المشروع الكامل بصيغة ZIP (${sizeKb} كيلوبايت). اضغط الزر أدناه لبدء التحميل مباشرة.</p>
    <button id="dlBtn" onclick="startDl()">تحميل ملف الكود (ZIP)</button>
    <div id="status" class="status"></div>
  </div>
  <script>
    async function startDl() {
      const btn = document.getElementById('dlBtn');
      const st = document.getElementById('status');
      btn.disabled = true;
      st.style.color = '#9bb0c4';
      st.textContent = 'جاري تجهيز الملف للتحميل...';
      try {
        const res = await fetch('/hamudi-message-source.zip', { credentials: 'include' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hamudi-message-source.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        st.style.color = '#69d18a';
        st.textContent = 'تم بدء تحميل hamudi-message-source.zip بنجاح!';
      } catch (e) {
        st.style.color = '#ff6b6b';
        st.textContent = 'حدث خطأ أثناء التحميل، حاول فتح الصفحة في متصفح Chrome.';
      } finally {
        btn.disabled = false;
      }
    }
  </script>
</body>
</html>`);
  });

  // Direct ZIP download endpoint for full project source code
  app.get('/hamudi-message-source.zip', (_req, res) => {
    const zipPath = path.join(__dirname, 'hamudi-message-source.zip');
    if (!fs.existsSync(zipPath)) {
      return res.status(404).send('Archive not found');
    }
    res.setHeader('Content-Type', 'application/zip');
    res.download(zipPath, 'hamudi-message-source.zip');
  });

  // Raw binary media upload endpoint (prevents localStorage 5MB quota overflow)
  app.post('/api/media', express.raw({ type: '*/*', limit: '150mb' }), (req, res) => {
    try {
      const buf = req.body;
      if (!buf || !Buffer.isBuffer(buf) || buf.length === 0) {
        return res.status(400).json({ error: 'Empty media payload' });
      }
      const rawName = decodeURIComponent(String(req.headers['x-file-name'] || 'media.bin'));
      const mime = String(req.headers['content-type'] || '').toLowerCase();
      let ext = path.extname(rawName).replace(/[^a-zA-Z0-9.]/g, '').toLowerCase();
      if (!ext) {
        if (mime.includes('mp4')) ext = '.mp4';
        else if (mime.includes('webm')) ext = '.webm';
        else if (mime.includes('quicktime') || mime.includes('mov')) ext = '.mov';
        else if (mime.includes('png')) ext = '.png';
        else if (mime.includes('webp')) ext = '.webp';
        else if (mime.includes('gif')) ext = '.gif';
        else if (mime.includes('image')) ext = '.jpg';
        else if (mime.includes('video')) ext = '.mp4';
        else ext = '.bin';
      }
      const fileName = `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
      const filePath = path.join(UPLOADS_DIR, fileName);
      fs.writeFileSync(filePath, buf);
      res.json({ success: true, url: `/uploads/${fileName}` });
    } catch (e) {
      console.error('Media upload failed:', e);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // 1. Users API
  app.get('/api/users', (req, res) => {
    res.json(db.users);
  });

  app.get('/api/users/check/:id', (req, res) => {
    const uid = String(req.params.id || '').trim();
    const taken = !!db.users[uid];
    res.json({ taken, available: !taken });
  });

  app.get('/api/users/:id', (req, res) => {
    const user = db.users[req.params.id];
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.post('/api/users/:id/heartbeat', (req, res) => {
    const id = req.params.id;
    if (db.users[id]) {
      db.users[id].lastSeen = Date.now();
      saveDB();
    }
    res.json({ success: true, lastSeen: db.users[id]?.lastSeen || Date.now() });
  });

  app.post('/api/users', (req, res) => {
    const u = req.body;
    if (!u || !u.id) {
      return res.status(400).json({ error: 'Invalid user data' });
    }
    const uid = String(u.id).trim();
    const { isNew, ownerId, ...cleanUser } = u;
    const existing = db.users[uid];

    if (existing) {
      if (isNew) {
        return res.status(409).json({ error: 'ID already in use', taken: true });
      }
      if (existing.ownerId && ownerId && existing.ownerId !== ownerId) {
        return res.status(409).json({ error: 'ID already in use', taken: true });
      }
    }

    db.users[uid] = {
      ...(existing || {}),
      ...cleanUser,
      id: uid,
      ownerId: ownerId || existing?.ownerId || '',
      lastSeen: Date.now(),
      updatedAt: Date.now()
    };
    saveDB();
    res.json({ success: true, user: db.users[uid] });
  });

  app.delete('/api/users/:id', (req, res) => {
    const uid = String(req.params.id || '').trim();
    if (!uid) return res.status(400).json({ error: 'Invalid user ID' });
    delete db.users[uid];
    if (db.backups && db.backups[uid]) {
      delete db.backups[uid];
    }
    db.posts = (db.posts || []).filter((p: any) => String(p.userId || '').trim() !== uid);
    db.messages = (db.messages || []).filter(
      (m: any) => String(m.senderId || '').trim() !== uid && String(m.receiverId || '').trim() !== uid
    );
    saveDB();
    res.json({ success: true });
  });

  // 2. Posts API
  app.get('/api/posts', (req, res) => {
    res.json(db.posts.filter((p: any) => !p.ar));
  });

  app.post('/api/posts', (req, res) => {
    const p = req.body;
    if (!p || !p.id) {
      return res.status(400).json({ error: 'Invalid post data' });
    }
    db.posts = db.posts.filter((existing: any) => existing.id !== p.id);
    db.posts.unshift(p);
    saveDB();
    res.json({ success: true, post: p });
  });

  app.delete('/api/posts/:id', (req, res) => {
    const id = Number(req.params.id);
    db.posts = db.posts.filter((p: any) => p.id !== id);
    saveDB();
    res.json({ success: true });
  });

  app.post('/api/posts/:id/like', (req, res) => {
    const id = Number(req.params.id);
    const { userId } = req.body;
    const post = db.posts.find((p: any) => p.id === id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (!Array.isArray(post.likedBy)) post.likedBy = [];
    const idx = post.likedBy.indexOf(userId);
    if (idx >= 0) {
      post.likedBy.splice(idx, 1);
    } else {
      post.likedBy.push(userId);
    }
    post.likes = post.likedBy.length;
    saveDB();
    res.json({ success: true, likes: post.likes, liked: idx < 0 });
  });

  app.post('/api/posts/:id/comment', (req, res) => {
    const id = Number(req.params.id);
    const { comment } = req.body;
    const post = db.posts.find((p: any) => p.id === id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (!Array.isArray(post.comments)) post.comments = [];
    post.comments.push(comment);
    saveDB();
    res.json({ success: true, comments: post.comments });
  });

  // 3. Real Messages API
  app.get('/api/messages', (req, res) => {
    const { user1, user2 } = req.query as { user1?: string; user2?: string };
    const u1 = user1 ? String(user1).trim() : '';
    const u2 = user2 ? String(user2).trim() : '';

    // If a user is active, update their lastSeen automatically
    if (u1 && db.users[u1]) {
      db.users[u1].lastSeen = Date.now();
    }

    if (u1 && u2) {
      const msgs = db.messages.filter(
        (m: any) =>
          (String(m.senderId).trim() === u1 && String(m.receiverId).trim() === u2) ||
          (String(m.senderId).trim() === u2 && String(m.receiverId).trim() === u1)
      );
      return res.json(msgs);
    }
    if (u1) {
      const msgs = db.messages.filter(
        (m: any) => String(m.senderId).trim() === u1 || String(m.receiverId).trim() === u1
      );
      return res.json(msgs);
    }
    res.json(db.messages);
  });

  app.post('/api/messages', (req, res) => {
    const msg = req.body;
    if (!msg || !msg.senderId || !msg.receiverId) {
      return res.status(400).json({ error: 'Invalid message data' });
    }
    const senderId = String(msg.senderId).trim();
    const receiverId = String(msg.receiverId).trim();

    if (db.users[senderId]) {
      db.users[senderId].lastSeen = Date.now();
    }

    msg.id = msg.id || 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    msg.timestamp = msg.timestamp || Date.now();
    msg.senderId = senderId;
    msg.receiverId = receiverId;

    // Check duplicate
    const exists = db.messages.some(
      (m: any) =>
        m.id === msg.id ||
        (m.senderId === senderId && m.receiverId === receiverId && m.x === msg.x && m.timestamp === msg.timestamp)
    );
    if (!exists) {
      db.messages.push(msg);
      saveDB();
    }
    res.json({ success: true, message: msg });
  });

  // 4. Cloud Backup & Sync (Google Drive Cloud Integration)
  app.post('/api/backup', (req, res) => {
    const { userId, backupData } = req.body;
    if (!userId || !backupData) {
      return res.status(400).json({ error: 'Missing userId or backupData' });
    }
    const uid = String(userId).trim();
    db.backups[uid] = {
      data: backupData,
      updatedAt: Date.now()
    };
    saveDB();
    res.json({ success: true, updatedAt: db.backups[uid].updatedAt });
  });

  app.get('/api/backup/:userId', (req, res) => {
    const uid = String(req.params.userId).trim();
    const b = db.backups[uid];
    if (!b) {
      return res.status(404).json({ error: 'No backup found' });
    }
    res.json(b);
  });


  // Vite integration
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();

/**
 * Generates: docs/SocketIO_Learning_Guide_HMS_Support_Chat.pdf
 * Run: node docs/generate-socketio-pdf.js
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const OUT = path.join(__dirname, 'SocketIO_Learning_Guide_HMS_Support_Chat.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 56, bottom: 56, left: 56, right: 56 },
  info: {
    Title: 'Socket.IO Learning Guide + HMS Support Chat Case Study',
    Author: 'Hospital Management System',
    Subject: 'Deep Socket.IO guide for beginners with project implementation',
  },
});

const stream = fs.createWriteStream(OUT);
doc.pipe(stream);

const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
let pageNum = 0;

doc.on('pageAdded', () => {
  pageNum += 1;
});

function footer() {
  const y = doc.page.height - 36;
  doc
    .fontSize(8)
    .fillColor('#666666')
    .text('Socket.IO Learning Guide | HMS Support Chat', 56, y, {
      width: pageWidth - 40,
      align: 'left',
      lineBreak: false,
    });
  doc.text(String(doc.bufferedPageRange ? '' : ''), 0, y);
}

function ensureSpace(min = 80) {
  if (doc.y > doc.page.height - doc.page.margins.bottom - min) {
    doc.addPage();
  }
}

function h1(text) {
  ensureSpace(100);
  doc.moveDown(0.6);
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#0f172a').text(text, { width: pageWidth });
  doc.moveDown(0.35);
  doc
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.margins.left + pageWidth, doc.y)
    .strokeColor('#2563eb')
    .lineWidth(1.5)
    .stroke();
  doc.moveDown(0.5);
}

function h2(text) {
  ensureSpace(70);
  doc.moveDown(0.35);
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#1e3a8a').text(text, { width: pageWidth });
  doc.moveDown(0.25);
}

function p(text) {
  ensureSpace(40);
  doc.font('Helvetica').fontSize(10).fillColor('#111827').text(text, {
    width: pageWidth,
    align: 'left',
    lineGap: 2,
  });
  doc.moveDown(0.35);
}

function bullet(items) {
  items.forEach((item) => {
    ensureSpace(28);
    doc.font('Helvetica').fontSize(10).fillColor('#111827').text(`•  ${item}`, {
      width: pageWidth,
      indent: 8,
      lineGap: 1.5,
    });
  });
  doc.moveDown(0.3);
}

function code(text) {
  ensureSpace(60);
  const startY = doc.y;
  doc.font('Courier').fontSize(8).fillColor('#0f172a');
  const height = doc.heightOfString(text, { width: pageWidth - 16, lineGap: 1 });
  ensureSpace(height + 20);
  const y = doc.y;
  doc.rect(doc.page.margins.left, y - 4, pageWidth, height + 12).fill('#f1f5f9');
  doc.fillColor('#0f172a').text(text, doc.page.margins.left + 8, y, {
    width: pageWidth - 16,
    lineGap: 1,
  });
  doc.moveDown(0.5);
  doc.x = doc.page.margins.left;
}

function note(text) {
  ensureSpace(50);
  doc.font('Helvetica-Oblique').fontSize(9.5).fillColor('#334155').text(`Note: ${text}`, {
    width: pageWidth,
    lineGap: 1.5,
  });
  doc.moveDown(0.4);
}

function flow(lines) {
  ensureSpace(40);
  lines.forEach((line) => {
    ensureSpace(22);
    doc.font('Courier').fontSize(8.5).fillColor('#0f172a').text(line, { width: pageWidth });
  });
  doc.moveDown(0.4);
}

// ───────────────── COVER ─────────────────
doc.rect(0, 0, doc.page.width, 220).fill('#1e3a8a');
doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(26).text('Socket.IO Learning Guide', 56, 80, {
  width: pageWidth,
});
doc
  .font('Helvetica')
  .fontSize(13)
  .fillColor('#bfdbfe')
  .text('From Beginner to Deep Realtime Patterns', 56, 120, { width: pageWidth });
doc
  .font('Helvetica-Bold')
  .fontSize(12)
  .fillColor('#ffffff')
  .text('Case Study: Hospital Management System — Live Support Chat', 56, 150, {
    width: pageWidth,
  });
doc
  .font('Helvetica')
  .fontSize(10)
  .fillColor('#93c5fd')
  .text('System design • Code flow • Ack • Rooms • Auth • REST + Socket hybrid', 56, 175, {
    width: pageWidth,
  });

doc.fillColor('#111827');
doc.y = 250;
p(
  'This guide teaches Socket.IO deeply, then maps every major idea onto the real support-chat feature in your Hospital Management System (Next.js frontend + Express/MongoDB backend).'
);
p(
  'You will learn concepts, why they matter, how they fail in production, and exactly how your project implements them.'
);

h2('Who this is for');
bullet([
  'Beginners who know basic JavaScript / Node',
  'Developers building chat, notifications, or live dashboards',
  'Anyone studying this HMS support-chat implementation',
]);

h2('How to read this PDF');
bullet([
  'Parts A–C: Socket.IO theory and production patterns (deep)',
  'Part D: Your HMS project implementation (file paths + event flow)',
  'Keep the backend and frontend projects open while reading Part D',
]);

// ───────────────── TOC ─────────────────
doc.addPage();
h1('Table of Contents');

const toc = [
  'PART A — Foundations',
  '  1. How to use this guide',
  '  2. HTTP vs realtime (WebSocket)',
  '  3. What Socket.IO is (and is not)',
  '  4. Socket.IO vs WebSocket vs SSE vs polling',
  '  5. High-level architecture',
  'PART B — Core Socket.IO (Deep)',
  '  6. Install & Express bootstrap',
  '  7. Client connection options',
  '  8. Events deep dive',
  '  9. Bidirectional messaging patterns',
  '  10. Acknowledgements (ack), timeout, retry UX',
  '  11. Rooms',
  '  12. Namespaces',
  '  13. Connection lifecycle',
  '  14. Socket middleware',
  '  15. Payload design & validation',
  '  16. Error handling patterns',
  'PART C — Production Concerns (Deep)',
  '  17. Authentication strategies',
  '  18. Authorization (roles inside events)',
  '  19. Security basics',
  '  20. Rate limiting / anti-spam',
  '  21. Persistence strategy',
  '  22. Hybrid REST + Socket design',
  '  23. Ordering & duplicates',
  '  24. Typing & presence',
  '  25. Scaling notes (Redis adapter concept)',
  '  26. Debugging checklist',
  'PART D — HMS Support Chat Implementation',
  '  27. Feature goals & user flows',
  '  28. System design diagram',
  '  29. Data models',
  '  30. Duplicate-conversation rule',
  '  31. Backend REST API map',
  '  32. Backend Socket setup',
  '  33. Event contract',
  '  34. Send pipeline (ack-first)',
  '  35. Frontend socket client',
  '  36. Frontend UI code flow',
  '  37. Admin inbox realtime',
  '  38. Hardening in this app',
  '  39. File map',
  '  40. End-to-end walkthrough',
  '  41. Common project bugs & fixes',
  '  42. Cheat sheet & practice tasks',
];
toc.forEach((line) => {
  ensureSpace(18);
  const isPart = line.startsWith('PART');
  doc
    .font(isPart ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(isPart ? 11 : 10)
    .fillColor(isPart ? '#1e3a8a' : '#111827')
    .text(line, { width: pageWidth });
});

// ───────────────── PART A ─────────────────
doc.addPage();
h1('PART A — Foundations');

h2('1. How to use this guide');
p(
  'Realtime systems feel magical until one message is lost, duplicated, or delivered to the wrong user. Socket.IO solves transport and reconnect problems, but your app still owns business rules: who can join which room, what gets saved to MongoDB, and how the UI shows sending/sent/failed.'
);
p(
  'Rule of thumb used in HMS: Socket.IO delivers live updates. REST loads history and heals state after refresh/reconnect. Database is the source of truth for messages.'
);

h2('2. HTTP vs realtime (WebSocket)');
p(
  'Classic HTTP is request/response: the client asks, the server answers, then the connection work is mostly done. Chat needs the server to push messages to clients that did not just make a request.'
);
bullet([
  'HTTP polling: client asks every few seconds — simple but wasteful and slow',
  'Server-Sent Events (SSE): server pushes one-way text stream — good for feeds, not ideal for chat replies',
  'WebSocket: full-duplex persistent connection — both sides can send anytime',
]);
p(
  'WebSocket is the foundation. Socket.IO sits on top and adds rooms, acknowledgements, automatic reconnect, and fallback transports.'
);

h2('3. What Socket.IO is (and is not)');
p(
  'Socket.IO is a realtime communication library for Node (server) and browsers/apps (client). It gives you event-based messaging over an engineered connection layer.'
);
bullet([
  'It IS: event bus over a resilient connection, with rooms and ack helpers',
  'It is NOT: a database, a message queue, or automatic chat history storage',
  'It does NOT replace REST for CRUD, auth cookie flows, or SEO pages',
]);
note(
  'If you only emit messages and never save them, refresh loses the chat. HMS always persists support messages in MongoDB.'
);

h2('4. Socket.IO vs WebSocket vs SSE vs polling');
bullet([
  'Polling: easiest conceptually, worst latency/cost for chat',
  'SSE: excellent for server→client streams (prices, logs); client→server still needs HTTP',
  'Raw WebSocket: powerful, but you build reconnect, rooms, and fallbacks yourself',
  'Socket.IO: batteries included for product features (rooms, ack, reconnect)',
]);
p(
  'For a hospital support desk with authenticated users and admins, Socket.IO is a strong fit because rooms and ack map cleanly to conversation threads and delivery confirmation.'
);

h2('5. High-level architecture');
flow([
  'Browser UI (Next.js)',
  '   |  REST via /api/proxy  (history, lists, mark read)',
  '   |  Socket.IO direct     (live messages, typing)',
  '   v',
  'Express HTTP Server + Socket.IO Server',
  '   |',
  '   +--> Auth middleware (JWT)',
  '   +--> Business rules (roles, active conversation)',
  '   +--> MongoDB (conversations + messages)',
]);
p(
  'Important: Next.js BFF proxy is perfect for REST, but Socket.IO connects to the Express host (example: http://localhost:3001), not to /api/proxy.'
);

// ───────────────── PART B ─────────────────
doc.addPage();
h1('PART B — Core Socket.IO (Deep)');

h2('6. Install & Express bootstrap');
p(
  'Socket.IO must attach to an HTTP server instance. If you only call app.listen(), you do not get a handle to share with Socket.IO. HMS uses http.createServer(app).'
);
code(`const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: true } });

io.on('connection', (socket) => {
  console.log('connected', socket.id);
});

server.listen(3001);`);
p('Client dependency: socket.io-client. Server dependency: socket.io.');

h2('7. Client connection options');
bullet([
  'transports: prefer websocket, allow polling fallback',
  'auth: { token } — send JWT during handshake',
  'autoConnect: false — connect only after login/session ready',
  'reconnection: enabled by default — critical for mobile networks',
]);
code(`import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  auth: { token: accessJwt },
});
socket.connect();`);
note(
  'In HMS, the access JWT is HttpOnly. The browser calls GET /api/auth/socket-token (same-origin BFF) to obtain a token only for the socket handshake.'
);

h2('8. Events deep dive');
p(
  'Socket.IO is event-based. You invent event names. Good names look like support:sendMessage — domain + action.'
);
bullet([
  'socket.emit(event, payload) — send',
  'socket.on(event, handler) — listen',
  'socket.once(event, handler) — listen one time',
  'socket.off(event, handler) — remove listener (prevents leaks in React)',
]);
p(
  'Always remove listeners in React useEffect cleanup. Duplicate listeners cause double messages in UI.'
);

h2('9. Bidirectional messaging patterns');
bullet([
  'Client → server: user typing send',
  'Server → one client: private ack/error',
  'Server → room: everyone in a conversation',
  'Server → all admins: inbox preview update',
  'Broadcast except sender: socket.to(room).emit(...)',
]);
code(`// everyone in room including sender
io.to('support:conversation:ID').emit('support:newMessage', data);

// everyone in room except the emitting socket
socket.to('support:conversation:ID').emit('support:typing', data);`);

h2('10. Acknowledgements (ack), timeout, retry UX');
p(
  'An ack is a callback attached to emit. The receiver can reply to that specific emit. This is how the sender knows: accepted, rejected, or timed out.'
);
code(`// Client
socket.timeout(8000).emit('support:sendMessage', payload, (err, res) => {
  if (err) return setStatus('failed');      // timeout/transport failure
  if (!res?.ok) return setStatus('failed'); // business rejection
  setStatus('sent');
});

// Server
socket.on('support:sendMessage', async (payload, ack) => {
  try {
    const saved = await saveMessage(payload);
    ack({ ok: true, message: saved });
    io.to(room).emit('support:newMessage', { message: saved });
  } catch (e) {
    ack({ ok: false, error: e.message });
  }
});`);
p(
  'UI states that matter: sending → sent → failed (+ Retry). Do not treat "I emitted" as "server saved it". HMS uses ack-first confirmation, then room broadcast for other participants.'
);

doc.addPage();
h2('11. Rooms');
p(
  'A room is a named group of sockets. It is the core chat isolation tool. Without rooms, every connected user would hear every message.'
);
bullet([
  'socket.join(roomName)',
  'socket.leave(roomName)',
  'io.to(roomName).emit(event, data)',
]);
p('HMS room naming convention:');
code(`support:conversation:<conversationId>  // thread members
support:user:<userId>                   // personal updates
support:admins                          // all admin sockets`);
p(
  'Always authorize before join. Never trust the client: verify the user owns the conversation or is admin.'
);

h2('12. Namespaces');
p(
  'Namespaces split one Socket.IO server into logical channels (example: /chat, /admin). Rooms are usually enough for one product feature. Namespaces help when features have totally different auth and traffic profiles.'
);
note(
  'HMS uses the default namespace "/" and separates features with event prefixes (support:*) and rooms. That keeps the codebase simple.'
);

h2('13. Connection lifecycle');
bullet([
  'connect — socket ready',
  'disconnect — network/tab close/server restart',
  'connect_error — auth failure, CORS, wrong URL',
  'reconnect — automatic; client must re-join rooms and often refetch REST history',
]);
p(
  'After reconnect in HMS: fetch message history via REST, then emit support:joinConversation again. Do not assume room membership survived.'
);

h2('14. Socket middleware');
p(
  'io.use(fn) runs before connection is accepted. Perfect place for JWT verification. Reject early with next(new Error(...)).'
);
code(`io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  const data = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(data.user.id);
  if (!user) return next(new Error('User not found'));
  socket.user = { id: String(user._id), role: user.role, name: user.name };
  next();
});`);

h2('15. Payload design & validation');
bullet([
  'Send IDs and text, not whole user password fields',
  'Trim text; enforce max length (HMS: 2000 chars)',
  'Reject empty messages',
  'Never accept senderRole from client as trusted truth — derive role from authenticated socket.user',
]);

h2('16. Error handling patterns');
bullet([
  'Use ack for request-scoped errors (validation, closed conversation, rate limit)',
  'Use dedicated error events only for global problems',
  'Log server exceptions, return safe messages to clients',
  'On client: toast + mark bubble failed + allow retry',
]);

// ───────────────── PART C ─────────────────
doc.addPage();
h1('PART C — Production Concerns (Deep)');

h2('17. Authentication strategies');
p(
  'HTTP APIs in this HMS use HttpOnly cookies via a Next.js BFF proxy. Socket.IO cannot conveniently reuse that proxy path the same way, so handshake needs a token.'
);
bullet([
  'Option A (used): BFF endpoint returns current access JWT for socket handshake only',
  'Option B: mint a short-lived dedicated socket token (even safer for large systems)',
  'Never put long-lived refresh tokens into socket auth',
]);

h2('18. Authorization (roles inside events)');
p(
  'Auth answers "who are you?". Authorization answers "are you allowed to do this?". Every sensitive event must check membership/role again.'
);
bullet([
  'Users may only join/send in their own conversation',
  'Admins may access all support conversations',
  'Closed conversations reject new messages',
]);

h2('19. Security basics');
bullet([
  'Configure CORS carefully in production (not "*")',
  'Validate conversationId is a real ObjectId and authorized',
  'Do not trust client-provided unread counters',
  'Expire JWTs; handle token_expired on connect_error',
]);

h2('20. Rate limiting / anti-spam');
p(
  'HMS socket send throttle: max 8 support:sendMessage events per user per 10 seconds (in-memory Map). For multi-server production, move counters to Redis.'
);

h2('21. Persistence strategy');
p(
  'Socket delivery is temporary. Chat history must live in MongoDB. Persist first (or in the same request path before broadcast). HMS saves SupportMessage, updates conversation preview/unread/status, then acks and emits.'
);

h2('22. Hybrid REST + Socket design');
bullet([
  'REST: create conversation, list conversations, paginated history, assign/status, mark read',
  'Socket: send live message, typing, conversationUpdated for inbox badges',
  'On page load / reconnect: REST first, then join room',
]);

h2('23. Ordering & duplicates');
p(
  'Two messages can share the same createdAt millisecond under load. Sort by createdAt then _id (Mongo ObjectIds increase over time). On the UI, dedupe by message id when both ack and room broadcast arrive.'
);

h2('24. Typing & presence');
p(
  'Typing events are ephemeral. Do not store them. Use socket.to(room).emit so the typer does not receive their own typing echo. Clear typing with a short client timeout.'
);

h2('25. Scaling notes (Redis adapter concept)');
p(
  'One Node process keeps rooms in memory. Multiple servers need a shared adapter (Redis) so a user on server A receives emits from server B. Start single-server; add Redis adapter when you horizontal-scale.'
);

h2('26. Debugging checklist');
bullet([
  'Wrong socket URL: using .../api instead of host root',
  'CORS blocking browser origin',
  'Missing/expired auth token in handshake',
  'Forgot to join conversation room before expecting messages',
  'React listener registered twice',
  'Admin UI listening but filters hide the conversation',
]);

// ───────────────── PART D ─────────────────
doc.addPage();
h1('PART D — HMS Support Chat Implementation');

h2('27. Feature goals & user flows');
bullet([
  'Logged-in patients open /support and chat with admin',
  'Admins open /support-inbox, assign, reply, close/reopen',
  'Only one active conversation per user at a time',
  'Realtime delivery with ack-based sender confirmation',
]);

h2('28. System design diagram');
flow([
  '[User /support] --REST--> /api/proxy --> Express /api/support',
  '[User /support] --socket-token--> Next /api/auth/socket-token',
  '[User /support] --Socket.IO--> Express :3001 (auth.token JWT)',
  '        | join support:conversation:<id>',
  '        | emit support:sendMessage + ack callback',
  '        v',
  'MongoDB save message + update conversation',
  '        |',
  '        +--> ack sender { ok, message, conversation }',
  '        +--> emit support:newMessage to conversation room',
  '        +--> emit support:conversationUpdated to support:admins',
  '[Admin /support-inbox] receives live thread + inbox preview',
]);

h2('29. Data models');
p('supportConversations fields (simplified):');
bullet([
  'user, assignedAdmin, status, subject',
  'lastMessageAt, lastMessagePreview',
  'unreadForUser, unreadForAdmin',
  'indexes: { user, lastMessageAt }, { status, lastMessageAt }, { user, status }',
]);
p('supportMessages fields (simplified):');
bullet([
  'conversation, sender, senderRole (user|admin), text',
  'isRead, readAt, timestamps',
  'index: { conversation, createdAt, _id }',
]);
p('Statuses: open | waiting_for_admin | waiting_for_user | closed');

h2('30. Duplicate-conversation rule');
p(
  'POST /api/support/conversations checks for any conversation in ACTIVE statuses: open, waiting_for_admin, waiting_for_user. If found, it returns that conversation (created:false) instead of inserting another. Only closed allows a new thread.'
);

doc.addPage();
h2('31. Backend REST API map');
bullet([
  'POST /api/support/conversations — start/get active',
  'GET /api/support/conversations/me — patient list + unreadTotal',
  'GET /api/support/conversations/:id/messages — history',
  'POST /api/support/conversations/:id/messages — HTTP fallback send',
  'PATCH /api/support/conversations/:id/read — mark read',
  'GET /api/support/admin/conversations — inbox filters',
  'PATCH /api/support/admin/conversations/:id/assign',
  'PATCH /api/support/admin/conversations/:id/status',
]);
p('Admin routes use fetchuser + requireAdmin middleware.');

h2('32. Backend Socket setup');
p('Key files:');
bullet([
  'Backend/index.js — http.Server + Socket.IO + registerSupportSocket(io)',
  'Backend/socket/socketAuth.js — JWT from handshake.auth.token',
  'Backend/socket/supportSocket.js — events, rooms, throttle, ack',
  'Backend/utils/supportChatHelpers.js — shared persist/serialize logic',
]);
code(`// index.js (concept)
const server = http.createServer(app);
const io = new Server(server, { cors: { ... } });
registerSupportSocket(io);
server.listen(port);`);

h2('33. Event contract');
bullet([
  'support:joinConversation { conversationId } -> ack',
  'support:leaveConversation { conversationId } -> ack',
  'support:sendMessage { conversationId, text } -> ack { ok, message, conversation }',
  'support:markRead { conversationId } -> ack',
  'support:typingStart / support:typingStop',
  'server: support:newMessage, support:conversationUpdated, support:typing',
]);

h2('34. Send pipeline (ack-first)');
flow([
  '1. Client emits support:sendMessage with callback',
  '2. Server rate-limits per user',
  '3. Load conversation; authorize membership/role',
  '4. Reject if closed / empty / too long',
  '5. createMessageAndUpdateConversation (MongoDB)',
  '6. ack({ ok:true, message, conversation })  // sender confirmation',
  '7. io.to(conversationRoom).emit(support:newMessage)',
  '8. io.to(ADMIN_ROOM).emit(support:conversationUpdated)',
  '9. io.to(userRoom).emit(support:conversationUpdated)',
]);
p(
  'Why ack before relying on room broadcast? The sender needs a clear failure signal if save fails or times out. Room broadcast is for synchronizing all members, not for delivery confirmation UX.'
);

h2('35. Frontend socket client');
p('File: src/lib/socket.ts');
bullet([
  'Singleton browser socket',
  'getSupportSocket() fetches /api/auth/socket-token then connects',
  'emitWithAck(event, payload) wraps socket.timeout(...).emit',
  'Base URL from NEXT_PUBLIC_SOCKET_URL (host without /api)',
]);
code(`// conceptual
const token = await fetch('/api/auth/socket-token').then(r => r.json());
const socket = io(SOCKET_URL, { auth: { token: token.token } });`);

doc.addPage();
h2('36. Frontend UI code flow');
p('Patient UI: src/components/support/SupportChatContent.tsx + SupportChatThread.tsx');
bullet([
  'React Query loads conversations/messages (REST)',
  'On socket ready: join selected conversation + mark read',
  'Local optimistic bubble with deliveryStatus=sending',
  'Ack success replaces temp id with saved message (sent)',
  'Ack failure marks failed and offers Retry',
  'Incoming support:newMessage appends if same conversation (deduped by id)',
  'Typing indicators from support:typing',
]);
p('Route: /support (auth required in routes.config.ts). Header link added in UserHeader.');

h2('37. Admin inbox realtime');
p('Admin UI: src/components/admin/AdminSupportInboxContent.tsx, route /support-inbox');
bullet([
  'Filters: status, search, unreadOnly + pagination',
  'Joins selected conversation room for live thread',
  'support:conversationUpdated refreshes list previews/unread',
  'Actions: Assign me, Close, Reopen (REST mutations)',
  'Same ack send pipeline as patient, senderRole=admin on server',
]);

h2('38. Hardening in this app');
bullet([
  'Ack required for send confirmation',
  'Duplicate active conversation blocked',
  'Compound admin index status + lastMessageAt',
  'Message order createdAt + _id',
  'Per-socket/user send throttle (8 / 10s)',
  'Admin-only REST + role checks in socket events',
]);

h2('39. File map');
p('Backend:');
bullet([
  'models/supportConversations.js',
  'models/supportMessages.js',
  'routes/supportChat.js',
  'middleware/requireAdmin.js',
  'socket/socketAuth.js',
  'socket/supportSocket.js',
  'utils/supportChatHelpers.js',
  'index.js',
]);
p('Frontend:');
bullet([
  'app/(user)/support/page.tsx',
  'app/(admin)/support-inbox/page.tsx',
  'components/support/*',
  'components/admin/AdminSupportInboxContent.tsx',
  'services/supportChatService.ts',
  'lib/socket.ts',
  'app/api/auth/socket-token/route.ts',
  'hooks/queries.ts (support hooks)',
  'conf/routes.config.ts',
]);

h2('40. End-to-end walkthrough');
flow([
  'Patient logs in -> opens /support -> Start support chat (REST)',
  'Frontend connects socket with JWT from socket-token',
  'joinConversation(room)',
  'Patient types "Billing issue" -> UI shows sending',
  'Server saves message, status=waiting_for_admin, unreadForAdmin++',
  'Ack -> patient bubble becomes sent',
  'Admin inbox receives conversationUpdated (preview/unread)',
  'Admin opens thread, joins room, markRead',
  'Admin replies -> patient receives support:newMessage live',
  'If either refreshes: REST history reloads, socket rejoins',
]);

h2('41. Common project bugs & fixes');
bullet([
  'Socket URL includes /api -> connect fails or wrong path. Use http://localhost:3001',
  'Forgot NEXT_PUBLIC_SOCKET_URL in .env.local',
  'Backend still using app.listen without Socket.IO server share',
  'Token expired: refresh session then reconnect socket',
  'Double messages: missing cleanup of socket.on in useEffect',
  'Cannot create second chat while waiting_for_admin: by design',
  'Closed conversation send fails: reopen from admin first',
]);

h2('42. Cheat sheet & practice tasks');
p('Cheat sheet:');
code(`// connect
io(URL, { auth: { token } })

// join / leave
socket.emit('support:joinConversation', { conversationId }, ack)
socket.emit('support:leaveConversation', { conversationId }, ack)

// send with ack
socket.timeout(8000).emit('support:sendMessage', { conversationId, text }, cb)

// listen
socket.on('support:newMessage', handler)
socket.on('support:conversationUpdated', handler)
socket.on('support:typing', handler)`);

p('Practice tasks:');
bullet([
  'Add an attachment field later (start with URL string only)',
  'Show unread badge count in UserHeader using conversations.unreadTotal',
  'Add admin desktop notification on support:conversationUpdated',
  'Replace in-memory rate limit with Redis when deploying multiple instances',
  'Write a small test script that connects two sockets and asserts ack payload',
]);

doc.addPage();
h1('Appendix — Quick mental model');
p('Remember this sentence:');
p(
  'Authenticate the socket, authorize every event, save to the database, acknowledge the sender, then broadcast to the correct rooms — and always reload history with REST after reconnect.'
);
p('That single sentence is the design of the HMS support chat.');

h2('Environment reminders');
code(`# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Backend
PORT=3001
JWT_SECRET=your_secret
CORS_ORIGIN=http://localhost:3000`);

h2('Run order');
bullet([
  'Start MongoDB',
  'Start backend: npm run dev (Express + Socket.IO on 3001)',
  'Start frontend: npm run dev (Next on 3000)',
  'Login as user -> /support',
  'Login as admin (other browser/profile) -> /support-inbox',
  'Send messages both ways and watch ack states + live updates',
]);

doc.moveDown(1.5);
doc.font('Helvetica-Bold').fontSize(12).fillColor('#1e3a8a').text('End of guide');
doc
  .font('Helvetica')
  .fontSize(10)
  .fillColor('#334155')
  .text(
    'Generated for the Hospital Management System Socket.IO support-chat feature. Use with the backend and frontend repositories side by side.',
    { width: pageWidth }
  );

doc.end();

stream.on('finish', () => {
  console.log('PDF written to', OUT);
});

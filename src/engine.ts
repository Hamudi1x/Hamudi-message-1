// Hamudi message (حمودي رسالة) - Complete Production Engine
// Strictly preserves all existing designs, measurements, options, and provides all requested features

import {
  initGoogleAuth,
  googleSignInWithDrive,
  googleSignOut,
  getCachedDriveToken,
  findDriveBackup,
  downloadDriveBackup,
  uploadNewDriveBackup,
  overwriteDriveBackup
} from './googleDriveAuth';

declare global {
  interface Window {
    A: any;
    V: any;
    R: any;
    S: any;
    D: any;
    toggleVoiceAudio?: any;
    initHamudiApp?: () => void;
    [key: string]: any;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (e: any) => {
      const t = e.target;
      if (t && (t.tagName === 'AUDIO' || t.tagName === 'VIDEO' || t.tagName === 'SOURCE' || t.tagName === 'IMG')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    true
  );
  window.addEventListener('unhandledrejection', (e: any) => {
    const r = String(e.reason || '');
    if (
      (typeof Event !== 'undefined' && e.reason instanceof Event) ||
      r.includes('media') ||
      r.includes('play') ||
      r.includes('source') ||
      r.includes('AbortError') ||
      r.includes('NotAllowedError')
    ) {
      e.preventDefault();
    }
  });
}

const LOGO = '/assets/aistudio/file_000000000cc881fabfcd29e1ebce509b_00519975.png';

const $: any = (s: string) => document.querySelector(s);
const esc = (s: any) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] || c));

const P: Record<string, string> = {
  back: `<path d='M19 12H5M11 6l-6 6 6 6'/>`,
  phone: `<path fill='currentColor' stroke='none' d='M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z'/>`,
  dots: `<g fill='currentColor' stroke='none'><circle cx='12' cy='5' r='1.9'/><circle cx='12' cy='12' r='1.9'/><circle cx='12' cy='19' r='1.9'/></g>`,
  dotsH: `<g fill='currentColor' stroke='none'><circle cx='5' cy='12' r='2.2'/><circle cx='12' cy='12' r='2.2'/><circle cx='19' cy='12' r='2.2'/></g>`,
  search: `<circle cx='11' cy='11' r='6.5'/><path d='M16 16l5 5'/>`,
  mic: `<rect x='9' y='3' width='6' height='11' rx='3'/><path d='M5 11a7 7 0 0014 0M12 18v3'/>`,
  clip: `<path d='M16.5 7v10a4.5 4.5 0 01-9 0V6a3 3 0 016 0v10.5a1.5 1.5 0 01-3 0V8'/>`,
  smile: `<circle cx='12' cy='12' r='9'/><path d='M8 14.2c1 1.5 2.3 2.2 4 2.2s3-.7 4-2.2'/><circle cx='9' cy='10' r='.7' fill='currentColor'/><circle cx='15' cy='10' r='.7' fill='currentColor'/>`,
  send: `<path fill='currentColor' stroke='none' d='M3 20.5l18.5-8.5L3 3.5v6.6l12 1.9-12 1.9z'/>`,
  chat: `<path d='M5 4h14a2 2 0 012 2v9a2 2 0 01-2 2H10l-5 4v-4a2 2 0 01-2-2V6a2 2 0 012-2z'/>`,
  newchat: `<path d='M5 4h14a2 2 0 012 2v9a2 2 0 01-2 2H10l-5 4v-4a2 2 0 01-2-2V6a2 2 0 012-2z'/><path d='M12 7.5v6M9 10.5h6'/>`,
  user: `<circle cx='12' cy='12' r='9'/><circle cx='12' cy='10' r='3'/><path d='M6.5 18c1.2-2.2 3.2-3.2 5.5-3.2s4.3 1 5.5 3.2'/>`,
  me: `<circle cx='12' cy='8' r='4'/><path d='M4 20c1.5-4 4.5-5.5 8-5.5s6.5 1.5 8 5.5'/>`,
  gear: `<path fill='currentColor' stroke='none' d='M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 110-7.2 3.6 3.6 0 010 7.2z'/>`,
  video: `<rect x='3' y='6' width='13' height='12' rx='2.5'/><path d='M16 10.5l5-3v9l-5-3z'/>`,
  speaker: `<path d='M4 9.5v5h3.5l5 4v-13l-5 4z'/><path d='M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11'/>`,
  vol: `<path d='M4 9.5v5h3.5l5 4v-13l-5 4z'/><path d='M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11'/>`,
  volmute: `<path d='M4 9.5v5h3.5l5 4v-13l-5 4z'/><line x1='16' y1='9' x2='22' y2='15'/><line x1='22' y1='9' x2='16' y2='15'/>`,
  flip: `<path d='M20 12a8 8 0 01-14 5.3M4 12a8 8 0 0114-5.3M18 3v4h-4M6 21v-4h4'/>`,
  check: `<path d='M5 12.5l4.5 4.5L19 7.5'/>`,
  loc: `<path d='M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z'/><circle cx='12' cy='9.5' r='2.5'/>`,
  file: `<path d='M7 3h7l5 5v13H7zM14 3v5h5'/>`,
  img: `<rect x='3' y='4' width='18' height='16' rx='2.5'/><circle cx='9' cy='10' r='1.8'/><path d='M4 18l5-5 4 4 3-3 4 4'/>`,
  reply: `<path d='M9 7L4 12l5 5M4 12h10a6 6 0 016 6'/>`,
  copy: `<rect x='8' y='8' width='12' height='12' rx='2'/><path d='M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2'/>`,
  fwd: `<path d='M15 7l5 5-5 5M20 12H10a6 6 0 00-6 6'/>`,
  pin: `<path d='M15 4l5 5-3 1-3 3 .5 4-1.5 1.5-3.5-3.5L5 20l-1-1 4.5-4.5L5 11l1.5-1.5 4 .5 3-3z'/>`,
  trash: `<path d='M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13M10 11v6M14 11v6'/>`,
  bookmark: `<path d='M7 4h10v17l-5-4-5 4z'/>`,
  people: `<circle cx='9' cy='9' r='3'/><path d='M3 19c.8-3 3-4.5 6-4.5s5.2 1.5 6 4.5M16 6a3 3 0 010 6M18 14.8c1.8.6 2.9 1.9 3.3 4'/>`,
  contrast: `<circle cx='12' cy='12' r='8.5'/><path fill='currentColor' d='M12 3.5v17a8.5 8.5 0 000-17z'/>`,
  clear: `<circle cx='12' cy='12' r='9'/><path d='M9 9l6 6M15 9l-6 6'/>`,
  x: `<path d='M6 6l12 12M18 6L6 18'/>`,
  cam: `<path d='M4 8h3l1.5-2h7L17 8h3v11H4z'/><circle cx='12' cy='13' r='3.5'/>`,
  kbd: `<rect x='3' y='6' width='18' height='12' rx='2'/><path d='M7 10h1M11 10h1M15 10h1M7 14h10'/>`,
  lock: `<rect x='5' y='11' width='14' height='9' rx='2'/><path d='M8 11V8a4 4 0 018 0v3'/>`,
  bell: `<path d='M6 17v-6a6 6 0 0112 0v6l1.5 2h-15zM10 21h4'/>`,
  globe: `<circle cx='12' cy='12' r='9'/><path d='M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18'/>`,
  data: `<circle cx='12' cy='12' r='9'/><path d='M12 3v9h9'/>`,
  folder: `<path d='M3 6h6l2 2h10v11H3z'/>`,
  dev: `<rect x='4' y='5' width='16' height='11' rx='2'/><path d='M2 19h20'/>`,
  bat: `<rect x='3' y='8' width='16' height='9' rx='2'/><path d='M21 11v3'/>`,
  backspace: `<path d='M9 6h11v12H9l-6-6z'/><path d='M12 9.5l5 5M17 9.5l-5 5'/>`,
  userplus: `<circle cx='10' cy='9' r='3.5'/><path d='M3 19c1-3.5 3.5-5 7-5M18 9v6M15 12h6'/>`,
  chev: `<path d='M6 9l6 6 6-6'/>`,
  plus: `<path d='M12 5v14M5 12h14'/>`,
  share: `<circle cx='18' cy='5' r='2.5'/><circle cx='6' cy='12' r='2.5'/><circle cx='18' cy='19' r='2.5'/><path d='M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4'/>`,
  swap: `<path d='M7 8h12l-3-3M17 16H5l3 3'/>`,
  pause: `<path d='M8 5v14M16 5v14'/>`,
  play: `<path fill='currentColor' stroke='none' d='M7 4l13 8-13 8z'/>`,
  pen: `<path d='M4 20l4-1 11-11-3-3L5 16z'/>`,
  cake: `<path d='M5 13h14v7H5zM12 13V9M12 5v1.5M4 17h16'/>`,
  mail: `<rect x='3' y='5' width='18' height='14' rx='2'/><path d='M3 7l9 6 9-6'/>`,
  at: `<circle cx='12' cy='12' r='3.5'/><path d='M15.5 12v1.5a2.5 2.5 0 005 0V12a8.5 8.5 0 10-3.3 6.7'/>`,
  link: `<path d='M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1'/>`,
  palette: `<path d='M12 3a9 9 0 000 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a4 4 0 004-4A9 9 0 0012 3z'/><circle cx='8' cy='11' r='1' fill='currentColor'/><circle cx='12' cy='7.5' r='1' fill='currentColor'/><circle cx='16' cy='11' r='1' fill='currentColor'/>`,
  star: `<path d='M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 17l-5.6 3 1.3-6.2L3 9.5l6.3-.7z'/>`,
  shop: `<path d='M4 9l1-5h14l1 5M4 9v11h16V9M4 9h16M9 20v-6h6v6'/>`,
  gift: `<rect x='4' y='9' width='16' height='11' rx='1'/><path d='M3 9h18M12 9v11M12 9c-3 0-4-4-1-4 2 0 1 4 1 4zM12 9c3 0 4-4 1-4-2 0-1 4-1 4z'/>`,
  help: `<circle cx='12' cy='12' r='9'/><path d='M9.5 9.5a2.5 2.5 0 114 2c-1 .8-1.5 1.2-1.5 2.5M12 17h.01'/>`,
  bulb: `<path d='M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z'/>`,
  shield: `<path d='M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z'/><path d='M8.5 12l2.5 2.5 4.5-5'/>`,
  logout: `<path d='M10 5H5v14h5M15 8l4 4-4 4M19 12H9'/>`,
  heart: `<path fill='currentColor' stroke='none' d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/>`,
  comment: `<path fill='currentColor' stroke='none' d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z'/>`,
  remix: `<path d='M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3'/>`,
  download: `<path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3'/>`,
  crop: `<path d='M6.13 1L6 16a2 2 0 002 2h15M1 6.13L16 6a2 2 0 012 2v15'/>`,
  rotate: `<path d='M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-1.19'/>`,
  text: `<path d='M4 7V4h16v3M9 20h6M12 4v16'/>`,
  music: `<path d='M9 18V5l12-2v13'/><circle cx='6' cy='18' r='3'/><circle cx='18' cy='16' r='3'/>`,
  flag: `<path d='M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7'/>`
};

const ic = (n: string, z = 24, c = ''): string =>
  `<svg class='ic ${c}' width='${z}' height='${z}' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'>${P[n] || ''}</svg>`;

const L: Record<string, Record<string, string>> = {
  ar: {
    demo: 'حساب تجريبي (10 دقائق)',
    newmsg: 'رسالة جديدة',
    cancel: 'إلغاء',
    pidp: 'اكتب معرّفك الشخصي (8 أرقام فقط)',
    show: 'إظهار',
    hide: 'إخفاء',
    perm: 'تعذّر الوصول للكاميرا أو المايك (يرجى السماح بالصلاحيات)',
    guest: 'ضيف',
    demoEnd: 'انتهت التجربة',
    lk: 'قفل البصمة',
    fpx: 'البصمة غير مدعومة هنا، وتعمل عند استضافة التطبيق على موقعك',
    idb: 'المعرّف يجب أن يكون 8 أرقام',
    soon: 'قريبًا',
    nocl: 'لا توجد مكالمات',
    inv: 'دعوة الأصدقاء',
    calls: 'آخر المكالمات',
    chats: 'المحادثات',
    contacts: 'جهات الاتصال',
    settings: 'الإعدادات',
    me: 'الملف',
    search: 'بحث برقم المعرّف (8 أرقام) أو بالاسم',
    msg: 'رسالة',
    add: 'إضافة جهة اتصال',
    create: 'إنشاء حساب',
    have: 'لدي حساب',
    google: 'المتابعة بحساب Google',
    email: 'البريد الإلكتروني',
    pass: 'كلمة المرور (10 إلى 25 حرفًا)',
    cont: 'متابعة',
    signin: 'تسجيل الدخول',
    forgot: 'نسيت كلمة المرور؟',
    pt: 'الملف الشخصي',
    nm: 'الاسم',
    photo: 'اختيار صورة',
    fin: 'إنهاء',
    empty: 'لا توجد محادثات بعد. اضغط ✏️ أو ابحث بالمعرّف الشخصي (8 أرقام).',
    nocon: 'لا توجد جهات اتصال. أضفها بالمعرّف الشخصي (8 أرقام).',
    lang: 'اللغة',
    theme: 'الوضع الليلي / النهاري',
    font: 'الخط',
    size: 'حجم الخط',
    out: 'تسجيل الخروج',
    edit: 'تعديل المعلومات',
    grp: 'مجموعة جديدة',
    sv: 'الرسائل المحفوظة',
    pid: 'المعرّف الشخصي (8 أرقام)',
    ie: 'بريد إلكتروني غير صحيح',
    ip: 'كلمة المرور من 10 إلى 25 حرفًا (أحرف أو أرقام)',
    wr: 'البريد أو كلمة المرور غير صحيحة',
    srv: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني',
    idp: 'أدخل المعرّف الشخصي (8 أرقام)',
    nme: 'الاسم مطلوب',
    ib: 'المعرّف غير صحيح أو مضاف مسبقًا',
    vc: 'مكالمة مرئية',
    cl: 'مسح السجل',
    dc: 'حذف المحادثة',
    rp: 'رد',
    cp: 'نسخ',
    fw: 'تحويل',
    pn: 'تثبيت',
    dl: 'حذف',
    gn: 'اسم المجموعة',
    gs: 'اكتب الاسم واختر عضوًا',
    ls: 'متصل الآن',
    nm2: 'اكتب اسمك'
  },
  en: {
    demo: 'Trial account (10 min)',
    newmsg: 'New Message',
    cancel: 'Cancel',
    pidp: 'Enter your personal ID (8 digits only)',
    show: 'Show',
    hide: 'Hide',
    perm: 'Camera or Mic access failed (please allow permissions)',
    guest: 'Guest',
    demoEnd: 'Trial ended',
    lk: 'Fingerprint lock',
    fpx: 'Fingerprint is not supported here; it works when hosted on your own site',
    idb: 'ID must be 8 digits',
    soon: 'Coming soon',
    nocl: 'No calls',
    inv: 'Invite Friends',
    calls: 'Recent calls',
    chats: 'Chats',
    contacts: 'Contacts',
    settings: 'Settings',
    me: 'Profile',
    search: 'Search by personal ID (8 digits) or name',
    msg: 'Message',
    add: 'Add contact',
    create: 'Create account',
    have: 'I have an account',
    google: 'Continue with Google',
    email: 'Email',
    pass: 'Password (10 to 25 characters)',
    cont: 'Continue',
    signin: 'Sign in',
    forgot: 'Forgot password?',
    pt: 'Your profile',
    nm: 'Name',
    photo: 'Choose photo',
    fin: 'Finish',
    empty: 'No chats yet. Tap ✏️ or search by 8-digit personal ID.',
    nocon: 'No contacts yet. Add one by personal ID (8 digits).',
    lang: 'Language',
    theme: 'Night / Day mode',
    font: 'Font',
    size: 'Font size',
    out: 'Log out',
    edit: 'Edit Info',
    grp: 'New Group',
    sv: 'Saved Messages',
    pid: 'Personal ID (8 digits)',
    ie: 'Invalid email address',
    ip: 'Password must be 10 to 25 characters (letters or digits)',
    wr: 'Wrong email or password',
    srv: 'Password reset link sent to your email',
    idp: 'Enter personal ID (8 digits)',
    nme: 'Name is required',
    ib: 'ID is invalid or already added',
    vc: 'Video call',
    cl: 'Clear history',
    dc: 'Delete Chat',
    rp: 'Reply',
    cp: 'Copy',
    fw: 'Forward',
    pn: 'Pin',
    dl: 'Delete',
    gn: 'Group name',
    gs: 'Enter a name and pick a member',
    ls: 'online now',
    nm2: 'Enter your name'
  }
};

const FONTS = ['Roboto', 'Cairo', 'Tajawal', 'Amiri', 'Noto Naskh Arabic'];

let S: any = null;
try {
  const rawS = localStorage.getItem('hm2');
  if (rawS && rawS.trim()) {
    S = JSON.parse(rawS);
  }
} catch (e) {
  S = null;
}

S = S || {
  lang: 'ar',
  theme: 'dark',
  font: 'Cairo',
  fs: 15,
  acc: null,
  in: 0,
  user: null,
  chats: { saved: { n: 'الرسائل المحفوظة', m: [], s: 1 } },
  posts: [],
  stories: []
};

S.o = Object.assign(
  {
    auto: 0,
    iab: 1,
    nm: 1,
    rl: 1,
    rs: 0,
    pmr: 1,
    pmp: 0,
    ds2: 1,
    a18: 1,
    enter: 1,
    sn: 1,
    cl: 1,
    bd: 1,
    ma: 1,
    mv: 0,
    swipe: 'pin',
    lsv: 'all',
    sf: 16,
    br: 17,
    nc: 0,
    th: 0,
    bg: null,
    mm: 'a'
  },
  S.o || {}
);

// Shared users registry and server synchronization
let cachedServerUsers: Record<string, any> = {};
let cachedServerPosts: any[] = [];

// Sync users with backend server
async function fetchServerUsers() {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        cachedServerUsers = data;
        const localReg = getUsersRegistry();
        const merged = { ...localReg, ...data };
        localStorage.setItem('hm_users_registry', JSON.stringify(merged));
      }
    }
  } catch (e) {}
}

async function syncUserToServer(user: any) {
  if (!user || !user.id) return;
  try {
    const ownerId = S.acc?.uid || S.acc?.e || S.acc?.s || '';
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, ownerId })
    });
  } catch (e) {}
}

let hasFetchedServerPosts = false;
let pendingLocalPostSync = 0;

// Upload binary video/image directly to server (/api/media) to avoid localStorage 5MB quota failures
async function uploadMediaFile(file: Blob, fileName = 'media.bin'): Promise<string | null> {
  try {
    const res = await fetch('/api/media', {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'X-File-Name': encodeURIComponent(fileName || 'media.bin')
      },
      body: file
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.url) return String(data.url);
    }
  } catch (e) {}
  return null;
}

// Sync posts with backend server
async function fetchServerPosts() {
  if (pendingLocalPostSync > 0) return;
  try {
    const res = await fetch('/api/posts');
    if (res.ok && pendingLocalPostSync === 0) {
      const data = await res.json();
      if (Array.isArray(data)) {
        hasFetchedServerPosts = true;
        cachedServerPosts = data;
        try {
          localStorage.setItem('hm_posts_feed', JSON.stringify(data));
        } catch (e) {}
      }
    }
  } catch (e) {}
}

async function syncPostToServer(post: any): Promise<boolean> {
  if (!post || !post.id) return false;
  pendingLocalPostSync++;
  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    return res.ok;
  } catch (e) {
    return false;
  } finally {
    pendingLocalPostSync = Math.max(0, pendingLocalPostSync - 1);
  }
}

async function deletePostFromServer(postId: number) {
  try {
    await fetch('/api/posts/' + postId, { method: 'DELETE' });
  } catch (e) {}
}

const getUsersRegistry = (): Record<string, any> => {
  try {
    const raw = localStorage.getItem('hm_users_registry');
    let reg = raw && raw.trim() ? JSON.parse(raw) : null;
    if (!reg || typeof reg !== 'object' || !Object.keys(reg).length) {
      reg = {
        '12345678': {
          id: '12345678',
          n: 'أحمد علي',
          bio: 'متصل دائماً · مرحباً بكم',
          un: 'ahmed_ali',
          photo: '',
          cover: null,
          hideE: false,
          hideId: false
        },
        '87654321': {
          id: '87654321',
          n: 'محمد حسن',
          bio: 'مصمم ومطور · أهلاً بكم',
          un: 'mohamed_h',
          photo: '',
          cover: null,
          hideE: false,
          hideId: false
        },
        '99887766': {
          id: '99887766',
          n: 'علي حمودي',
          bio: 'صديق مخلص · حمودي رسالة',
          un: 'ali_hamudi',
          photo: '',
          cover: null,
          hideE: false,
          hideId: false
        }
      };
      try {
        localStorage.setItem('hm_users_registry', JSON.stringify(reg));
      } catch (e) {}
    }
    return { ...reg, ...cachedServerUsers };
  } catch (e) {
    return cachedServerUsers || {};
  }
};

const saveUserToRegistry = (user: any) => {
  if (!user || !user.id || user.id.length !== 8) return;
  const reg = getUsersRegistry();
  reg[user.id] = {
    id: user.id,
    n: user.n,
    photo: user.photo,
    bio: user.bio,
    un: user.un,
    cover: user.cover,
    hideE: user.hideE,
    hideId: user.hideId
  };
  try {
    localStorage.setItem('hm_users_registry', JSON.stringify(reg));
  } catch (e) {}
  syncUserToServer(reg[user.id]);
};

// Accurate Last Seen and Online status calculator
function formatLastSeen(userOrId: any): string {
  const isAr = S.lang === 'ar';
  let u: any = null;
  if (typeof userOrId === 'object' && userOrId) {
    u = userOrId;
  } else if (typeof userOrId === 'string' && userOrId) {
    const reg = getUsersRegistry();
    u = reg[userOrId] || cachedServerUsers[userOrId];
  }
  if (!u) return isAr ? 'آخر ظهور مؤخراً' : 'Last seen recently';

  const ls = u.lastSeen || u.updatedAt;
  if (!ls) return isAr ? 'آخر ظهور مؤخراً' : 'Last seen recently';

  const now = Date.now();
  const diffMs = now - Number(ls);
  const diffMin = Math.floor(diffMs / 60000);

  // Active in last 2 minutes = genuinely online!
  if (diffMin < 2) {
    return isAr ? '● متصل الآن' : '● Online now';
  }

  // Active in last hour
  if (diffMin < 60) {
    return isAr ? `آخر ظهور منذ ${diffMin} دقيقة` : `Last seen ${diffMin}m ago`;
  }

  const d = new Date(Number(ls));
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const timeStr = d.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isToday) {
    return isAr ? `آخر ظهور اليوم الساعة ${timeStr}` : `Last seen today at ${timeStr}`;
  }

  if (isYesterday) {
    return isAr ? `آخر ظهور أمس الساعة ${timeStr}` : `Last seen yesterday at ${timeStr}`;
  }

  const dateStr = d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    day: 'numeric',
    month: 'short'
  });
  return isAr ? `آخر ظهور في ${dateStr} الساعة ${timeStr}` : `Last seen on ${dateStr} at ${timeStr}`;
}

// Global posts feed synced with server & localStorage
const getGlobalPosts = (): any[] => {
  if (hasFetchedServerPosts || cachedServerPosts.length > 0) {
    return cachedServerPosts.filter((p: any) => !p.ar);
  }
  try {
    const raw = localStorage.getItem('hm_posts_feed');
    return raw && raw.trim() ? JSON.parse(raw).filter((p: any) => !p.ar) : [];
  } catch (e) {
    return [];
  }
};

const saveGlobalPost = (post: any) => {
  cachedServerPosts = cachedServerPosts.filter((p) => p.id !== post.id);
  cachedServerPosts.unshift(post);
  try {
    localStorage.setItem('hm_posts_feed', JSON.stringify(cachedServerPosts));
  } catch (e) {}
  syncPostToServer(post);
};

const deleteGlobalPost = (id: number) => {
  cachedServerPosts = cachedServerPosts.filter((p) => p.id !== id);
  try {
    localStorage.setItem('hm_posts_feed', JSON.stringify(cachedServerPosts));
  } catch (e) {}
  deletePostFromServer(id);
};


const t = (k: string) => L[S.lang]?.[k] || k;

const save = () => {
  if (V.demo) return;
  try {
    localStorage.setItem('hm2', JSON.stringify(S));
    if (S.user && S.user.id) {
      saveUserToRegistry(S.user);
    }
  } catch (e) {}
};

// View State
let V: any = {
  a: 'splash',
  t: 'chats',
  c: null,
  rep: null,
  sel: null,
  fw: 0,
  emo: 0,
  att: 0,
  menu: 0,
  rec: null,
  recPreview: null, // Audio / video preview before send
  call: null,
  q: '',
  fq: '',
  grp: {},
  ph: null,
  pa: 0, // Posts archive toggle (0: active, 1: archived)
  feed: null, // Shorts / TikTok feed viewer { index: 0, posts: [] }
  editor: null, // Media editor for post creation
  storyViewer: null, // Fullscreen story viewer { story: {}, idx: 0 }
  commentsOpen: false,
  viewingProfile: null, // View other user's profile
  playingAudio: null
};

const tm = () =>
  new Date().toLocaleTimeString(S.lang === 'ar' ? 'ar-EG' : 'en-US', { hour: 'numeric', minute: '2-digit' });

const av = (n: string, p?: string) => {
  const bg = `hsl(${[...(n || '?')].reduce((a, c) => a + c.charCodeAt(0), 0) * 37 % 360} 55% 48%)`;
  const init = esc((n || '?')[0]);
  return p && !p.startsWith('blob:')
    ? `<img class="av" src="${esc(p)}" alt="" data-init="${init}" data-bg="${bg}" onerror="this.onerror=null;var s=document.createElement('span');s.className='av';s.style.background=this.dataset.bg;s.textContent=this.dataset.init;this.replaceWith(s)">`
    : `<span class="av" style="background:${bg}">${init}</span>`;
};

const prev = (m: any) =>
  !m
    ? ''
    : m.t === 'f'
    ? '📄 ' + m.n
    : m.t === 'au'
    ? '🎵 ' + (m.n || 'صوت')
    : m.t === 'ct'
    ? '👤 ' + m.x
    : m.t === 'po'
    ? '📊 ' + m.q
    : m.t === 'sk'
    ? '🖼 ملصق'
    : m.t === 'vc'
    ? '⭕ فيديو دائري'
    : m.t === 'vd'
    ? '🎥 فيديو'
    : m.t === 's'
    ? m.x
    : m.t === 'v'
    ? '🎤 بصمة صوتية'
    : m.t === 'i'
    ? '🖼 صورة'
    : m.t === 'l'
    ? '📍 موقع'
    : m.t === 'c'
    ? '📞 ' + m.x
    : m.x;

const hash = async (s: string, p: string) =>
  [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s + p)))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const okE = (e: string) => /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(e);
const okP = (p: string) => p.length >= 10 && p.length <= 25;

function toast(x: string) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const d = document.createElement('div');
  d.className = 'toast';
  d.textContent = x;
  const app = $('#app');
  if (app) app.append(d);
  else document.body.append(d);
  setTimeout(() => d.remove(), 2600);
}
(window as any).toast = toast;

// Audio Synthesizer for Calls
let audioCtx: AudioContext | null = null;
let ringOsc1: OscillatorNode | null = null;
let ringOsc2: OscillatorNode | null = null;
let ringGain: GainNode | null = null;
let ringInterval: any = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function startRingtone() {
  stopRingtone();
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    ringGain = ctx.createGain();
    ringGain.gain.setValueAtTime(0, ctx.currentTime);
    ringGain.connect(ctx.destination);

    ringOsc1 = ctx.createOscillator();
    ringOsc2 = ctx.createOscillator();
    ringOsc1.type = 'sine';
    ringOsc2.type = 'sine';
    ringOsc1.frequency.setValueAtTime(440, ctx.currentTime);
    ringOsc2.frequency.setValueAtTime(480, ctx.currentTime);

    ringOsc1.connect(ringGain);
    ringOsc2.connect(ringGain);
    ringOsc1.start();
    ringOsc2.start();

    let isRinging = false;
    const pulseRing = () => {
      if (!ringGain || !ctx) return;
      isRinging = !isRinging;
      ringGain.gain.setValueAtTime(isRinging ? 0.08 : 0, ctx.currentTime);
    };
    pulseRing();
    ringInterval = setInterval(pulseRing, 1800);
  } catch (e) {}
}

function stopRingtone() {
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
  try {
    if (ringOsc1) {
      ringOsc1.stop();
      ringOsc1.disconnect();
      ringOsc1 = null;
    }
    if (ringOsc2) {
      ringOsc2.stop();
      ringOsc2.disconnect();
      ringOsc2 = null;
    }
    if (ringGain) {
      ringGain.disconnect();
      ringGain = null;
    }
  } catch (e) {}
}

function playHangupSound() {
  stopRingtone();
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(425, ctx.currentTime);
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

function playConnectedSound() {
  stopRingtone();
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

function beep() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch (e) {}
}

// Main Render Function
function R() {
  const r = document.documentElement;
  const dk =
    S.o.auto && typeof matchMedia !== 'undefined'
      ? matchMedia('(prefers-color-scheme: dark)').matches
      : S.theme === 'dark';
  r.dataset.theme = dk ? 'dark' : 'light';
  r.classList.toggle('ps', !!S.ps);
  r.style.setProperty('--ac', TH[S.o.th][1]);
  r.style.setProperty('--out', dk ? TH[S.o.th][0] : '#d9f2c6');
  r.style.setProperty('--fs', S.o.sf + 'px');
  r.style.setProperty('--br', S.o.br + 'px');
  r.lang = S.lang;
  r.style.setProperty('--ff', `"${S.font}", Roboto, "Cairo", sans-serif`);
  document.body.style.fontSize = S.fs + 'px';

  const a = $('#app');
  if (!a) return;

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 820;
  a.classList.remove('desktop-shell', 'has-fullscreen-modal');

  if (V.a === 'splash') {
    a.innerHTML = `<div class="spl"><img src="${LOGO}" alt="Hamudi" style="animation: pop 0.4s ease-out"></div>`;
    return;
  }
  if (!S.in) {
    a.innerHTML = isDesktop ? `<div class="desktop-auth-wrap">${authH()}</div>` : authH();
    return;
  }
  if (S.lock && !V.ok && !V.demo) {
    const lockHtml = `<img class='lg' src='${LOGO}' alt=''><div class='f'><button class='btn' onclick='window.A("unlock")'>${t(
      'lk'
    )}</button><button class='btn g' onclick='window.A("out")'>${t('out')}</button></div>`;
    a.innerHTML = isDesktop ? `<div class="desktop-auth-wrap">${lockHtml}</div>` : lockHtml;
    return;
  }

  // Active Call Screen
  if (V.call) {
    callH(a);
    return;
  }

  // Camera Screen
  if (V.cam) {
    camH(a);
    return;
  }

  // Fullscreen Shorts / TikTok feed
  if (V.feed) {
    a.classList.add('has-fullscreen-modal');
    feedH(a);
    return;
  }

  // Story Viewer
  if (V.storyViewer) {
    a.classList.add('has-fullscreen-modal');
    storyViewerH(a);
    return;
  }

  // Media Editor Modal
  if (V.editor) {
    a.classList.add('has-fullscreen-modal');
    editorH(a);
    return;
  }

  const kp = $('#mi') ? $('#mi').value : '';
  const sc0 = $('.desktop-sidebar .sc') || $('.sc');
  const st0 = sc0 ? sc0.scrollTop : 0;
  const msc0 = $('.desktop-main .sc');
  const mst0 = msc0 ? msc0.scrollTop : 0;

  if (isDesktop) {
    a.classList.add('desktop-shell');
    const isAr = S.lang === 'ar';
    const rightPaneHtml = V.viewingProfile
      ? otherProfileH()
      : V.c
      ? V.cp
        ? cprofH()
        : chatH()
      : V.t === 'grp'
      ? grpH()
      : `<div class="desktop-empty-state">
          <div class="desktop-empty-card">
            <img src="${LOGO}" alt="Hamudi">
            <h2 style="margin:4px 0 0;font-size:20px">${isAr ? 'حمودي رسالة' : 'Hamudi message'}</h2>
            <p class="note" style="margin:0">${
              isAr ? 'اختر محادثة للبدء في المراسلة' : 'Select a chat to start messaging'
            }</p>
          </div>
        </div>`;

    a.innerHTML = `<div class="desktop-sidebar">${mainH()}</div><div class="desktop-main">${rightPaneHtml}</div>`;
  } else {
    a.innerHTML = V.viewingProfile
      ? otherProfileH()
      : V.c
      ? V.cp
        ? cprofH()
        : chatH()
      : V.t === 'grp'
      ? grpH()
      : mainH();
  }

  if (kp && $('#mi')) {
    $('#mi').value = kp;
    $('#mic').hidden = 1;
    $('#snd').hidden = 0;
  }

  const sc1 = $('.desktop-sidebar .sc') || $('.sc');
  if (sc1) {
    if (V.fade) {
      sc1.classList.add('fd');
      V.fade = 0;
    } else if (!V.rt) {
      sc1.scrollTop = st0;
    }
  }
  const msc1 = $('.desktop-main .sc');
  if (msc1 && !V.rt) {
    msc1.scrollTop = mst0;
  }
  V.rt = 0;

  if (V.demo) {
    a.insertAdjacentHTML('afterbegin', `<div class='demo' id='dm'>${t('demo')}</div>`);
  }

  if (V.contactOptionsChatId) {
    a.insertAdjacentHTML('beforeend', renderContactOptionsMenu(V.contactOptionsChatId));
  }

  // Swipe & Pull-down in chat list to reveal posts bar
  const cl0 = $('#cl');
  if (cl0) {
    let sx = 0,
      sy = 0,
      tid: string | null = null;
    cl0.onpointerdown = (e: any) => {
      sx = e.clientX;
      sy = e.clientY;
      const rw = e.target.closest && e.target.closest('.row');
      tid = rw && rw.dataset.id;
    };
    cl0.onpointerup = (e: any) => {
      const dy = e.clientY - sy;
      const dx = e.clientX - sx;
      // Pull down from top to reveal posts bar
      if (cl0.scrollTop <= 5 && dy > 45 && Math.abs(dx) < 60) {
        if (!V.storiesRevealed) {
          V.storiesRevealed = true;
          R();
          return;
        }
      } else if (dy < -45 && Math.abs(dx) < 60 && V.storiesRevealed) {
        // Swipe up to close posts bar
        V.storiesRevealed = false;
        R();
        return;
      }
      if (tid && dx < -70 && Math.abs(dy) < 40) {
        V.lt = Date.now();
        window.A('sw', tid);
      }
      tid = null;
    };
  }

  // Direct swipe on top pull handle
  const pullWrap = $('#chats_pull_wrap');
  if (pullWrap) {
    let py = 0;
    pullWrap.onpointerdown = (e: any) => { py = e.clientY; };
    pullWrap.onpointerup = (e: any) => {
      const diff = e.clientY - py;
      if (diff > 25 && !V.storiesRevealed) {
        V.storiesRevealed = true;
        R();
      } else if (diff < -25 && V.storiesRevealed) {
        V.storiesRevealed = false;
        R();
      }
    };
  }

  // Message long-press / selection
  const ms = $('.msgs');
  if (ms) {
    ms.scrollTop = ms.scrollHeight;
    ms.querySelectorAll('.mw').forEach((e: any) => {
      let q: any;
      const i = +e.dataset.i;
      e.onpointerdown = () => {
        q = setTimeout(() => {
          q = 0;
          window.A('msel', i);
        }, 450);
      };
      ['pointerup', 'pointerleave', 'pointermove', 'pointercancel'].forEach((k) => (e['on' + k] = () => clearTimeout(q)));
      e.onclick = (ev: any) => {
        if (Date.now() - (V.lt || 0) < 700) return;
        if (!V.ms && ev.target.closest && ev.target.closest('button,a,audio,video,input,.pov,.voice-msg')) return;
        window.A(V.ms ? 'mtog' : 'mtap', i);
      };
    });
  }

  // Render voice note preview box if active
  if (V.recPreview) {
    renderRecPreviewBox();
  }
}

// Authentication Views
function authH() {
  const a = V.a;
  const head = `<img class="lg" src="${LOGO}" alt="Hamudi">`;

  if (a === 'prof') {
    return `<div class="top"><h1>${t('pt')}</h1></div>
    <div style="text-align:center;padding:12px 0">
      ${av(V.nm || '?', V.ph)}
      <br>
      <label class="ln" for="pf" style="display:inline-block;margin-top:8px">${t('photo')}</label>
      <input id="pf" class="fh" type="file" accept="image/*" onchange="window.A('ph',this.files[0])">
    </div>
    <div class="f">
      <input id="un" placeholder="${t('nm')}" value="${esc(V.nm || '')}">
      <input id="ubio" placeholder="${S.lang === 'ar' ? 'نبذة / وصف (اختياري)' : 'Bio / description (optional)'}" value="${esc(
      V.bio || ''
    )}">
      <button class="btn" onclick="window.A('fin')">${t('cont')}</button>
    </div>`;
  }

  if (a === 'pid') {
    const pidArr = Array.isArray(V.pidDigits) ? V.pidDigits : Array(8).fill('');
    return (
      head +
      `<div class="f">
        <p class="note">${t('pidp')}<br><small style="opacity:0.8">${
        S.lang === 'ar'
          ? 'المعرّف الفريد يتألف من 8 أرقام بمثابة رقمك الذي يجدك به أصدقاؤك'
          : 'This unique 8-digit ID acts as your personal number'
      }</small></p>
        <div dir="ltr" style="display:flex;gap:5px;justify-content:center">
          ${[0, 1, 2, 3, 4, 5, 6, 7]
            .map(
              (i) =>
                `<input class="cd" style="width:38px" inputmode="numeric" maxlength="1" value="${
                  pidArr[i] || ''
                }" oninput="window.cdIn(${i},this)" onkeydown="window.cdKey(${i},event)" onpaste="window.cdPaste(event)">`
            )
            .join('')}
        </div>
        <button class="btn" onclick="window.A('pidok')">${t('fin')}</button>
      </div>`
    );
  }

  if (a === 'ver') {
    return (
      head +
      `<div class="f">
        <p class="note">${
          S.lang === 'ar'
            ? 'اكتب الرمز المكون من 6 أرقام للتحقق من بريدك الإلكتروني'
            : 'Enter the 6-digit verification code sent to your email'
        }<br><span dir="ltr"><b>${esc(S.acc?.e || '')}</b></span></p>
        <div dir="ltr" style="display:flex;gap:8px;justify-content:center">
          ${[0, 1, 2, 3, 4, 5]
            .map(
              (i) =>
                `<input class="cd" inputmode="numeric" maxlength="1" oninput="window.cdIn(${i},this)" onkeydown="window.cdKey(${i},event)" onpaste="window.cdPaste(event)">`
            )
            .join('')}
        </div>
        <button class="btn" onclick="window.A('ver')">${t('cont')}</button>
        <p class="note">${S.lang === 'ar' ? 'رمز التأكيد الخاص بك هو' : 'Your verification code is'}: <b dir="ltr" style="color:var(--ac);font-size:1.2em">${
        V.code
      }</b></p>
      </div>`
    );
  }

  const up = a !== 'in';
  return (
    head +
    `<div class="f">
      <input id="ue" type="email" dir="ltr" placeholder="${t('email')}" autocomplete="email">
      <input id="up" type="password" dir="ltr" maxlength="25" placeholder="${t('pass')}">
      <button class="btn" onclick="window.A('${up ? 'reg' : 'log'}')">${up ? t('create') : t('signin')}</button>
      ${up ? '' : `<button class="ln" onclick="toast(t('srv'))">${t('forgot')}</button>`}
      <button class="btn gb" onclick="window.A('google')"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg><span>${t('google')}</span></button>
      ${
        V.add
          ? `<button class="ln" onclick="window.A('canc')">${t('cancel')}</button>`
          : `<div style="display:flex;justify-content:space-around">
              <button class="ln" onclick="window.V.a='${up ? 'in' : 'up'}';window.R()">${up ? t('have') : t('create')}</button>
              <button class="ln" onclick="window.A('demo')">${t('demo')}</button>
            </div>`
      }
    </div>`
  );
}

// Posts Top Bar Component at top of Chats (Posts instead of Stories)
function renderPostsTopBar() {
  const isAr = S.lang === 'ar';
  const allPostsCombined = [
    ...(S.posts || []),
    ...getGlobalPosts()
  ];
  const uniquePostsMap = new Map();
  for (const p of allPostsCombined) {
    if (!uniquePostsMap.has(p.id)) {
      uniquePostsMap.set(p.id, p);
    }
  }
  const allUniquePosts = Array.from(uniquePostsMap.values());
  const myPosts = allUniquePosts.filter((p: any) => p.userId === S.user?.id && !p.ar);
  const friendsPosts = allUniquePosts.filter((p: any) => p.userId && p.userId !== S.user?.id && !p.ar);

  // Group friends' posts by author
  const friendsMap: { [key: string]: any } = {};
  for (const fp of friendsPosts) {
    if (!friendsMap[fp.userId]) {
      friendsMap[fp.userId] = fp;
    }
  }
  const friendsList = Object.values(friendsMap);

  const hasMyPost = myPosts.length > 0;
  const isMyPostSeen = hasMyPost && !!myPosts[0].seen;

  return `<div class="stories-bar">
    <!-- Circle 1: User's Post (+) with thin thread (blue glow if unseen, gray if seen, centered plus if no post) -->
    <div class="story-item" onclick="${
      hasMyPost
        ? `window.A('openFeedFromList',${myPosts[0].id},'${S.user?.id}')`
        : `window.A('openPostEditor')`
    }" style="cursor:pointer">
      <div class="story-ring-wrap">
        <div class="story-thin-thread ${hasMyPost ? (isMyPostSeen ? 'gray' : 'blue-glow') : 'gray'}"></div>
        ${av(S.user?.n || '?', S.user?.photo)}
        ${!hasMyPost ? `<div class="story-corner-plus">+</div>` : ''}
      </div>
      <span class="story-label">${isAr ? 'منشوري' : 'My Post'}</span>
    </div>

    <!-- Circle 2: All (الكل) Dark Grayish-Black Circle with Permanent Glowing Blue Ring and White 'الكل' in center, NO text underneath -->
    <div class="story-item" onclick="window.A('openFeedFromList', -1)" style="cursor:pointer">
      <div class="story-ring-wrap">
        <div class="story-thin-thread permanent-blue"></div>
        <div class="all-circle-btn">
          <span>${isAr ? 'الكل' : 'All'}</span>
        </div>
      </div>
      <span class="story-label" style="visibility:hidden;height:14px">${isAr ? 'الكل' : 'All'}</span>
    </div>

    <!-- Following circles: Friends who published posts with thin glowing blue/gray thread -->
    ${friendsList
      .map(
        (fp: any) =>
          `<div class="story-item" onclick="window.A('openFeedFromList',${fp.id},'${fp.userId}')" style="cursor:pointer">
            <div class="story-ring-wrap">
              <div class="story-thin-thread ${fp.seen ? 'gray' : 'blue-glow'}"></div>
              ${av(fp.authorName || (isAr ? 'صديق' : 'Friend'), fp.authorPhoto)}
            </div>
            <span class="story-label">${esc(fp.authorName || (isAr ? 'صديق' : 'Friend'))}</span>
          </div>`
      )
      .join('')}
  </div>`;
}

// Main Tab View
function mainH() {
  const tabs = [
    ['chats', 'chat'],
    ['contacts', 'user'],
    ['settings', 'gear'],
    ['me', 'me']
  ];
  const ids = Object.keys(S.chats).filter((i) => !S.chats[i].s);
  let b = '';

  if (V.t === 'chats') {
    const isAr = S.lang === 'ar';
    b = `<div id="chats_pull_wrap">
      <div class="stories-pull-indicator" onclick="window.A('toggleStoriesBar')" title="${isAr ? 'المنشورات' : 'Posts'}" style="cursor:pointer;padding:8px 0;display:flex;justify-content:center;align-items:center">
        <div class="pull-bar" style="width:42px;height:4px;border-radius:2px;background:var(--ac);opacity:0.8;margin:0 auto"></div>
      </div>
      ${V.storiesRevealed ? renderPostsTopBar() : ''}
    </div>
    <input class="search" placeholder="${t('search')}" oninput="window.V.q=this.value;document.getElementById('cl').innerHTML=window.cl()" value="${esc(
      V.q
    )}">${FC()}<div id="cl">${cl()}</div>`;
  } else if (V.t === 'contacts') {
    const isAr = S.lang === 'ar';
    const cs = ids.filter((i) => !S.chats[i].g);
    b =
      `<button class="row" onclick="window.A('inv')"><span class="av" style="background:#2f9cf4">${ic('share', 24)}</span><div class="rt"><b>${t(
        'inv'
      )}</b></div></button>
      <button class="row" onclick="window.A('calls')"><span class="av" style="background:#34c759">${ic('phone', 24)}</span><div class="rt"><b>${t(
        'calls'
      )}</b></div></button>
      <button class="row" onclick="window.A('addc')"><span class="av" style="background:var(--ac)">${ic('userplus', 24)}</span><div class="rt"><b>${t(
        'add'
      )}</b></div></button>` +
      (cs.length
        ? cs
            .map(
              (i) => {
                const c = S.chats[i];
                return `<div class="row" data-id="${i}"
                  onpointerdown="window.startContactLongPress(event, '${i}')"
                  onpointerup="window.endContactLongPress(event, '${i}', 'open')"
                  onpointerleave="window.cancelContactLongPress()"
                  onpointercancel="window.cancelContactLongPress()"
                  oncontextmenu="event.preventDefault();window.A('openContactOptions','${i}')"
                  style="cursor:pointer;position:relative">
                  ${av(c.n, c.photo)}
                  <div class="rt">
                    <b>${esc(c.n)} ${c.blocked ? `<small style="color:#ff5a5a;font-size:11px;padding:1px 5px;background:#ee1c2c22;border-radius:4px;margin-inline-start:6px">🚫 ${isAr ? 'محظور' : 'Blocked'}</small>` : ''}</b>
                    <span dir="ltr" style="text-align:right">${esc(c.p || '')}</span>
                  </div>
                  <span class="contact-more-btn" onclick="event.stopPropagation();window.A('openContactOptions','${i}')" title="${isAr ? 'خيارات' : 'Options'}" style="padding:6px;color:var(--sub);border-radius:6px;display:inline-flex;align-items:center">${ic('dotsH', 18)}</span>
                </div>`;
              }
            )
            .join('')
        : `<p class="note">${t('nocon')}</p>`);
  } else if (V.t === 'newmsg') {
    b = `<input class="search" placeholder="${t('search')}" oninput="window.V.q=this.value;document.getElementById('nl').innerHTML=window.nl()" value="${esc(
      V.q
    )}">
    <button class="row" onclick="window.A('sv')"><span class="av" style="background:var(--ac)">${ic('bookmark', 26)}</span><div class="rt"><b>${t(
      'sv'
    )}</b></div></button>
    <button class="row" onclick="window.A('addc')"><span class="av" style="background:#34c759">${ic('userplus', 24)}</span><div class="rt"><b>${t(
      'add'
    )}</b></div></button>
    <button class="row" onclick="window.A('inv')"><span class="av" style="background:#2f9cf4">${ic('share', 24)}</span><div class="rt"><b>${t(
      'inv'
    )}</b></div></button>
    <button class="row" onclick="window.A('grp')"><span class="av" style="background:#f5a623">${ic('people', 24)}</span><div class="rt"><b>${t(
      'grp'
    )}</b></div></button>
    <div id="nl">${nl()}</div>`;
  } else if (V.t === 'calls') {
    const q: any[] = [];
    Object.values(S.chats).forEach((c: any) =>
      (c.m || []).forEach((m: any) => m.t === 'c' && q.push([c.n, m, c.photo]))
    );
    b = q.length
      ? q
          .reverse()
          .map(
            ([n, m, ph]) =>
              `<div class='row'>${av(n, ph)}<div class='rt'><b>${esc(n)}</b><span>${esc(m.x)} · ${m.tm}</span></div></div>`
          )
          .join('')
      : `<p class='note'>${t('nocl')}</p>`;
  } else if (V.t === 'settings') {
    b = V.sub
      ? subH()
      : `<div class='big' style='text-align:center;padding:6px 0 12px'>
          <div style='position:relative;display:inline-block'>
            ${av(S.user?.n || '?', S.user?.photo)}
            <label class='cam-badge' for='pf5'>${ic('cam', 18)}</label>
          </div>
          <input id='pf5' class='fh' type='file' accept='image/*' onchange="window.A('ph2',this.files[0])">
          <h2 style='margin:8px 0 0;color:${NC[S.o.nc]}'>${esc(S.user?.n || '')}</h2>
          <span style='color:var(--sub);font-weight:600' dir='ltr'>${S.user?.demo ? '' : S.user?.id || ''}</span>
        </div>
        <div class='cardf'>
          ${SR.map(
            (y) =>
              `<button class='st-row' onclick="window.A('sub','${y[0]}')"><span class='sq' style='background:${y[2]}'>${ic(
                y[1],
                20
              )}</span><div class='rt'><b>${sl(y[0])}</b><span>${
                y[0] === 'lg' ? (S.lang === 'ar' ? 'العربية' : 'English') : ss(y[0])
              }</span></div></button>`
          ).join('')}
        </div>
        <div class='cardf'>
          ${[
            ['prem', 'star', '#7a6cf0'],
            ['stars', 'star', '#f5a623'],
            ['biz', 'shop', '#ee4d5f'],
            ['gift', 'gift', '#f08a24']
          ]
            .map(
              (y) =>
                `<button class='st-row' onclick="window.A('sub','${y[0]}')"><span class='sq' style='background:${y[2]}'>${ic(
                  y[1],
                  20
                )}</span><div class='rt'><b>${tr(y[0])}</b></div></button>`
            )
            .join('')}
        </div>
        <div class='cardf'>
          <div class='ct'>${tr('help')}</div>
          ${[
            ['ask', 'chat', '#f5a623'],
            ['faq', 'help', '#2f9cf4'],
            ['feat', 'bulb', '#a35be8'],
            ['pp', 'shield', '#34c759']
          ]
            .map(
              (y) =>
                `<button class='st-row' onclick="window.A('sub','${y[0]}')"><span class='sq' style='background:${y[2]}'>${ic(
                  y[1],
                  20
                )}</span><div class='rt'><b>${tr(y[0])}</b></div></button>`
            )
            .join('')}
          <button class='st-row' onclick="window.A('downloadSourceZip')">
            <span class='sq' style='background:#2f9cf4'>${ic('doc', 20)}</span>
            <div class='rt'><b>${S.lang === 'ar' ? 'تحميل الكود المصدري (ZIP)' : 'Download Source Code (ZIP)'}</b><span>hamudi-message-source.zip</span></div>
          </button>
        </div>`;
  } else {
    b = profH();
  }

  return `<div class="top">
    <h1>${V.t === 'chats' ? 'حمودي رسالة' : V.t === 'me' ? '' : t(V.t)}</h1>
    <button class="ib" style="background:none" onclick="window.A('accs')">${av(S.user?.n || '?', S.user?.photo)}</button>
    <button class="ib" style="background:none" onclick="window.A('mm')">${ic('dots')}</button>
  </div>
  ${V.menu === 2 ? MEMENU() : ''}
  ${V.menu === 3 ? ACCM() : ''}
  ${
    V.menu === 1
      ? `<div class="sheet" onclick="window.V.menu=0;window.R()"><div class="act">
          <button onclick="window.A('theme')">${ic('contrast', 22)}${t('theme')}</button>
          <button onclick="window.A('grp')">${ic('people', 22)}${t('grp')}</button>
          <button onclick="window.A('sv')">${ic('bookmark', 22)}${t('sv')}</button>
        </div></div>`
      : ''
  }
  <div class="sc">${b}</div>
  ${
    V.t === 'chats'
      ? `<button class="fab2" onclick="window.A('cam')">${ic('cam', 22)}</button>
         <button class="fab" onclick="window.A('t','newmsg')">${ic('newchat', 26)}</button>`
      : ''
  }
  ${V.t === 'contacts' ? `<button class="fab" onclick="window.A('addc')">${ic('userplus', 26)}</button>` : ''}
  <div class="tabs">
    <i class="sl" style="transform:translateX(${tabs.findIndex((x) => x[0] === V.t) * 100}%)"></i>
    ${tabs
      .map(
        (x) =>
          `<button class="${V.t === x[0] ? 'on' : ''}" onclick="window.A('t','${x[0]}')">${
            x[0] === 'me' && S.user?.photo
              ? `<img class='av' style='width:24px;height:24px' src='${S.user.photo}' alt=''>`
              : ic(x[1], 24)
          }${t(x[0])}</button>`
      )
      .join('')}
  </div>`;
}

function normalizeSearchText(txt: string): string {
  return (txt || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .trim();
}

// Long-press and context options for contacts
let contactLongPressTimer: any = null;
let contactLongPressTriggered = false;

function startContactLongPress(e: any, chatId: string) {
  contactLongPressTriggered = false;
  clearTimeout(contactLongPressTimer);
  contactLongPressTimer = setTimeout(() => {
    contactLongPressTriggered = true;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(50); } catch (_) {}
    }
    window.A('openContactOptions', chatId);
  }, 500);
}

function endContactLongPress(e: any, chatId: string, defaultAction: string = 'open') {
  clearTimeout(contactLongPressTimer);
  if (contactLongPressTriggered) {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    return;
  }
  if (defaultAction) {
    window.A(defaultAction, chatId);
  }
}

function cancelContactLongPress() {
  clearTimeout(contactLongPressTimer);
}

// 3 Options Modal on Contact Long-Press: Report, Delete, Block/Unblock
function renderContactOptionsMenu(chatId: string) {
  const c = S.chats[chatId];
  if (!c) return '';
  const isAr = S.lang === 'ar';
  const isBlocked = !!c.blocked;

  return `<div class="f-ov" style="z-index:9999" onclick="window.A('closeContactOptions')">
    <div class="f-sheet" style="padding-bottom:24px;border-radius:20px 20px 0 0;max-width:480px;margin:0 auto" onclick="event.stopPropagation()">
      <div style="width:40px;height:4px;border-radius:2px;background:var(--sub);opacity:0.4;margin:8px auto 14px"></div>
      
      <div style="display:flex;align-items:center;gap:12px;padding:0 8px 16px;border-bottom:1px solid var(--bd)">
        ${av(c.n, c.photo)}
        <div style="flex:1">
          <b style="font-size:16px;display:block">${esc(c.n)}</b>
          <span dir="ltr" style="font-size:13px;color:var(--sub);font-weight:600">${c.p ? 'ID: ' + esc(c.p) : ''}</span>
        </div>
        ${isBlocked ? `<span style="background:#ee1c2c22;color:#ff5a5a;font-size:12px;padding:3px 8px;border-radius:6px;font-weight:700">🚫 ${isAr ? 'محظور' : 'Blocked'}</span>` : ''}
      </div>

      <div style="display:flex;flex-direction:column;gap:6px;margin-top:12px">
        <!-- 1. الإبلاغ عن جهة اتصال -->
        <button class="st-row" onclick="window.A('reportContactAction','${chatId}')" style="color:var(--tx);display:flex;align-items:center;gap:12px;padding:12px 10px;border-radius:12px;width:100%;text-align:inherit;background:var(--sf);cursor:pointer">
          <span style="color:#f5a623;display:inline-flex;align-items:center">${ic('flag', 22)}</span>
          <b style="font-size:14px;font-weight:600">${isAr ? 'الإبلاغ عن جهة اتصال' : 'Report contact'}</b>
        </button>

        <!-- 2. حذف جهة اتصال -->
        <button class="st-row" onclick="window.A('deleteContactAction','${chatId}')" style="color:#ff4d4f;display:flex;align-items:center;gap:12px;padding:12px 10px;border-radius:12px;width:100%;text-align:inherit;background:var(--sf);cursor:pointer">
          <span style="color:#ff4d4f;display:inline-flex;align-items:center">${ic('trash', 22)}</span>
          <b style="font-size:14px;font-weight:600">${isAr ? 'حذف جهة اتصال' : 'Delete contact'}</b>
        </button>

        <!-- 3. حظر جهات الاتصال / إزالة الحظر -->
        <button class="st-row" onclick="window.A('toggleBlockContactAction','${chatId}')" style="color:${isBlocked ? '#34c759' : '#ff4d4f'};display:flex;align-items:center;gap:12px;padding:12px 10px;border-radius:12px;width:100%;text-align:inherit;background:var(--sf);cursor:pointer">
          <span style="display:inline-flex;align-items:center">${isBlocked ? ic('check', 22) : ic('shield', 22)}</span>
          <b style="font-size:14px;font-weight:600">${isBlocked ? (isAr ? 'إزالة الحظر' : 'Unblock contact') : (isAr ? 'حظر جهات الاتصال' : 'Block contact')}</b>
        </button>

        <button class="btn g" onclick="window.A('closeContactOptions')" style="margin-top:8px">
          ${isAr ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
    </div>
  </div>`;
}

// Chat list with 8-digit Personal ID & Name Search (shows real users, no bots)
function cl() {
  const rawQuery = (V.q || '').trim();
  const query = normalizeSearchText(rawQuery);
  const isAr = S.lang === 'ar';
  const isExact8Id = /^\d{8}$/.test(rawQuery);

  const ids = Object.keys(S.chats)
    .filter((i) => (!S.chats[i].s || S.chats[i].m.length) && inFo(i))
    .sort((a, b) => (S.chats[b].pin || 0) - (S.chats[a].pin || 0));

  let matchedChats = ids.filter((i) => {
    const c = S.chats[i];
    if (!query) return true;
    const nameNorm = normalizeSearchText(c.n);
    return (
      nameNorm.includes(query) ||
      (c.p && c.p.includes(rawQuery)) ||
      (c.m.length && normalizeSearchText(c.m[c.m.length - 1].x || '').includes(query))
    );
  });

  const reg = getUsersRegistry();

  // If user typed an exact 8-digit personal ID
  if (isExact8Id) {
    const exactUser = reg[rawQuery] || cachedServerUsers[rawQuery];
    if (exactUser && exactUser.id !== S.user?.id && !exactUser.isBot && !exactUser.bot) {
      // User found! Display first at the very top with real name, photo, and direct chat button
      return `<div style="padding:6px 12px;font-size:12px;color:var(--ac);font-weight:700">
        ${isAr ? 'تم العثور على المستخدم:' : 'User found:'}
      </div>
      <div class="row" style="background:var(--sf);border-radius:14px;border:1.5px solid var(--ac);margin:6px 0 10px;padding:10px 12px;cursor:pointer" onclick="window.A('startChatWith','${exactUser.id}')">
        ${av(exactUser.n, exactUser.photo)}
        <div class="rt">
          <b style="font-size:15px">${esc(exactUser.n)}</b>
          <span dir="ltr" style="text-align:${isAr ? 'right' : 'left'};font-weight:600">ID: <b>${esc(exactUser.id)}</b> ${exactUser.bio ? '· ' + esc(exactUser.bio) : ''}</span>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="btn" style="width:auto;height:32px;padding:0 12px;border-radius:8px;font-size:12px;margin:0" onclick="event.stopPropagation();window.A('startChatWith','${exactUser.id}')">
            ${isAr ? 'مراسلة' : 'Message'}
          </button>
          <button class="btn g" style="width:auto;height:32px;padding:0 12px;border-radius:8px;font-size:12px;margin:0" onclick="event.stopPropagation();window.A('saveContactDirect','${exactUser.id}')">
            ${isAr ? 'حفظ' : 'Save'}
          </button>
        </div>
      </div>`;
    } else {
      // No user found with this exact 8-digit ID
      return `<div style="text-align:center;padding:48px 16px;color:var(--sub);font-size:14px;font-weight:600">
        <div style="font-size:32px;margin-bottom:8px">🔍</div>
        <p style="margin:0">${isAr ? 'لا يوجد شخص بهذا المعرّف' : 'No user with this ID'}</p>
      </div>`;
    }
  }

  // General search by name or personal ID in users registry (no bots, all matching users)
  let foundUsers: any[] = [];
  if (query.length >= 1) {
    const allUsersCombined = { ...reg, ...cachedServerUsers };
    foundUsers = Object.values(allUsersCombined).filter((u: any) => {
      if (u.id === S.user?.id) return false;
      if (u.isBot || u.bot) return false;
      const uNameNorm = normalizeSearchText(u.n);
      const uId = u.id || '';
      const uUn = (u.un || '').toLowerCase();
      return uNameNorm.includes(query) || uId.includes(rawQuery) || uUn.includes(rawQuery.toLowerCase());
    });
  }

  let html = '';

  // Render all registered users matching search query (clicking starts chat immediately)
  if (foundUsers.length) {
    html += `<div style="padding:6px 12px;font-size:12px;color:var(--ac);font-weight:700">
      ${isAr ? `نتائج البحث عن المستخدمين (${foundUsers.length}):` : `Found Users (${foundUsers.length}):`}
    </div>`;
    html += foundUsers
      .map(
        (u: any) =>
          `<div class="row" style="background:var(--sf);border-radius:14px;margin-bottom:6px;cursor:pointer" onclick="window.A('startChatWith','${u.id}')">
            ${av(u.n, u.photo)}
            <div class="rt">
              <b>${esc(u.n)}</b>
              <span dir="ltr" style="text-align:${isAr ? 'right' : 'left'}">ID: <b>${esc(u.id)}</b> ${u.bio ? '· ' + esc(u.bio) : ''}</span>
            </div>
            <div style="display:flex;gap:6px;align-items:center">
              <button class="btn" style="width:auto;height:32px;padding:0 12px;border-radius:8px;font-size:12px;margin:0" onclick="event.stopPropagation();window.A('startChatWith','${u.id}')">
                ${isAr ? 'مراسلة' : 'Chat'}
              </button>
              <button class="btn g" style="width:auto;height:32px;padding:0 12px;border-radius:8px;font-size:12px;margin:0" onclick="event.stopPropagation();window.A('saveContactDirect','${u.id}')">
                ${isAr ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>`
      )
      .join('');
  }

  if (matchedChats.length) {
    html += matchedChats
      .map((i) => {
        const c = S.chats[i];
        const l = c.m[c.m.length - 1];
        return `<div class="row" data-id="${i}"
          onpointerdown="window.startContactLongPress(event, '${i}')"
          onpointerup="window.endContactLongPress(event, '${i}', 'open')"
          onpointerleave="window.cancelContactLongPress()"
          onpointercancel="window.cancelContactLongPress()"
          oncontextmenu="event.preventDefault();window.A('openContactOptions','${i}')"
          style="cursor:pointer;position:relative">
          ${c.s ? '<span class="av" style="background:var(--ac)">' + ic('bookmark', 26) + '</span>' : av(c.n, c.photo)}
          <div class="rt">
            <b>${esc(c.n)} ${c.blocked ? `<small style="color:#ff5a5a;font-size:11px;padding:1px 5px;background:#ee1c2c22;border-radius:4px;margin-inline-start:6px">🚫 ${isAr ? 'محظور' : 'Blocked'}</small>` : ''}</b>
            <span>${esc(prev(l))}</span>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
            <small>${l ? l.tm : ''}</small>
            <span class="contact-more-btn" onclick="event.stopPropagation();window.A('openContactOptions','${i}')" title="${isAr ? 'خيارات' : 'Options'}" style="padding:4px;color:var(--sub);border-radius:6px;display:inline-flex;align-items:center">${ic('dotsH', 18)}</span>
          </div>
        </div>`;
      })
      .join('');
  } else if (!foundUsers.length) {
    html = `<p class="note" style="padding-top:60px">${t('empty')}</p>`;
  }

  return html;
}

// Voice Note Player in Chat
function renderVoiceMessage(m: any, i: number) {
  const isPlaying = V.playingAudio === i;
  return `<div class="voice-msg" onclick="event.stopPropagation();window.toggleVoiceAudio(${i}, '${m.x}')">
    <div class="voice-btn">
      ${ic(isPlaying ? 'pause' : 'play', 18)}
    </div>
    <div style="flex:1;min-width:140px">
      <div class="voice-waveform">
        ${[12, 18, 24, 16, 20, 26, 14, 22, 18, 12, 24, 20, 16, 22, 14, 18, 10, 20]
          .map(
            (h, idx) =>
              `<div class="voice-bar ${isPlaying && idx % 3 === 0 ? 'active' : ''}" style="height:${h}px"></div>`
          )
          .join('')}
      </div>
      <div class="voice-progress-track">
        <div class="voice-progress-fill" id="va_prog_${i}"></div>
      </div>
      <div class="voice-info">
        <span id="va_time_${i}">0:00</span>
        <span>${S.lang === 'ar' ? 'بصمة صوتية' : 'Voice'}</span>
      </div>
    </div>
  </div>`;
}

// Active Chat View
function chatH() {
  const c = S.chats[V.c];
  if (!c) return '';
  const pin = (c.m || []).filter((m: any) => m.pin).pop();
  const ms = (c.m || []).map((m: any, i: number) => [m, i]).filter(([m]: any) => !V.fq || (m.x || '').includes(V.fq));

  const body = (m: any, i: number) =>
    m.t === 'f'
      ? `<a href="${m.x}" download="${esc(m.n)}" style="display:flex;gap:8px;align-items:center;color:inherit;text-decoration:none">${ic(
          'file',
          26
        )}<span>${esc(m.n)}<br><small>${Math.ceil(m.z / 1024)} KB</small></span></a>`
      : m.t === 'au'
      ? `<div>${esc(m.n || 'صوت')}</div><audio controls src="${m.x}" style="height:36px;max-width:220px"></audio>`
      : m.t === 'ct'
      ? `<div style="display:flex;gap:8px;align-items:center">${av(m.x)}<div><b>${esc(m.x)}</b><br><small dir="ltr">${esc(
          m.p
        )}</small></div></div>`
      : m.t === 'po'
      ? `<b>${esc(m.q)}</b><div style='font-size:.8em;opacity:.7'>${tr('pv')}</div>${((tot: number) =>
          m.o
            .map(
              (o: any, j: number) =>
                `<div class="pov" onclick="event.stopPropagation();window.A('vote',${i},${j})" style="position:relative;margin:6px 0;padding:7px 10px;border-radius:8px;overflow:hidden;background:#ffffff1a;cursor:pointer;min-width:190px">
                  <span style="position:absolute;top:0;bottom:0;left:0;width:${
                    tot ? Math.round((o.v / tot) * 100) : 0
                  }%;background:#ffffff40"></span>
                  <span style="position:relative;display:flex;justify-content:space-between;gap:10px">
                    <span>${m.vt === j ? '●' : '○'} ${esc(o.t)}</span>
                    <b>${tot ? Math.round((o.v / tot) * 100) : 0}%</b>
                  </span>
                </div>`
            )
            .join('') + `<div style='font-size:.8em;opacity:.7'>${tot} ${tr('vts')}</div>`)(
          m.o.reduce((a: number, o: any) => a + o.v, 0)
        )}`
      : m.t === 'sk'
      ? `<img src="${m.x}" alt="">`
      : m.t === 'vc'
      ? `<video class="vcb" src="${m.x}" playsinline controls onclick="this.paused?this.play():this.pause()"></video>`
      : m.t === 'vd'
      ? `<video controls src="${m.x}" style="max-width:100%;border-radius:10px"></video>`
      : m.t === 's'
      ? `<span style='font-size:64px;line-height:1'>${m.x}</span>`
      : m.t === 'v'
      ? renderVoiceMessage(m, i)
      : m.t === 'i'
      ? `<img src="${m.x}" alt="">`
      : m.t === 'l'
      ? `<a href="https://www.google.com/maps?q=${m.x}" target="_blank" rel="noopener" style="color:inherit;display:flex;gap:6px;align-items:center">${ic(
          'loc',
          18
        )}${m.x}</a>`
      : m.t === 'c'
      ? `<span style='display:flex;gap:8px;align-items:center'>${ic(
          m.x.includes('مرئية') || m.x.includes('Video') ? 'video' : 'phone',
          22
        )}${esc(m.x)}</span>`
      : `<span dir="auto">${esc(m.x)}</span>`;

  return `${V.ms ? selTop() : ''}
  <div class="top" ${V.ms ? 'hidden' : ''}>
    <button class="ib" onclick="window.A('back')">${ic('back')}</button>
    <div class="pill" onclick="window.A('openPartnerChannel', '${c.p || ''}')">
      ${c.s ? '<span class="av" style="background:var(--ac)">' + ic('bookmark', 26) + '</span>' : av(c.n, c.photo)}
      <div class="rt">
        <b>${esc(c.n)}</b>
        ${
          c.s || c.g
            ? ''
            : (() => {
                const lsText = formatLastSeen(c.p);
                const isOnline = lsText.includes('متصل') || lsText.includes('Online');
                return `<span style="font-size:11px;color:${isOnline ? '#34c759' : 'var(--sub)'};font-weight:600">${lsText}</span>`;
              })()
        }
      </div>
    </div>
    <div class="pill2">
      ${
        c.s
          ? `<button onclick="window.A('srch')">${ic('search', 22)}</button>`
          : `<button onclick="window.A('call',0)" title="مكالمة صوتية">${ic('phone', 22)}</button>
             <button onclick="window.A('call',1)" title="مكالمة فيديو">${ic('video', 22)}</button>`
      }
      <button onclick="window.V.menu=1;window.R()">${ic('dots', 22)}</button>
    </div>
  </div>
  <div class="chat" style="${bgStyle()}">
    ${
      c.blocked
        ? `<div style="background:#ee1c2c22;border:1px solid #ee1c2c55;color:#ff5a5a;padding:10px 14px;border-radius:14px;margin:8px 12px;display:flex;justify-content:space-between;align-items:center;font-size:13px;direction:rtl">
            <span>🚫 ${S.lang === 'ar' ? 'لقد قمت بحظر جهة الاتصال هذه' : 'You have blocked this contact'}</span>
            <button class="btn" style="width:auto;height:30px;padding:0 14px;font-size:12px;background:#ee1c2c;color:#fff;border-radius:8px" onclick="window.A('unblockCurrentContact')">${S.lang === 'ar' ? 'إزالة الحظر' : 'Unblock'}</button>
          </div>`
        : ''
    }
    ${pin ? `<div class="pn" style="display:flex;gap:8px;align-items:center">${ic('pin', 16)}${esc(prev(pin))}</div>` : ''}
    <div class="msgs">
      ${ms
        .map(
          ([m, i]: any) =>
            `<div class="mw ${V.ms && V.ms[i] ? 'sel' : ''}" data-i="${i}">
              ${V.ms ? `<i class='cc ${V.ms[i] ? 'on' : ''}'>${V.ms[i] ? ic('check', 14) : ''}</i>` : ''}
              <div class="m ${m.out === 0 ? 'in' : 'out'} ${m.t === 'sk' || m.t === 's' ? 'sk' : ''}">
                ${m.rep ? `<q>${esc(m.rep)}</q>` : ''}
                ${body(m, i)}
                <s>${m.tm} ${m.out === 0 ? '' : '✓✓'}</s>
                ${m.rx ? `<em>${m.rx}</em>` : ''}
              </div>
            </div>`
        )
        .join('')}
    </div>
    ${
      V.rec
        ? ''
        : `${
            V.rep != null
              ? `<div class="pn" style="display:flex;gap:8px;align-items:center">${ic('reply', 16)}<span style="flex:1">${esc(
                  prev(c.m[V.rep])
                )}</span><button onclick="window.V.rep=null;window.R()">${ic('x', 16)}</button></div>`
              : ''
          }
          ${V.emo ? EP() : ''}
          ${V.at ? ATT() : ''}
          ${V.ms ? selBar() : ''}
          <div class="bar" ${V.ms ? 'hidden' : ''}>
            <button class="ib" style="background:none" onclick="window.V.emo^=1;window.V.att=0;window.R()">${ic(
              V.emo ? 'kbd' : 'smile',
              26
            )}</button>
            <input id="mi" dir="auto" placeholder="${t('msg')}" oninput="document.getElementById('mic').hidden=!!this.value;document.getElementById('snd').hidden=!this.value" onkeydown="if(event.key==='Enter'&&window.S.o.enter)window.A('send')">
            <button class="ib" style="background:none" onclick="window.V.at=window.V.at?null:{tab:'g',imgs:[]};window.V.emo=0;window.R()">${ic(
              'clip',
              26
            )}</button>
            <button id="mic" class="go" style="touch-action:none" onpointerdown="window.mdn(event)">${ic(
              S.o.mm === 'v' ? 'cam' : 'mic',
              24
            )}</button>
            <button id="snd" class="go" hidden onclick="window.A('send')">${ic('send', 22)}</button>
          </div>`
    }
  </div>
  ${
    V.menu
      ? `<div class="sheet" onclick="window.V.menu=0;window.R()"><div class="act">
          ${c.s ? '' : `<button onclick="window.A('call',1)">${ic('video', 22)}${t('vc')}</button>`}
          <button onclick="window.A('srch')">${ic('search', 22)}${t('search')}</button>
          ${c.s ? '' : `<button onclick="window.A('fpk')">${ic('folder', 22)}${tr('afo')}</button>`}
          <button onclick="window.A('clr')">${ic('clear', 22)}${t('cl')}</button>
          <button onclick="window.A('del')">${ic('trash', 22)}${t('dc')}</button>
        </div></div>`
      : ''
  }
  ${
    V.sel != null || V.fw
      ? `<div class="sheet" onclick="window.V.sel=null;window.V.fw=0;window.V.rxm=0;window.R()">
          ${
            V.fw
              ? `<div class="act">${Object.keys(S.chats)
                  .map((i) => `<button onclick="window.A('fwd','${i}')">${esc(S.chats[i].n)}</button>`)
                  .join('')}</div>`
              : `${V.rxm ? RX() : ''}
                 <div class="rx" ${V.rxm ? 'hidden' : ''}>
                   ${RXO()
                     .map((e) => `<button onclick="window.A('rx','${e}')">${e}</button>`)
                     .join('')}
                   <button onclick="window.V.rxm=1;window.R();event.stopPropagation()" style="position:sticky;right:0;background:#888c;border-radius:50%;width:36px;height:36px;display:grid;place-items:center">${ic(
                     'chev',
                     20
                   )}</button>
                 </div>
                 <div class="act" ${V.rxm ? 'hidden' : ''}>
                   <button onclick="window.A('rep')">${ic('reply', 22)}${t('rp')}</button>
                   <button onclick="window.A('cp')">${ic('copy', 22)}${t('cp')}</button>
                   <button onclick="window.A('mfw');event.stopPropagation()">${ic('fwd', 22)}${t('fw')}</button>
                   <button onclick="window.A('pin')">${ic('pin', 22)}${t('pn')}</button>
                   <button onclick="window.A('dm')">${ic('trash', 22)}${t('dl')}</button>
                 </div>`
          }
        </div>`
      : ''
  }`;
}

// Group Creation
function grpH() {
  const cs = Object.keys(S.chats).filter((i) => !S.chats[i].s && !S.chats[i].g);
  return `<div class="top">
    <button class="ib" onclick="window.A('t','chats')">${ic('back')}</button>
    <h1>${t('grp')}</h1>
  </div>
  <div class="f"><input id="gn" placeholder="${t('gn')}"></div>
  <div class="sc">
    ${
      cs
        .map(
          (i) =>
            `<button class="row" onclick="window.V.grp['${i}']^=1;window.R()">
              ${av(S.chats[i].n, S.chats[i].photo)}
              <div class="rt"><b>${esc(S.chats[i].n)}</b></div>
              ${V.grp[i] ? '<span class="ck">' + ic('check', 16) + '</span>' : ''}
            </button>`
        )
        .join('') || `<p class="note">${t('nocon')}</p>`
    }
  </div>
  <button class="fab" onclick="window.A('mkg')">${ic('check', 26)}</button>`;
}

// Call Screen
function callH(a: any) {
  const c = V.call;
  if (!c) return;
  const ch = S.chats[c.id] || { n: 'صديق' };
  const isVideo = !!c.v;

  a.innerHTML = `<div class="call ${c.active ? 'pulse' : ''}">
    <video id="cv" playsinline muted ${isVideo && c.s ? '' : 'hidden'}></video>
    ${av(ch.n, ch.photo)}
    <h2 style="margin:0;font-size:1.6em">${esc(ch.n)}</h2>
    <p style="font-size:1.1em;opacity:0.9;margin:8px 0" id="call_status">${c.st || 'جاري الاتصال…'}</p>
    
    <div class="cb">
      <button class="${c.sp ? 'on' : ''}" onclick="window.V.call.sp^=1;window.R()">
        <i>${ic('speaker', 26)}</i>
        ${S.lang === 'ar' ? 'مكبر الصوت' : 'Speaker'}
      </button>
      <button class="${c.v ? 'on' : ''}" onclick="window.A('toggleCallVideo')">
        <i>${ic('video', 26)}</i>
        ${c.v ? (S.lang === 'ar' ? 'إيقاف الفيديو' : 'Stop Video') : S.lang === 'ar' ? 'تشغيل الفيديو' : 'Start Video'}
      </button>
      ${
        c.v
          ? `<button onclick="window.V.call.f=window.V.call.f==='user'?'environment':'user';window.media()">
              <i>${ic('flip', 26)}</i>
              ${S.lang === 'ar' ? 'قلب الكاميرا' : 'Flip'}
             </button>`
          : ''
      }
      <button class="${c.mute ? 'on' : ''}" onclick="window.A('toggleCallMute')">
        <i>${ic('mic', 26)}</i>
        ${c.mute ? (S.lang === 'ar' ? 'إلغاء الكتم' : 'Unmute') : S.lang === 'ar' ? 'كتم المايك' : 'Mute'}
      </button>
      <button class="end" onclick="window.A('end')">
        <i>${ic('phone', 26, 'rot')}</i>
        ${S.lang === 'ar' ? 'إنهاء المكالمة' : 'End Call'}
      </button>
    </div>
  </div>`;

  const vid = document.getElementById('cv') as HTMLVideoElement;
  if (vid && c.s && c.v) {
    vid.srcObject = c.s;
    vid.play().catch(() => {});
  }
}

async function media() {
  const c = V.call;
  if (!c) return;

  if (c.s) c.s.getTracks().forEach((x: any) => x.stop());
  c.s = null;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: c.v ? { facingMode: c.f || 'user' } : false
    });
    c.s = stream;
    stream.getAudioTracks().forEach((x) => (x.enabled = !c.mute));

    startRingtone();
    c.st = S.lang === 'ar' ? 'جاري الرنين…' : 'Ringing…';
    R();

    if (c.connectTimer) clearTimeout(c.connectTimer);
    c.connectTimer = setTimeout(() => {
      if (!V.call) return;
      playConnectedSound();
      V.call.active = true;
      V.call.sec = 0;
      V.call.st = '00:00';
      R();

      if (V.call.durationInterval) clearInterval(V.call.durationInterval);
      V.call.durationInterval = setInterval(() => {
        if (!V.call) return;
        V.call.sec = (V.call.sec || 0) + 1;
        const m = Math.floor(V.call.sec / 60);
        const s = V.call.sec % 60;
        V.call.st = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        const el = document.getElementById('call_status');
        if (el) el.textContent = V.call.st;
      }, 1000);
    }, 2400);
  } catch (e: any) {
    stopRingtone();
    c.st = t('perm') + ' (' + (e.name || 'error') + ')';
    c.v = 0;
    R();
  }
}

// Voice Note & Circle Video Recording Handlers
let H: any = {};

function mdn(e: any) {
  if (V.rec || V.recPreview) return;
  e.preventDefault();
  const target = (e.currentTarget || e.target) as HTMLElement;
  if (target?.setPointerCapture) {
    try {
      target.setPointerCapture(e.pointerId);
    } catch (_) {}
  }
  H = { x: e.clientX, y: e.clientY, pointerId: e.pointerId, el: target };
  target?.classList.add('mic-pulse-effect');
  if (navigator.vibrate) {
    try {
      navigator.vibrate(40);
    } catch (_) {}
  }

  H.t = setTimeout(() => {
    H.rec = 1;
    beginRec(S.o.mm);
  }, 280);

  document.addEventListener('pointermove', mmv);
  document.addEventListener('pointerup', mup);
  document.addEventListener('pointercancel', mup);
}

function mmv(e: any) {
  const r = V.rec;
  if (!r || r.lock) return;
  if (e.clientX - H.x < -80) {
    finishRec(0);
  } else if (H.y - e.clientY > 60) {
    r.lock = 1;
    recUI();
  }
}

function mup() {
  document.removeEventListener('pointermove', mmv);
  document.removeEventListener('pointerup', mup);
  document.removeEventListener('pointercancel', mup);
  clearTimeout(H.t);

  H.el?.classList.remove('mic-pulse-effect');
  const micEl = $('#mic');
  if (micEl) micEl.classList.remove('mic-pulse-effect');

  if (!H.rec) {
    S.o.mm = S.o.mm === 'v' ? 'a' : 'v';
    save();
    const m = $('#mic');
    if (m) m.innerHTML = ic(S.o.mm === 'v' ? 'cam' : 'mic', 24);
    return;
  }

  H.rec = 0;
  const r = V.rec;
  if (r && !r.lock) {
    finishRec(Date.now() - r.t0 > 700 ? 1 : 0);
  }
}

function recUI() {
  let o = document.getElementById('rov');
  if (!o) {
    o = document.createElement('div');
    o.id = 'rov';
    o.className = 'rov';
    document.body.append(o);
  }
  const r = V.rec;
  if (!r) return;
  const v = r.m === 'v';

  o.innerHTML =
    (v
      ? `<div class='vrw'><div class='cv'><video id='rv' muted playsinline></video><svg class='ring' viewBox='0 0 100 100'><circle id='ra' cx='50' cy='50' r='48' fill='none' stroke='#fff' stroke-width='1.5' pathLength='100' stroke-dasharray='100' stroke-dashoffset='100'/></svg></div></div>`
      : '') +
    (r.lock
      ? `<div class='rb'>
          <button class='ib' style='background:none' onclick='window.finishRec(0)'>${ic('trash', 24)}</button>
          <div style='flex:1;display:flex;align-items:center;justify-content:center;gap:10px;background:var(--ac);color:#fff;border-radius:22px;height:44px'>
            ${
              r.pause
                ? `<button onclick='window.A("resumeRec")' style='background:none;border:0;color:#fff;cursor:pointer' title='استئناف'>${ic('play', 20)}</button>`
                : `<button onclick='window.A("pauseRec")' style='background:none;border:0;color:#fff;cursor:pointer' title='إيقاف مؤقت'>${ic('pause', 20)}</button>`
            }
            <button onclick='window.A("previewAudioChunks")' style='background:none;border:0;color:#fff;cursor:pointer' title='استماع ومعاينة'>${ic('speaker', 20)}</button>
            <b id='rt'>0:00,0</b>
          </div>
          <button class='go' onclick='window.finishRec(1)'>${ic('send', 22)}</button>
        </div>`
      : `<div class='rb'>
          <span style='color:#e33;padding:0 6px'>●</span>
          <b id='rt'>0:00,0</b>
          <span style='flex:1;text-align:center;color:var(--ac)'>${t('cancel')}</span>
        </div>
        <span class='ib' style='position:absolute;right:20px;bottom:150px;background:var(--bar)'>${ic('lock', 20)}</span>
        <span class='go rsend'>${ic('send', 28)}</span>`);

  const rv = document.getElementById('rv') as HTMLVideoElement;
  if (rv && r.st) {
    rv.srcObject = r.st;
    rv.play().catch(() => {});
  }
}

function recX() {
  const o = document.getElementById('rov');
  if (o) o.remove();
}

async function beginRec(m: string) {
  try {
    const isVid = m === 'v';
    const st = await navigator.mediaDevices.getUserMedia(
      isVid ? { video: { facingMode: 'user' }, audio: true } : { audio: true }
    );

    if (!H.rec) {
      st.getTracks().forEach((z) => z.stop());
      return;
    }

    let mimeType = '';
    if (isVid) {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) mimeType = 'video/webm;codecs=vp9,opus';
      else if (MediaRecorder.isTypeSupported('video/mp4')) mimeType = 'video/mp4';
      else if (MediaRecorder.isTypeSupported('video/webm')) mimeType = 'video/webm';
    } else {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
      else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
      else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
    }

    const mr = mimeType ? new MediaRecorder(st, { mimeType }) : new MediaRecorder(st);
    const ch: Blob[] = [];
    const r: any = { mr, st, m, ch, t0: Date.now(), send: 0, lock: 0, pause: 0, pz: 0 };
    V.rec = r;

    mr.ondataavailable = (e) => {
      if (e.data && e.data.size) ch.push(e.data);
    };

    mr.onstop = () => {
      st.getTracks().forEach((z) => z.stop());
      recX();
      V.rec = null;
      const blob = new Blob(ch, { type: mr.mimeType || (isVid ? 'video/webm' : 'audio/webm') });
      const fr = new FileReader();
      fr.onload = () => {
        const dataUrl = fr.result as string;
        if (r.send === 1) {
          push({ t: m === 'v' ? 'vc' : 'v', x: dataUrl });
        } else if (r.send === 2) {
          // Send to preview bar so user can listen/watch before sending
          V.recPreview = { t: m === 'v' ? 'vc' : 'v', x: dataUrl, playing: false };
          R();
        } else {
          R();
        }
      };
      fr.readAsDataURL(blob);
    };

    mr.start(100);
    recUI();

    const iv = setInterval(() => {
      if (V.rec !== r) return clearInterval(iv);
      if (r.pause) return;
      const ms = Date.now() - r.t0 - r.pz;
      const e = $('#rt');
      if (e) {
        e.textContent =
          Math.floor(ms / 6e4) +
          ':' +
          String(Math.floor(ms / 1e3) % 60).padStart(2, '0') +
          ',' +
          (Math.floor(ms / 100) % 10);
      }
      const a = $('#ra');
      if (a) a.style.strokeDashoffset = String(100 - Math.min(100, ms / 600));
      if (m === 'v' && ms >= 6e4) finishRec(1);
    }, 100);
  } catch (e: any) {
    H.rec = 0;
    toast(t('perm') + ' (' + (e.name || 'error') + ')');
  }
}

function finishRec(send: number) {
  const r = V.rec;
  if (!r) return;
  r.send = send;
  if (r.mr && r.mr.state !== 'inactive') {
    r.mr.stop();
  } else {
    recX();
    V.rec = null;
    R();
  }
}

// User can pause and listen to voice note before sending
function stopAndPreviewRec() {
  const r = V.rec;
  if (!r) return;
  r.send = 2; // Preview mode
  if (r.mr && r.mr.state !== 'inactive') {
    r.mr.stop();
  }
}

function renderRecPreviewBox() {
  let box = document.getElementById('rec_preview_box');
  if (!box) {
    box = document.createElement('div');
    box.id = 'rec_preview_box';
    box.className = 'rec-preview-box';
    ($('.desktop-main') || $('#app'))?.append(box);
  }
  const p = V.recPreview;
  if (!p) {
    box.remove();
    return;
  }

  const isVideo = p.t === 'vc';
  box.innerHTML = `
    <button class="ib" style="background:none;color:#ff5a5a" onclick="window.A('discardRecPreview')">${ic('trash', 22)}</button>
    <div style="flex:1;display:flex;align-items:center;gap:10px">
      <button class="rec-preview-play" onclick="window.A('togglePlayRecPreview')">
        ${ic(p.playing ? 'pause' : 'play', 20)}
      </button>
      <span style="font-size:12px;font-weight:600">${
        isVideo ? (S.lang === 'ar' ? 'معاينة الفيديو الدائري' : 'Preview video note') : S.lang === 'ar' ? 'استماع للبصمة الصوتية' : 'Listen to voice note'
      }</span>
      ${isVideo ? `<video id="preview_vid" src="${p.x}" playsinline style="width:40px;height:40px;border-radius:50%;object-fit:cover"></video>` : ''}
    </div>
    <button class="go" onclick="window.A('sendRecPreview')">${ic('send', 22)}</button>
  `;
}

let previewAudioEl: HTMLAudioElement | null = null;
function togglePlayRecPreview() {
  const p = V.recPreview;
  if (!p) return;

  if (p.t === 'vc') {
    const v = document.getElementById('preview_vid') as HTMLVideoElement;
    if (v) {
      if (v.paused) {
        v.play().catch(() => {});
        p.playing = true;
      } else {
        v.pause();
        p.playing = false;
      }
    }
  } else {
    if (previewAudioEl) {
      previewAudioEl.pause();
      previewAudioEl = null;
      p.playing = false;
    } else {
      if (!p.x) return;
      previewAudioEl = new Audio(p.x);
      p.playing = true;
      previewAudioEl.play().catch(() => {
        p.playing = false;
        previewAudioEl = null;
        renderRecPreviewBox();
      });
      previewAudioEl.onended = () => {
        p.playing = false;
        previewAudioEl = null;
        renderRecPreviewBox();
      };
      previewAudioEl.onerror = () => {
        p.playing = false;
        previewAudioEl = null;
        renderRecPreviewBox();
      };
    }
  }
  renderRecPreviewBox();
}

// Interactive Voice Note Playback in Chat
let currentVoiceAudio: HTMLAudioElement | null = null;
let voicePlayInterval: any = null;

function toggleVoiceAudio(index: number, src: string) {
  if (currentVoiceAudio) {
    currentVoiceAudio.pause();
    currentVoiceAudio = null;
    clearInterval(voicePlayInterval);
  }

  if (V.playingAudio === index) {
    V.playingAudio = null;
    const prog = document.getElementById(`va_prog_${index}`);
    if (prog) prog.style.width = '0%';
    R();
    return;
  }

  if (!src) return;
  const audio = new Audio(src);
  currentVoiceAudio = audio;
  V.playingAudio = index;
  R();

  audio.play().catch(() => {
    V.playingAudio = null;
    currentVoiceAudio = null;
    R();
  });

  voicePlayInterval = setInterval(() => {
    const el = document.getElementById(`va_time_${index}`);
    const prog = document.getElementById(`va_prog_${index}`);
    if (el && audio) {
      const s = Math.floor(audio.currentTime);
      el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }
    if (prog && audio && audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      prog.style.width = pct + '%';
    }
  }, 100);

  audio.onended = () => {
    V.playingAudio = null;
    currentVoiceAudio = null;
    clearInterval(voicePlayInterval);
    const prog = document.getElementById(`va_prog_${index}`);
    if (prog) prog.style.width = '0%';
    R();
  };
  audio.onerror = () => {
    V.playingAudio = null;
    currentVoiceAudio = null;
    clearInterval(voicePlayInterval);
    R();
  };
}

// Fullscreen Shorts / TikTok Vertical Feed Viewer
function recordPostView(p: any) {
  if (!p) return;
  if (!Array.isArray(p.viewers)) {
    p.viewers = [];
  }
  const curUid = S.user?.id || 'me';
  if (!p.viewers.includes(curUid)) {
    p.viewers.push(curUid);
    p.views = p.viewers.length;
    save();
  } else {
    p.views = Math.max(p.viewers.length, 1);
  }
  p.seen = true;
}

function updateFeedOverlays(p: any, skipCommentsRerender = false) {
  const existing = document.querySelector('.shorts-modal') as HTMLElement;
  if (!existing || !p) {
    R();
    return;
  }
  const isLiked = !!p.liked;

  const likeBtn = document.getElementById('feed_like_btn');
  if (likeBtn) {
    likeBtn.classList.toggle('liked', isLiked);
    const sp = likeBtn.querySelector('span');
    if (sp) sp.textContent = String(p.likes || 0);
  }

  const commBtn = document.getElementById('feed_comm_btn');
  if (commBtn) {
    const sp = document.getElementById('feed_comm_count');
    if (sp) sp.textContent = String((p.comments || []).length);
  }

  const commCont = document.getElementById('feed_comm_overlay');
  if (commCont && !skipCommentsRerender) {
    const existingSheet = commCont.querySelector('.comments-sheet');
    const listEl = commCont.querySelector('.comments-list') as HTMLElement | null;
    const prevScroll = listEl ? listEl.scrollTop : 0;
    const wasAlreadyOpen = !!existingSheet;
    commCont.innerHTML = V.commentsOpen ? renderCommentsSheet(p, wasAlreadyOpen) : '';
    if (V.commentsOpen && wasAlreadyOpen) {
      const newList = commCont.querySelector('.comments-list') as HTMLElement | null;
      if (newList) newList.scrollTop = prevScroll;
    }
  }

  const infoCont = document.getElementById('feed_info_overlay');
  if (infoCont) {
    infoCont.innerHTML = V.feedInfoOpen ? renderPostInfoDrawer(p) : '';
  }

  const delCont = document.getElementById('feed_del_overlay');
  if (delCont) {
    delCont.innerHTML = V.showDeleteConfirm ? renderDeleteConfirmModal(p) : '';
  }

  const optCont = document.getElementById('feed_opt_overlay');
  if (optCont) {
    optCont.innerHTML = V.activeCommentMenu ? renderCommentOptionsMenu(p) : '';
  }
}

function renderCommentOptionsMenu(p: any) {
  const isAr = S.lang === 'ar';
  const cId = V.activeCommentMenu;
  const c = (p.comments || []).find((x: any) => x.id === cId);
  if (!c) return '';

  const isPostOwner = p.userId === S.user?.id || (!p.userId && !p.authorName);
  const isCommentAuthor = c.authorName === S.user?.n;

  return `<div class="confirm-modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px)" onclick="if(event.target===this){window.A('closeCommentOptions');}">
    <div class="confirm-card" style="background:#141416;border:2px solid #2c2c32;box-shadow:0 12px 36px rgba(0,0,0,0.9);border-radius:20px;padding:20px 18px;max-width:320px;width:100%;color:#fff;direction:rtl;text-align:right">
      <b style="font-size:16px;display:block;margin-bottom:14px;color:#fff">${isAr ? 'خيارات التعليق' : 'Comment Options'}</b>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${
          isCommentAuthor
            ? `<!-- My comment: Delete, Edit, and if post owner: Pin, Creator Heart -->
               <button class="st-row" style="background:#1e1e24;border-radius:12px;padding:10px 12px;border:0;color:#fff;cursor:pointer" onclick="window.A('deleteCommentFromMenu',${c.id})">
                 <span class="sq" style="background:#ee1c2c;border-radius:10px">${ic('trash', 18)}</span>
                 <div class="rt"><b style="color:#ee1c2c">${isAr ? 'حذف التعليق' : 'Delete Comment'}</b></div>
               </button>
               <button class="st-row" style="background:#1e1e24;border-radius:12px;padding:10px 12px;border:0;color:#fff;cursor:pointer" onclick="window.A('editCommentFromMenu',${c.id})">
                 <span class="sq" style="background:#2f9cf4;border-radius:10px">${ic('pen', 18)}</span>
                 <div class="rt"><b style="color:#fff">${isAr ? 'تعديل التعليق' : 'Edit Comment'}</b></div>
               </button>
               ${
                 isPostOwner
                   ? `<button class="st-row" style="background:#1e1e24;border-radius:12px;padding:10px 12px;border:0;color:#fff;cursor:pointer" onclick="window.A('toggleCommentPin',${c.id})">
                        <span class="sq" style="background:#2f9cf4;border-radius:10px">${ic('pin', 18)}</span>
                        <div class="rt"><b style="color:#fff">${c.pinned ? (isAr ? 'إلغاء تثبيت التعليق' : 'Unpin comment') : (isAr ? 'تثبيت التعليق' : 'Pin comment')}</b></div>
                      </button>
                      <button class="st-row" style="background:#1e1e24;border-radius:12px;padding:10px 12px;border:0;color:#fff;cursor:pointer" onclick="window.A('toggleCommentHeart',${c.id})">
                        <span class="sq" style="background:#ff2b54;border-radius:10px">❤️</span>
                        <div class="rt"><b style="color:#fff">${c.creatorHeart ? (isAr ? 'إزالة قلب صاحب المنشور' : 'Remove Creator Heart') : (isAr ? 'وضع قلب صاحب المنشور' : 'Add Creator Heart')}</b></div>
                      </button>`
                   : ''
               }`
            : isPostOwner
            ? `<!-- Someone else's comment & I am post owner: Delete, Report, Pin, Reply, Creator Heart -->
               <button class="st-row" style="background:#1e1e24;border-radius:12px;padding:10px 12px;border:0;color:#fff;cursor:pointer" onclick="window.A('deleteCommentFromMenu',${c.id})">
                 <span class="sq" style="background:#ee1c2c;border-radius:10px">${ic('trash', 18)}</span>
                 <div class="rt"><b style="color:#ee1c2c">${isAr ? 'حذف التعليق' : 'Delete Comment'}</b></div>
               </button>
               <button class="st-row" style="background:#1e1e24;border-radius:12px;padding:10px 12px;border:0;color:#fff;cursor:pointer" onclick="window.A('reportCommentFromMenu',${c.id})">
                 <span class="sq" style="background:#f5a623;border-radius:10px">${ic('flag', 18)}</span>
                 <div class="rt"><b style="color:#fff">${isAr ? 'الإبلاغ عن التعليق' : 'Report Comment'}</b></div>
               </button>
               <button class="st-row" style="background:#1e1e24;border-radius:12px;padding:10px 12px;border:0;color:#fff;cursor:pointer" onclick="window.A('toggleCommentPin',${c.id})">
                 <span class="sq" style="background:#2f9cf4;border-radius:10px">${ic('pin', 18)}</span>
                 <div class="rt"><b style="color:#fff">${c.pinned ? (isAr ? 'إلغاء تثبيت التعليق' : 'Unpin comment') : (isAr ? 'تثبيت التعليق' : 'Pin comment')}</b></div>
               </button>
               <button class="st-row" style="background:#1e1e24;border-radius:12px;padding:10px 12px;border:0;color:#fff;cursor:pointer" onclick="window.A('replyToCommentFromMenu',${c.id})">
                 <span class="sq" style="background:#34c759;border-radius:10px">${ic('reply', 18)}</span>
                 <div class="rt"><b style="color:#fff">${isAr ? 'الرد على التعليق' : 'Reply to Comment'}</b></div>
               </button>
               <button class="st-row" style="background:#1e1e24;border-radius:12px;padding:10px 12px;border:0;color:#fff;cursor:pointer" onclick="window.A('toggleCommentHeart',${c.id})">
                 <span class="sq" style="background:#ff2b54;border-radius:10px">❤️</span>
                 <div class="rt"><b style="color:#fff">${c.creatorHeart ? (isAr ? 'إزالة قلب صاحب المنشور' : 'Remove Creator Heart') : (isAr ? 'وضع قلب صاحب المنشور' : 'Add Creator Heart')}</b></div>
               </button>`
            : `<!-- Someone else's comment & I am viewer: Reply, Report -->
               <button class="st-row" style="background:#1e1e24;border-radius:12px;padding:10px 12px;border:0;color:#fff;cursor:pointer" onclick="window.A('replyToCommentFromMenu',${c.id})">
                 <span class="sq" style="background:#34c759;border-radius:10px">${ic('reply', 18)}</span>
                 <div class="rt"><b style="color:#fff">${isAr ? 'الرد على التعليق' : 'Reply to Comment'}</b></div>
               </button>
               <button class="st-row" style="background:#1e1e24;border-radius:12px;padding:10px 12px;border:0;color:#fff;cursor:pointer" onclick="window.A('reportCommentFromMenu',${c.id})">
                 <span class="sq" style="background:#f5a623;border-radius:10px">${ic('flag', 18)}</span>
                 <div class="rt"><b style="color:#fff">${isAr ? 'الإبلاغ عن التعليق' : 'Report Comment'}</b></div>
               </button>`
        }
      </div>
      <div style="margin-top:14px;display:flex;justify-content:flex-end">
        <button class="btn" style="background:#282830;border:1px solid #383842;color:#fff;height:38px;padding:0 20px;border-radius:12px;width:auto" onclick="window.A('closeCommentOptions')">${isAr ? 'إلغاء' : 'Cancel'}</button>
      </div>
    </div>
  </div>`;
}

function feedH(a: any) {
  const feed = V.feed;
  if (!feed || !feed.posts || !feed.posts.length) {
    V.feed = null;
    R();
    return;
  }

  const p = feed.posts[feed.index];
  if (!p) return;
  recordPostView(p);

  const isVideo = p.t === 'vd';
  const isLiked = !!p.liked;
  const isAr = S.lang === 'ar';

  const existingFeed = document.querySelector('.shorts-modal') as HTMLElement;
  if (existingFeed && existingFeed.dataset.postId === String(p.id)) {
    updateFeedOverlays(p);
    return;
  }

  const prevPost = feed.index > 0 ? feed.posts[feed.index - 1] : null;
  const nextPost = feed.index < feed.posts.length - 1 ? feed.posts[feed.index + 1] : null;

  const renderSlide = (postItem: any, cls: string, isCurrent: boolean) => {
    if (!postItem) return '';
    const isVid = postItem.t === 'vd';
    const itemLiked = !!postItem.liked;
    const authorId = postItem.userId || S.user?.id || '';
    const authorName = postItem.authorName || S.user?.n || (isAr ? 'مستخدم' : 'User');
    const authorPhoto = postItem.authorPhoto || S.user?.photo;
    return `<div class="shorts-slide ${cls}">
      ${
        isVid && postItem.x
          ? `<video class="shorts-media" ${
              isCurrent
                ? 'id="shorts_video" autoplay loop playsinline webkit-playsinline preload="auto"'
                : 'muted loop playsinline webkit-playsinline preload="auto" onloadeddata="try{if(this.paused&&this.currentTime===0)this.currentTime=0.05}catch(e){}"'
            } src="${esc(postItem.x)}"></video>`
          : postItem.x
          ? `<img class="shorts-media" src="${esc(postItem.x)}" alt="" onerror="this.style.display='none'">`
          : `<div class="shorts-media" style="background:#111"></div>`
      }
      <div class="shorts-meta ${isAr ? 'is-ar' : 'is-en'}" style="pointer-events:${isCurrent ? 'auto' : 'none'}">
        <h3>
          <span ${isCurrent ? `onclick="window.A('viewAuthorProfile','${authorId}')" style="cursor:pointer"` : ''}>@${esc(
            authorName
          )}</span>
          <span style="font-size:11px;opacity:0.75;font-weight:normal">${postItem.privacy === 'contacts' ? (isAr ? '👥 جهات اتصالي' : '👥 Contacts') : '🌍'}</span>
        </h3>
        <p>${esc(postItem.cap || postItem.desc || postItem.title || '')}</p>
      </div>

      <!-- Vertical Action Sidebar attached inside each slide so buttons flip/move together with clip -->
      <div class="shorts-sidebar ${isAr ? 'is-ar' : 'is-en'}" style="pointer-events:${isCurrent ? 'auto' : 'none'}">
        <div class="shorts-author-badge" ${isCurrent ? `onclick="window.A('viewAuthorProfile','${authorId}')"` : ''}>
          ${av(authorName, authorPhoto)}
        </div>

        <button ${isCurrent ? 'id="feed_like_btn"' : ''} class="shorts-btn ${itemLiked ? 'liked' : ''}" ${isCurrent ? `onclick="window.A('toggleFeedLike')"` : ''}>
          <i>${ic('heart', 24)}</i>
          <span>${postItem.likes || 0}</span>
        </button>

        <button ${isCurrent ? 'id="feed_comm_btn"' : ''} class="shorts-btn" ${isCurrent ? `onclick="window.A('openFeedComments')"` : ''}>
          <i>${ic('comment', 24)}</i>
          <span ${isCurrent ? 'id="feed_comm_count"' : ''}>${(postItem.comments || []).length}</span>
        </button>

        <button class="shorts-btn" ${isCurrent ? `onclick="window.A('sharePost')"` : ''}>
          <i>${ic('share', 24)}</i>
          <span>${isAr ? 'مشاركة' : 'Share'}</span>
        </button>

        <button class="shorts-btn" ${isCurrent ? `onclick="window.A('openFeedMenu')"` : ''}>
          <i>${ic('dotsH', 22)}</i>
          <span>...</span>
        </button>
      </div>
    </div>`;
  };

  a.innerHTML = `<div class="shorts-modal" data-post-id="${p.id}">
    <div class="shorts-top-bar">
      <button class="ib" style="background:#00000066;color:#fff" onclick="window.A('closeFeed')">${ic('back')}</button>
      <div style="font-weight:700;font-size:14px;text-shadow:0 1px 4px #000">${esc(p.title || (isAr ? 'منشور' : 'Post'))}</div>
      <button class="ib" id="feed_mute_btn" style="background:#00000066;color:#fff" onclick="window.A('toggleFeedSound')">${ic(V.feedMuted ? 'volmute' : 'vol', 20)}</button>
    </div>

    <div class="shorts-container" id="shorts_touch_area">
      <div class="shorts-track" id="shorts_track">
        ${renderSlide(prevPost, 'prev-slide', false)}
        ${renderSlide(p, 'cur-slide', true)}
        ${renderSlide(nextPost, 'next-slide', false)}
      </div>
      <div id="feed_pp_indicator" class="shorts-pp-indicator" style="display:none"></div>
      <div id="feed_heart_burst" class="shorts-heart-burst" style="display:none">❤️</div>
    </div>

    ${
      feed.posts.length > 1
        ? `<div class="shorts-nav-arrows">
            <button class="shorts-nav-btn" style="${feed.index <= 0 ? 'opacity:0.35' : ''}" onclick="event.stopPropagation();window.A('prevFeedPost')" title="${isAr ? 'السابق' : 'Previous'}">▲</button>
            <button class="shorts-nav-btn" style="${feed.index >= feed.posts.length - 1 ? 'opacity:0.35' : ''}" onclick="event.stopPropagation();window.A('nextFeedPost')" title="${isAr ? 'التالي' : 'Next'}">▼</button>
          </div>`
        : ''
    }

    <!-- Dynamic In-Place Overlays -->
    <div id="feed_comm_overlay">${V.commentsOpen ? renderCommentsSheet(p) : ''}</div>
    <div id="feed_info_overlay">${V.feedInfoOpen ? renderPostInfoDrawer(p) : ''}</div>
    <div id="feed_del_overlay">${V.showDeleteConfirm ? renderDeleteConfirmModal(p) : ''}</div>
    <div id="feed_opt_overlay">${V.activeCommentMenu ? renderCommentOptionsMenu(p) : ''}</div>
  </div>`;

  const sv = document.getElementById('shorts_video') as HTMLVideoElement;
  if (sv) {
    sv.setAttribute('playsinline', '');
    sv.setAttribute('webkit-playsinline', '');
    sv.muted = !!V.feedMuted;
    sv.volume = 1.0;
    const tryPlay = () => {
      sv.play().catch(() => {
        sv.muted = true;
        V.feedMuted = true;
        V.browserAutoplayMuted = true;
        const mb = document.getElementById('feed_mute_btn');
        if (mb) mb.innerHTML = ic('volmute', 20);
        sv.play().catch(() => {});
      });
    };
    sv.oncanplay = () => {
      if (sv.paused) tryPlay();
    };
    sv.onloadeddata = () => {
      if (sv.paused) tryPlay();
    };
    tryPlay();
  }

  // Interactive TikTok Touch Coordinator: Live Slow-Drag Peek + Snap / Flick + Mouse Wheel + Tap
  const area = document.getElementById('shorts_touch_area');
  const track = document.getElementById('shorts_track');
  if (area && track) {
    let startY = 0;
    let startX = 0;
    let currentDy = 0;
    let dragging = false;
    let hasMoved = false;
    let startTime = 0;
    let wheelCooldown = 0;

    area.onwheel = (e: WheelEvent) => {
      e.preventDefault();
      if (V.feedAnimating) return;
      const now = Date.now();
      if (now - wheelCooldown < 420) return;
      if (e.deltaY > 20) {
        wheelCooldown = now;
        window.A('nextFeedPost');
      } else if (e.deltaY < -20) {
        wheelCooldown = now;
        window.A('prevFeedPost');
      }
    };

    area.onpointerdown = (e) => {
      if (V.feedAnimating) return;
      const tgt = e.target as HTMLElement | null;
      if (tgt && tgt.closest('.shorts-sidebar, .shorts-author-badge, .shorts-nav-arrows, button, a, input, textarea')) {
        return;
      }
      startY = e.clientY;
      startX = e.clientX;
      currentDy = 0;
      dragging = true;
      hasMoved = false;
      startTime = Date.now();
      track.style.transition = 'none';
      try {
        area.setPointerCapture(e.pointerId);
      } catch (_) {}
    };

    area.onpointermove = (e) => {
      if (!dragging || V.feedAnimating) return;
      const rawDy = e.clientY - startY;
      const rawDx = e.clientX - startX;
      if (Math.abs(rawDy) > 8 || Math.abs(rawDx) > 8) {
        hasMoved = true;
      }
      if (Math.abs(rawDy) >= Math.abs(rawDx) && hasMoved) {
        let effectiveDy = rawDy;
        if ((rawDy > 0 && !prevPost) || (rawDy < 0 && !nextPost)) {
          effectiveDy = rawDy * 0.25;
        }
        currentDy = effectiveDy;
        track.style.transform = `translate3d(0, ${effectiveDy}px, 0)`;
      }
    };

    const endDrag = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      try {
        area.releasePointerCapture(e.pointerId);
      } catch (_) {}

      const rawDy = e.clientY - startY;
      const elapsed = Math.max(1, Date.now() - startTime);
      const velocity = Math.abs(rawDy) / elapsed;
      const threshold = Math.min(110, (area.clientHeight || 600) * 0.22);

      if (hasMoved && Math.abs(currentDy) > 10) {
        if (rawDy < 0 && nextPost && (Math.abs(rawDy) >= threshold || (velocity > 0.35 && Math.abs(rawDy) > 30))) {
          window.A('nextFeedPost');
          return;
        }
        if (rawDy > 0 && prevPost && (Math.abs(rawDy) >= threshold || (velocity > 0.35 && Math.abs(rawDy) > 30))) {
          window.A('prevFeedPost');
          return;
        }
        // Snap smoothly back to current post
        track.style.transition = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)';
        track.style.transform = 'translate3d(0, 0, 0)';
        return;
      }

      if (hasMoved) return;

      // Tap handling (single = play/pause, double = heart)
      const now = Date.now();
      const lastTap = (window as any)._lastFeedTap || 0;
      if (now - lastTap < 300) {
        clearTimeout((window as any)._feedTapTimer);
        (window as any)._lastFeedTap = 0;
        window.A('handleFeedDoubleTap');
      } else {
        (window as any)._lastFeedTap = now;
        (window as any)._feedTapTimer = setTimeout(() => {
          (window as any)._lastFeedTap = 0;
          window.A('handleFeedSingleTap');
        }, 300);
      }
    };

    area.onpointerup = endDrag;
    area.onpointercancel = endDrag;
  }
}

// Instant Delete Confirmation Modal (Solid Black Backdrop and Frame)
function renderDeleteConfirmModal(p: any) {
  const isAr = S.lang === 'ar';
  return `<div class="confirm-modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.88);z-index:1000000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)" onclick="if(event.target===this){window.A('closeDeleteConfirm');}">
    <div class="confirm-card" style="background:#121214;border:2px solid #28282c;box-shadow:0 12px 36px rgba(0,0,0,0.95);border-radius:22px;padding:26px 20px;text-align:center;max-width:340px;width:100%;color:#fff;direction:rtl">
      <div style="font-size:36px;margin-bottom:10px">🗑️</div>
      <b style="font-size:17px;color:#fff;display:block;margin-bottom:6px">${isAr ? 'حذف المنشور' : 'Delete Post'}</b>
      <p style="font-size:14px;color:#a0a0ab;margin:0 0 22px;line-height:1.5">${isAr ? 'هل أنت متأكد من حذف هذا المنشور؟' : 'Are you sure you want to delete this post?'}</p>
      <div style="display:flex;gap:10px;justify-content:center;width:100%">
        <button class="btn" style="flex:1;background:#242429;border:1px solid #383840;color:#fff;box-shadow:none;border-radius:14px;height:42px" onclick="window.A('closeDeleteConfirm')">${isAr ? 'إلغاء' : 'Cancel'}</button>
        <button class="btn" style="flex:1;background:#ee1c2c;color:#fff;box-shadow:0 4px 12px rgba(238,28,44,0.4);border-radius:14px;height:42px" onclick="window.A('executeDeletePost',${p.id})">${isAr ? 'نعم' : 'Yes'}</button>
      </div>
    </div>
  </div>`;
}

// Three Dots (...) Info Drawer
function renderPostInfoDrawer(p: any) {
  const isAr = S.lang === 'ar';
  const isOwner = p.userId === S.user?.id || (!p.userId && !p.authorName);
  const views = typeof p.views === 'number' ? p.views : 1;
  const likes = p.likes || 0;

  const d = p.created ? new Date(p.created) : new Date();
  const yearMonth = p.yearMonth || (isAr
    ? `${d.getFullYear()} - ${d.toLocaleString('ar-EG', { month: 'long' })}`
    : `${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`);
  const timeStr = p.timeStr || (isAr
    ? `الساعة ${p.tm || d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`
    : `Time: ${p.tm || d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`);

  const desc = p.cap || p.desc || (isAr ? 'لا يوجد وصف لهذا المنشور' : 'No description provided');
  const isLong = desc.length > 70;
  const showFull = !!V.showFullDesc;
  const displayDesc = isLong && !showFull ? desc.slice(0, 70) + '…' : desc;

  return `<div class="post-info-sheet">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid #8882;padding-bottom:10px">
      <b style="font-size:16px">${isAr ? 'تفاصيل ومعلومات المنشور' : 'Post Details'}</b>
      <button class="ib" style="width:32px;height:32px" onclick="window.A('closeFeedMenu')">${ic('x', 20)}</button>
    </div>

    <!-- 1. Stats: Authentic Views and Likes -->
    <div class="post-stats-grid">
      <div class="post-stat-box">
        <div class="val">${views}</div>
        <div class="lbl">👁️ ${isAr ? 'عدد المشاهدات' : 'Views'}</div>
      </div>
      <div class="post-stat-box">
        <div class="val">${likes}</div>
        <div class="lbl">❤️ ${isAr ? 'عدد الإعجابات' : 'Likes'}</div>
      </div>
    </div>

    <!-- 2. Publish Date: Year and Month first, then exact Time -->
    <div class="post-date-card">
      <div class="post-date-year-month">📅 ${yearMonth}</div>
      <div class="post-date-time">🕒 ${timeStr}</div>
    </div>

    <!-- 3. Post Title -->
    <div class="post-title-text">${esc(p.title || (isAr ? 'منشور' : 'Post'))}</div>

    <!-- 4. Post Description with Read More button -->
    <div class="post-desc-text">
      ${esc(displayDesc)}
      ${
        isLong
          ? `<br><button class="post-read-more-btn" onclick="window.A('toggleFullDesc')">${
              showFull ? (isAr ? 'عرض أقل' : 'Show less') : isAr ? 'عرض المزيد للقراءة' : 'Read more'
            }</button>`
          : ''
      }
    </div>

    <!-- 5. Actions: Download & Save in List -->
    <div class="post-actions-list">
      <button class="st-row" onclick="window.A('downloadFeedPost')">
        <span class="sq" style="background:#2f9cf4">${ic('download', 20)}</span>
        <div class="rt"><b>${isAr ? 'تنزيل وحفظ في الهاتف' : 'Download Media'}</b><span>${p.t === 'vd' ? 'MP4' : 'JPG'}</span></div>
      </button>

      <button class="st-row" onclick="window.A('savePostToList')">
        <span class="sq" style="background:#f5a623">${ic('bookmark', 20)}</span>
        <div class="rt"><b>${isAr ? 'حفظ في قائمة المحفوظات' : 'Save to bookmarks'}</b></div>
      </button>
    </div>

    <!-- 6. Owner Only Delete Button (Rectangular at very bottom) -->
    ${
      isOwner
        ? `<div style="margin-top:16px">
            <button class="post-owner-delete-btn" onclick="window.A('promptDeletePost')">
              ${ic('trash', 20)}
              <span>${isAr ? 'حذف المنشور' : 'Delete Post'}</span>
            </button>
          </div>`
        : ''
    }
  </div>`;
}

// Comments Sheet Reaches Half of Screen (50%) - YouTube Style with Nested Replies & Three Dots
function renderCommentsSheet(post: any, skipAnim = false) {
  const isAr = S.lang === 'ar';
  const comms = [...(post.comments || [])];
  comms.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const isPostOwner = post.userId === S.user?.id || (!post.userId && !post.authorName);
  const ownerPhoto = post.authorPhoto || (isPostOwner ? S.user?.photo : '');
  const ownerName = post.authorName || (isPostOwner ? S.user?.n : 'صاحب المنشور') || '؟';

  return `<div class="comments-sheet" ${skipAnim ? 'style="animation:none"' : ''}>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #8882">
      <b>${isAr ? 'التعليقات' : 'Comments'} (${comms.length})</b>
      <button class="ib" style="width:32px;height:32px" onclick="window.A('closeFeedComments')">${ic('x', 20)}</button>
    </div>

    <div class="comments-list">
      ${
        comms.length
          ? comms
              .map((c: any) => {
                const isCommentAuthor = c.authorName === S.user?.n;
                const canManage = isPostOwner || isCommentAuthor;
                const replies = c.replies || [];
                const isExpanded = !!(V.openReplies && V.openReplies[c.id]);

                return `<div class="comment-row ${c.pinned ? 'is-pinned' : ''}">
                  ${av(c.authorName, c.authorPhoto)}
                  <div class="comment-bubble" style="flex:1">
                    ${c.pinned ? `<div class="pinned-tag">${ic('pin', 12)} ${isAr ? `مثبت بواسطة ${esc(ownerName)}` : `Pinned by ${esc(ownerName)}`}</div>` : ''}
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <b style="font-size:12px;color:var(--ac)">${esc(c.authorName)}</b>
                      <small style="font-size:10px;opacity:0.6">${c.tm || ''}</small>
                    </div>
                    <div style="font-size:13px;margin:3px 0">${esc(c.text)}</div>

                    <div class="comment-actions" style="display:flex;align-items:center;gap:12px;margin-top:4px">
                      <button onclick="window.A('toggleCommentLike', ${c.id || 0})">
                        ${c.liked ? '❤️' : '🤍'} ${c.likes || 0}
                      </button>
                      <button onclick="window.A('replyToComment', ${c.id}, '${esc(c.authorName)}')">
                        ${isAr ? 'رد' : 'Reply'}
                      </button>
                      ${
                        c.creatorHeart
                          ? `<span class="yt-channel-heart" title="${isAr ? 'أعجب به صاحب المنشور' : 'Liked by creator'}">
                              <span style="width:20px;height:20px;border-radius:50%;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:var(--ac);color:#fff;font-size:10px;font-weight:700;border:1px solid var(--bd)">
                                ${ownerPhoto ? `<img src="${ownerPhoto}" style="width:100%;height:100%;object-fit:cover" alt="">` : esc(ownerName[0])}
                              </span>
                              <span class="yt-channel-heart-badge">❤️</span>
                            </span>`
                          : ''
                      }
                      <button onclick="event.stopPropagation();window.A('openCommentOptions', ${c.id})" title="${isAr ? 'خيارات' : 'Options'}" style="margin-inline-start:auto;opacity:0.85;font-weight:700;font-size:16px;padding:2px 8px;background:none;border:0;color:var(--tx);cursor:pointer">
                        •••
                      </button>
                    </div>

                    ${
                      replies.length > 0
                        ? `<div class="yt-replies-toggle" onclick="window.A('toggleRepliesThread', ${c.id})" style="cursor:pointer">
                            <span class="yt-line">────</span>
                            <span style="color:var(--ac);font-weight:700;font-size:11px">${isExpanded ? (isAr ? 'إخفاء الردود' : 'Hide replies') : (isAr ? `عرض الردود (${replies.length})` : `View replies (${replies.length})`)}</span>
                          </div>
                          ${
                            isExpanded
                              ? `<div class="yt-reply-thread">
                                  ${replies
                                    .map(
                                      (rep: any) =>
                                        `<div class="yt-reply-row">
                                          ${av(rep.authorName, rep.authorPhoto)}
                                          <div class="yt-reply-bubble">
                                            <div style="display:flex;justify-content:space-between;align-items:center">
                                              <b style="font-size:11px;color:var(--ac)">${esc(rep.authorName)}</b>
                                              <small style="font-size:9px;opacity:0.6">${rep.tm || ''}</small>
                                            </div>
                                            <div style="font-size:12px;margin:2px 0">${esc(rep.text)}</div>
                                          </div>
                                        </div>`
                                    )
                                    .join('')}
                                </div>`
                              : ''
                          }`
                        : ''
                    }
                  </div>
                </div>`;
              })
              .join('')
          : `<div style="text-align:center;padding:30px 16px;color:var(--sub)">
              <p style="font-size:14px;font-weight:700;margin:0 0 4px">${isAr ? 'لا توجد تعليقات بعد' : 'No comments yet'}</p>
              <p style="font-size:12px;opacity:0.8;margin:0">${isAr ? 'كن أول من يشارك برأيه ويضع تعليقاً!' : 'Be the first to share your thoughts!'}</p>
            </div>`
      }
    </div>

    ${
      V.replyingTo
        ? `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 14px;font-size:11px;background:var(--sf);color:var(--ac);border-top:1px solid #8882">
            <span>${isAr ? 'الرد على' : 'Replying to'} @${esc(V.replyingTo)}</span>
            <button style="background:none;border:0;color:inherit;cursor:pointer;font-size:13px" onclick="window.A('cancelReply')">✕</button>
          </div>`
        : ''
    }

    <div style="padding:8px 12px;display:flex;gap:8px;background:var(--sf);border-top:1px solid #8882">
      <input id="new_comm_input" class="fi" placeholder="${
        V.replyingTo
          ? isAr
            ? `اكتب ردك لـ @${V.replyingTo}…`
            : `Reply to @${V.replyingTo}…`
          : isAr
          ? 'اكتب تعليقاً…'
          : 'Write a comment…'
      }" onkeydown="if(event.key==='Enter')window.A('addComment')">
      <button class="go" style="width:40px;height:40px" onclick="window.A('addComment')">${ic('send', 18)}</button>
    </div>
  </div>`;
}

// Media Editor Modal (Crop, Rotate, Filter, Add Text)
function editorH(a: any) {
  const ed = V.editor;
  if (!ed) return;

  a.innerHTML = `<div class="editor-modal">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#1a1a1c">
      <button class="ib" style="color:#fff" onclick="window.V.editor=null;window.R()">${ic('x')}</button>
      <b style="font-size:15px">${S.lang === 'ar' ? 'تعديل الصورة أو الفيديو' : 'Edit Media'}</b>
      <button class="btn" style="width:auto;padding:0 18px;height:36px;font-size:13px" onclick="window.A('finishEditingMedia')">${
        S.lang === 'ar' ? 'التالي' : 'Next'
      }</button>
    </div>

    <div class="editor-preview-wrap">
      <canvas id="editor_canvas" class="editor-canvas"></canvas>
    </div>

    <div class="editor-toolbar">
      <button class="editor-tool-btn" onclick="window.A('editorRotate')">
        ${ic('rotate', 24)}
        <span>${S.lang === 'ar' ? 'تدوير' : 'Rotate'}</span>
      </button>

      <button class="editor-tool-btn" onclick="window.A('editorAddText')">
        ${ic('text', 24)}
        <span>${S.lang === 'ar' ? 'إضافة نص' : 'Add Text'}</span>
      </button>

      <button class="editor-tool-btn" onclick="window.A('editorCycleFilter')">
        ${ic('palette', 24)}
        <span>${S.lang === 'ar' ? 'فلتر' : 'Filter'}</span>
      </button>
    </div>
  </div>`;

  renderEditorCanvas();
}

function renderEditorCanvas() {
  const ed = V.editor;
  const canvas = document.getElementById('editor_canvas') as HTMLCanvasElement;
  if (!canvas || !ed) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.onload = () => {
    const isRot = (ed.rotation || 0) % 180 !== 0;
    canvas.width = isRot ? img.height : img.width;
    canvas.height = isRot ? img.width : img.height;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(((ed.rotation || 0) * Math.PI) / 180);

    // Apply Filter
    if (ed.filter === 'bw') ctx.filter = 'grayscale(100%)';
    else if (ed.filter === 'sepia') ctx.filter = 'sepia(80%)';
    else if (ed.filter === 'bright') ctx.filter = 'brightness(125%) contrast(110%)';
    else ctx.filter = 'none';

    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    // Render text overlay if present
    if (ed.text) {
      ctx.save();
      ctx.font = `bold ${Math.max(24, Math.round(canvas.width / 16))}px Cairo, Roboto, sans-serif`;
      ctx.fillStyle = ed.textColor || '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8;
      ctx.fillText(ed.text, canvas.width / 2, canvas.height * 0.85);
      ctx.restore();
    }
  };
  img.src = ed.originalSrc;
}

// Fullscreen Story Viewer
function storyViewerH(a: any) {
  const sv = V.storyViewer;
  if (!sv) return;
  const st = sv.story;

  a.innerHTML = `<div class="story-viewer">
    <div class="story-progress-bar">
      <div class="story-progress-seg"><div class="story-progress-fill" id="story_fill" style="width:100%"></div></div>
    </div>

    <div style="position:absolute;top:18px;left:14px;right:14px;display:flex;align-items:center;gap:10px;z-index:10;direction:rtl">
      ${av(st.authorName || S.user?.n || 'مستخدم', st.authorPhoto || S.user?.photo)}
      <div style="flex:1">
        <b style="font-size:14px;text-shadow:0 1px 4px #000">${esc(st.authorName || S.user?.n || 'مستخدم')}</b>
        <div style="font-size:11px;opacity:0.8">${st.tm || 'الآن'}</div>
      </div>
      <button class="ib" style="background:#00000066;color:#fff" onclick="window.A('closeStoryViewer')">${ic('x')}</button>
    </div>

    <div class="story-content" onclick="window.A('closeStoryViewer')">
      ${
        st.t === 'vd'
          ? `<video src="${st.x}" autoplay playsinline loop></video>`
          : `<img src="${st.x}" alt="">`
      }
    </div>
  </div>`;
}

// Other User's Profile View
function otherProfileH() {
  const u = V.viewingProfile;
  if (!u) return '';
  const posts = getGlobalPosts().filter((p) => p.userId === u.id);

  return `<div class='top' style='padding:0 0 6px'>
    <button class='ib' onclick="window.V.viewingProfile=null;window.R()">${ic('back')}</button>
    <h1>${esc(u.n)}</h1>
  </div>
  
  <div class="profile-cover" style="${u.cover ? `background-image:url(${u.cover})` : ''}"></div>
  
  <div class='big' style='text-align:center;padding:0 0 10px;margin-top:-60px'>
    <div style="position:relative;display:inline-block">
      ${av(u.n, u.photo)}
    </div>
    <h2 style='margin:10px 0 0;color:var(--ac)'>${esc(u.n)}</h2>
    ${(() => {
      const lsText = formatLastSeen(u);
      const isOnline = lsText.includes('متصل') || lsText.includes('Online');
      return `<span style="color:${isOnline ? '#34c759' : 'var(--sub)'};font-weight:600;font-size:13px">${lsText}</span>`;
    })()}
  </div>

  <div style='display:flex;gap:8px;margin:10px 14px'>
    <button class='btn' onclick="window.A('startChatWith','${u.id}')">
      ${ic('chat', 20)}
      <span>${S.lang === 'ar' ? 'مراسلة الصفحة' : 'Message'}</span>
    </button>
    <button class='btn g' onclick="window.A('callOtherUser','${u.id}',0)">
      ${ic('phone', 20)}
    </button>
    <button class='btn g' onclick="window.A('callOtherUser','${u.id}',1)">
      ${ic('video', 20)}
    </button>
  </div>

  <div class='cardf' style="margin:0 14px">
    ${!u.hideId ? `<div class='st-row'><div class='rt'><b dir='ltr'>${u.id}</b><span>${t('pid')}</span></div></div>` : ''}
    ${u.bio ? `<div class='st-row'><div class='rt'><b>${esc(u.bio)}</b><span>Bio</span></div></div>` : ''}
    ${u.un ? `<div class='st-row'><div class='rt'><b dir='ltr'>@${esc(u.un)}</b><span>${tr('un')}</span></div></div>` : ''}
  </div>

  <div style="padding:14px">
    <b style="font-size:15px">${S.lang === 'ar' ? 'المنشورات' : 'Posts'}</b>
  </div>

  ${
    posts.length
      ? `<div class='pg' style="padding:0 14px">${posts
          .map((p: any) =>
            p.t === 'vd'
              ? `<video src='${p.x}' muted playsinline preload="metadata" onloadeddata="try{if(this.currentTime===0)this.currentTime=0.05}catch(e){}" onclick="window.A('openFeedFromList',${p.id},'${u.id}')"></video>`
              : `<img src='${p.x}' alt='' onclick="window.A('openFeedFromList',${p.id},'${u.id}')">`
          )
          .join('')}</div>`
      : `<div style='text-align:center;padding:24px 12px'><p style='color:var(--sub)'>${tr('nop')}</p></div>`
  }`;
}

// User's Own Profile
function profH() {
  const u = S.user || {};
  const o = S.o;
  const isArchivedTab = !!V.pa;
  const myPosts = (S.posts || []).filter((p: any) => !!p.ar === isArchivedTab);

  return `
  <div class="profile-cover" style="${u.cover ? (u.cover.startsWith('linear') ? `background:${u.cover}` : `background-image:url(${u.cover})`) : ''}">
    <button class="profile-cover-btn" onclick="window.A('openPhotoOptions')">
      ${ic('cam', 16)}
      <span>${S.lang === 'ar' ? 'تغيير الغلاف' : 'Cover'}</span>
    </button>
    <input id="cov_input" class="fh" type="file" accept="image/*" onchange="window.A('uploadCover',this.files[0])">
  </div>

  <div class='big' style='text-align:center;padding:0 0 10px;margin-top:-60px'>
    <div style="position:relative;display:inline-block;cursor:pointer" onclick="window.A('openPhotoOptions')">
      ${av(u.n || '?', u.photo)}
      <span class='cam-badge'>${ic('cam', 18)}</span>
    </div>
    <input id='pf3' class='fh' type='file' accept='image/*' onchange="window.A('ph2',this.files[0])">
    <h2 style='margin:10px 0 0;color:${NC[o.nc]}'>${esc(u.n || '')}</h2>
    <span style='color:var(--sub)'>${tr('online')}</span>
  </div>

  <div style='display:flex;gap:8px;margin:10px 0'>
    <button class='sbtn' style='flex-direction:column;height:72px;border-radius:18px;background:var(--sf)' onclick="window.A('openPhotoOptions')">
      ${ic('cam', 22)}<span style='font-size:12px'>${tr('sp')}</span>
    </button>
    <button class='sbtn' style='flex-direction:column;height:72px;border-radius:18px;background:var(--sf)' onclick='window.V.sub="acc";window.V.t="settings";window.R()'>
      ${ic('pen', 22)}<span style='font-size:12px'>${t('edit')}</span>
    </button>
    <button class='sbtn' style='flex-direction:column;height:72px;border-radius:18px;background:var(--sf)' onclick='window.A("t","settings")'>
      ${ic('gear', 22)}<span style='font-size:12px'>${t('settings')}</span>
    </button>
  </div>

  <div class='cardf'>
    ${!u.hideId ? `<div class='st-row'><div class='rt'><b dir='ltr'>${u.demo ? '—' : u.id}</b><span>${t('pid')}</span></div></div>` : ''}
    ${u.bio ? `<div class='st-row'><div class='rt'><b>${esc(u.bio)}</b><span>Bio</span></div></div>` : ''}
    ${u.un ? `<div class='st-row'><div class='rt'><b dir='ltr'>@${esc(u.un)}</b><span>${tr('un')}</span></div></div>` : ''}
    ${u.bd && (!u.bdPrivacy || u.bdPrivacy === 'all') ? `<div class='st-row'><div class='rt'><b>${esc(u.bd)}</b><span>🎂 ${S.lang === 'ar' ? 'تاريخ الميلاد' : 'Birthday'}</span></div></div>` : ''}
  </div>

  <div class='seg'>
    <button class='${V.pa ? '' : 'on'}' onclick='window.V.pa=0;window.R()'>${tr('posts')}</button>
    <button class='${V.pa ? 'on' : ''}' onclick='window.V.pa=1;window.R()'>${tr('arch')}</button>
  </div>

  <input id='pf4' class='fh' type='file' accept='image/*,video/*' onchange="window.A('startPostEditor',this.files[0]);this.value=''">

  ${
    myPosts.length
      ? `<div class='pg'>${myPosts
          .map((p: any) =>
            p.t === 'vd'
              ? `<video src='${p.x}' muted playsinline preload="metadata" onloadeddata="try{if(this.currentTime===0)this.currentTime=0.05}catch(e){}" onclick="window.A('openFeedFromList',${p.id},'${S.user?.id}')"></video>`
              : `<img src='${p.x}' alt='' onclick="window.A('openFeedFromList',${p.id},'${S.user?.id}')">`
          )
          .join('')}</div>`
      : `<div style='text-align:center;padding:24px 12px'><b style='font-size:1.3em'>${tr('nop')}</b><p style='color:var(--sub)'>${tr(
          'nopd'
        )}</p></div>`
  }

  <div style='text-align:center;margin-top:12px'>
    <label class='btn' for='pf4' style='width:auto;padding:0 28px;display:inline-flex;align-items:center;gap:10px;justify-content:center'>
      ${ic('plus', 22)}${tr('ap')}
    </label>
  </div>`;
}

// Settings Sub-Pages
function subH() {
  const s = V.sub;
  const u = S.user || {};
  const bk = `<div class='top' style='padding:0 0 6px'><button class='ib' onclick="window.A('sub',null)">${ic(
    'back'
  )}</button><h1>${sl(s)}</h1></div>`;
  let h = '';

  if (s === 'acc') {
    const e = S.acc ? S.acc.e : '';
    const row = (i1: string, cl: string, ti: string, sb: string, oc?: string) =>
      `<button class='st-row' ${oc ? `onclick="${oc}"` : ''}>
        <span class='sq' style='background:${cl}'>${i1}</span>
        <div class='rt'><b>${ti}</b>${sb ? `<span>${sb}</span>` : ''}</div>
      </button>`;
    h = `<div class='cardf'>
      <div class='ct'>${tr('yn')}</div>
      <input class='fi' value='${esc(u.n || '')}' oninput='window.uf("n",this.value)'>
      <input class='fi' placeholder='${tr('ln')}' value='${esc(u.ln || '')}' oninput='window.uf("ln",this.value)'>
    </div>
    <div class='cardf' style='display:flex;align-items:center;gap:8px'>
      <input class='fi' maxlength='70' value='${esc(u.bio || '')}' oninput='window.uf("bio",this.value)'>
      <span id='bc' style='color:var(--sub)'>${70 - (u.bio || '').length}</span>
    </div>
    <p class='note' style='text-align:start'>${tr('few')}</p>
    <div class='cardf'>
      <div class='ct'>${tr('yi')}</div>
      ${row(ic('user', 20), '#34c759', `<span dir='ltr'>${u.demo ? '—' : u.id}</span>`, t('pid'))}
      ${row('@', '#f5a623', `<span dir='ltr'>${esc(u.un || '—')}</span>`, tr('un'), "window.A('un')")}
      ${row(ic('cake', 20), '#2f9cf4', u.bd ? esc(u.bd) : tr('abd'), '', "window.A('bd')")}
      ${row(ic('mail', 20), '#a35be8', `<span dir='ltr'>${u.hideE ? '••••••••' : esc(e)}</span>`, tr('em'), "window.A('he')")}
    </div>
    <div class='cardf'>
      <div class='ct'>${S.lang === 'ar' ? 'الخصوصية وإخفاء المعلومات' : 'Privacy'}</div>
      <button class='st-row' onclick="window.A('toggleHideId')">
        <div class='rt'><b>${S.lang === 'ar' ? 'إخفاء المعرّف الشخصي (8 أرقام)' : 'Hide personal ID'}</b><span>${
      u.hideId ? (S.lang === 'ar' ? 'مخفي' : 'Hidden') : S.lang === 'ar' ? 'ظاهر للجميع' : 'Visible'
    }</span></div>
        <span class='sw ${u.hideId ? 'on' : ''}'><i></i></span>
      </button>
      <button class='st-row' onclick="window.A('he')">
        <div class='rt'><b>${S.lang === 'ar' ? 'إخفاء البريد الإلكتروني' : 'Hide Email'}</b><span>${
      u.hideE ? (S.lang === 'ar' ? 'مخفي' : 'Hidden') : S.lang === 'ar' ? 'ظاهر للجميع' : 'Visible'
    }</span></div>
        <span class='sw ${u.hideE ? 'on' : ''}'><i></i></span>
      </button>
    </div>
    <p class='note' style='text-align:start'>${tr('bdn')}</p>
    <div class='cardf'>
      ${row(ic('chat', 20), '#f5a623', tr('pch'), tr('add'), "window.V.sub=null;window.A('t','me')")}
      ${row(ic('star', 20), '#a35be8', tr('cha'), '', "toast(t('soon'))")}
    </div>
    <p class='note' style='text-align:start'>${tr('chb')}</p>
    <div class='cardf'>
      <div style='display:flex;align-items:center;gap:6px'>
        <button class='st-row' style='flex:1' onclick="window.A('addacc')">
          <span class='sq' style='background:var(--ac)'>${ic('userplus', 20)}</span>
          <div class='rt'><b>${tr('aac')}</b><span>${tr('mx3')}</span></div>
        </button>
        ${(S.accs || []).length ? `<button class='sqb' onclick="window.A('accs')">${ic('swap', 22)}</button>` : ''}
      </div>
      ${row(ic('logout', 20), '#ee4d5f', `<span style='color:#ff5a5a'>${t('out')}</span>`, '', "window.A('out')")}
    </div>`;
  } else if (s === 'cs') {
    h = CS();
  } else if (s === 'priv') {
    h = `<div class='cardf'>
      <div class='ct'>${tr('ls')}</div>
      ${RAD('lsv', 'all', 'ls_all')}
      ${RAD('lsv', 'con', 'ls_con')}
      ${RAD('lsv', 'non', 'ls_non')}
    </div>
    <div class='cardf'>
      <button class='st-row' onclick="window.A('fp')">
        <div class='rt'><b>${t('lk')}</b></div>
        <span class='sw ${S.lock ? 'on' : ''}'><i></i></span>
      </button>
    </div>`;
  } else if (s === 'nt') {
    h = `<div class='cardf'>
      ${TG('sn', 'sn')}
      ${TG('cl', 'cl')}
      ${TG('bd', 'bd')}
      <button class='st-row' onclick="window.A('nt')">
        <div class='rt'><b>${tr('bn')}</b><span style='white-space:normal'>${(typeof Notification !== 'undefined' && Notification.permission) || 'unsupported'} · ${tr('ntn')}</span></div>
        <span class='sw ${S.nt ? 'on' : ''}'><i></i></span>
      </button>
      <button class='st-row' onclick="window.A('ntt')"><div class='rt'><b style='color:var(--ac)'>${tr('ntt')}</b></div></button>
    </div>`;
  } else if (s === 'ds') {
    h = `<div class='cardf'>
      <div class='ct'>${tr('md')}</div>
      ${TG('ma', 'ma')}
      ${TG('mv', 'mv')}
    </div>
    <div class='cardf'>
      <button class='st-row' onclick="window.A('wipe')"><div class='rt'><b style='color:#ff5a5a'>${
        S.lang === 'ar' ? 'مسح بيانات التطبيق' : 'Clear app data'
      }</b></div></button>
    </div>`;
  } else if (s === 'dv') {
    h = `<div class='cardf'>
      <div class='st-row'><div class='rt'><b>${esc(navigator.platform || 'Device')}</b><span>${esc(
      navigator.userAgent.slice(0, 70)
    )}</span></div></div>
    </div>
    <div class='cardf'>
      <button class='st-row' onclick="window.A('diag')"><div class='rt'><b style='color:var(--ac)'>${tr('dg')}</b><span>${tr(
      'dgd'
    )}</span></div></button>
      ${
        V.dg
          ? Object.entries(V.dg)
              .map(
                ([k2, v2]) =>
                  `<div class='st-row'><div class='rt'><b>${k2}</b><span dir='ltr' style='white-space:normal;text-align:left'>${esc(
                    v2
                  )}</span></div><b>${v2 === 'OK' || v2 === 'true' ? '✓' : '✗'}</b></div>`
              )
              .join('')
          : ''
      }
    </div>`;
  } else if (s === 'ps') {
    h = `<div class='cardf'>
      <button class='st-row' onclick="window.A('ps')">
        <div class='rt'><b>${sl('ps')}</b><span>${ss('ps')}</span></div>
        <span class='sw ${S.ps ? 'on' : ''}'><i></i></span>
      </button>
    </div>`;
  } else if (['prem', 'stars', 'biz', 'gift'].includes(s)) {
    h = `<div class='cardf'>
      <b>${tr(s)}</b>
      <p style='color:var(--sub)'>${
        S.lang === 'ar'
          ? 'هذه الميزة تحتاج نظام دفع وسيرفر، وهي غير متاحة بعد في هذه النسخة.'
          : 'This feature needs a payment system and a server.'
      }</p>
    </div>`;
  } else if (s === 'ask') {
    h = `<div class='f'>
      <textarea id='aq' rows='6' placeholder='${tr(
        'ask'
      )}' style='background:var(--sf);border-radius:14px;padding:12px;width:100%'></textarea>
      <button class='btn' onclick="window.A('askq')">${tr('snd')}</button>
      <p class='note'>${
        S.lang === 'ar'
          ? 'السؤال يُحفظ في الرسائل المحفوظة.'
          : 'Your question is saved in Saved Messages.'
      }</p>
    </div>`;
  } else if (s === 'faq') {
    h = FAQ()
      .map((z: any) => `<div class='cardf'><b>${z[0]}</b><p style='color:var(--sub)'>${z[1]}</p></div>`)
      .join('');
  } else if (s === 'feat') {
    h = `<div class='cardf'><p style='white-space:pre-line'>${FEAT()}</p></div>`;
  } else if (s === 'pp') {
    h = `<div class='cardf'><p style='white-space:pre-line'>${PP()}</p></div>`;
  } else if (s === 'fo') {
    h = `<div class='cardf'>
      ${(S.fl || [])
        .map(
          (f: any) =>
            `<button class='st-row' onclick="window.A('efo',${f.id})"><span class='sq' style='background:#2fb0d4'>${ic(
              'folder',
              20
            )}</span><div class='rt'><b>${esc(f.n)}</b><span>${f.ids.length} ${
              S.lang === 'ar' ? 'محادثة' : 'chats'
            }</span></div></button>`
        )
        .join('')}
      <button class='st-row' onclick="window.A('efo',0)"><span class='sq' style='background:var(--ac)'>${ic(
      'plus',
      20
    )}</span><div class='rt'><b style='color:var(--ac)'>${tr('nfo')}</b><span>${tr('fod')}</span></div></button>
    </div>`;
  } else if (s === 'lg') {
    h = `<div class='cardf'>
      ${[
        ['ar', 'العربية'],
        ['en', 'English']
      ]
        .map(
          (z) =>
            `<button class='st-row' onclick="window.S.lang='${z[0]}';window.save();window.R()"><div class='rt'><b>${
              z[1]
            }</b></div><span class='sw ${S.lang === z[0] ? 'on' : ''}'><i></i></span></button>`
        )
        .join('')}
    </div>`;
  }

  return bk + h;
}

function uf(k: string, v: string) {
  S.user[k] = v;
  if (k === 'bio') {
    const b = $('#bc');
    if (b) b.textContent = String(70 - v.length);
  }
  save();
}

function ssl(k: string, v: any) {
  S.o[k] = +v;
  const r = document.documentElement;
  r.style.setProperty(k === 'sf' ? '--fs' : '--br', v + 'px');
  const l = $('#sl_' + k);
  if (l) l.textContent = v;
  save();
}

function MEMENU() {
  return `<div class='sheet' onclick='window.V.menu=0;window.R()'><div class='act'>
    <button onclick="window.A('pcol')">${ic('palette', 22)}${tr('pc')}</button>
    <button onclick="window.A('un')">${ic('at', 22)}${tr('cu')}</button>
    <button onclick="window.A('cl2')">${ic('link', 22)}${tr('cpl')}</button>
  </div></div>`;
}

const bgStyle = () => {
  const b = S.o.bg;
  return !b ? '' : b.t === 'c' ? `background:${b.v};background-image:none` : `background:url(${b.v}) center/cover`;
};

function endDemo(m?: number) {
  clearInterval(V.iv);
  const z = V.stash;
  V.demo = 0;
  S.user = z.u;
  S.chats = z.c;
  S.in = 0;
  V.a = 'up';
  V.c = null;
  V.call = null;
  V.cam = null;
  R();
  if (m) toast(t('demoEnd'));
}

function burst(e: string) {
  const d = document.createElement('div');
  d.className = 'burst';
  d.textContent = e;
  document.body.append(d);
  setTimeout(() => d.remove(), 900);
}

const idTaken = (v: string) => {
  const ids = [S.user, ...(S.accs || []).map((z: any) => z.user)].filter(Boolean).map((u) => String(u.id || '').trim());
  const ct = [S.chats, ...(S.accs || []).map((z: any) => z.chats)].flatMap((cs) =>
    Object.values(cs || {}).map((c: any) => String(c.p || '').trim())
  );
  const reg = getUsersRegistry();
  return ids.includes(v) || ct.includes(v) || !!cachedServerUsers[v] || !!reg[v];
};

function nl() {
  const q = (V.q || '').toLowerCase();
  return Object.keys(S.chats)
    .filter((i) => !S.chats[i].s && !S.chats[i].g && S.chats[i].n.toLowerCase().includes(q))
    .map(
      (i) =>
        `<button class="row" onclick="window.A('open','${i}')">${av(S.chats[i].n, S.chats[i].photo)}<div class="rt"><b>${esc(
          S.chats[i].n
        )}</b><span dir="ltr" style="text-align:right">${esc(S.chats[i].p || '')}</span></div></button>`
    )
    .join('');
}

const inFo = (i: string) => {
  if (!V.fo) return 1;
  const f = (S.fl || []).find((z: any) => z.id === V.fo);
  return f ? f.ids.includes(i) : 1;
};

function FC() {
  const fl = S.fl || [];
  if (!fl.length) return '';
  return `<div class='thm' style='padding:0 0 8px;gap:6px'>
    ${[{ id: 0, n: tr('fall') }, ...fl]
      .map((f: any) => {
        const on = (V.fo || 0) === f.id;
        return `<button style='flex:none;padding:7px 16px;border-radius:18px;background:${
          on ? '#2f9cf433' : 'var(--sf)'
        };color:${on ? 'var(--ac)' : 'var(--tx)'}' onclick='window.V.fo=${f.id};window.R()'>${esc(f.n)}</button>`;
      })
      .join('')}
  </div>`;
}

const snap = () => ({
  acc: S.acc,
  user: S.user,
  chats: S.chats,
  posts: S.posts || [],
  stk: S.stk || [],
  fl: S.fl || []
});

const load = (z: any) => {
  S.acc = z.acc;
  S.user = z.user;
  S.chats = z.chats;
  S.posts = z.posts;
  S.stk = z.stk;
  S.fl = z.fl || [];
  V.fo = 0;
  V.c = null;
  V.t = 'chats';
  V.sub = null;
  V.menu = 0;
  V.ms = null;
  processedMsgIds.clear();
};

function ACCM() {
  const all = [S.user, ...(S.accs || []).map((z: any) => z.user)].filter(Boolean);
  return `<div class='sheet' onclick='window.V.menu=0;window.R()'><div class='act' style='width:280px'>
    <div class='note' style='padding:6px'>${tr('mx3')}</div>
    ${all
      .map(
        (u, i) =>
          `<button onclick="window.A('swa',${i})">${av(u.n, u.photo)}<span style='flex:1'>${esc(u.n)}</span>${
            i === 0 ? ic('check', 20) : ''
          }</button>`
      )
      .join('')}
    ${all.length < 3 ? `<button onclick="window.A('addacc')">${ic('userplus', 22)}${tr('aac')}</button>` : ''}
  </div></div>`;
}

function ATT() {
  const a = V.at;
  const tb = [
    ['g', 'img', 'gal'],
    ['f', 'file', 'fil'],
    ['l', 'loc', 'lcn'],
    ['c', 'user', 'cnt'],
    ['m', 'music', 'mus'],
    ['p', 'data', 'pol']
  ];
  let b = '';
  if (a.tab === 'g') {
    b = `<div class='pg'>
      <label class='tile' for='af_c'>${ic('cam', 28)}<span>${tr('cam')}</span></label>
      <label class='tile' for='af_g'>${ic('img', 28)}<span>${tr('gal')}</span></label>
      ${a.imgs
        .map(
          (m: any, i: number) =>
            `<div class='pgl' onclick='window.A("asel",${i})'><img src='${m.x}' alt=''><i class='sel2 ${
              m.on ? 'on' : ''
            }'>${m.on ? ic('check', 14) : ''}</i></div>`
        )
        .join('')}
    </div>
    ${
      a.imgs.some((m: any) => m.on)
        ? `<button class='btn' style='margin-top:8px' onclick='window.A("asend")'>${tr('snd')} (${
            a.imgs.filter((m: any) => m.on).length
          })</button>`
        : ''
    }
    <input id='af_g' class='fh' type='file' accept='image/*' multiple onchange='window.A("apick",this.files)'>
    <input id='af_c' class='fh' type='file' accept='image/*' capture='environment' onchange='window.A("apick",this.files)'>`;
  } else if (a.tab === 'f') {
    b = `<label class='btn' style='display:flex;align-items:center;justify-content:center;gap:10px' for='af_f'>${ic(
      'file',
      22
    )}${tr('fil2')}</label><input id='af_f' class='fh' type='file' multiple onchange='window.A("afile",this.files)'>`;
  } else if (a.tab === 'l') {
    b = `<button class='btn' onclick='window.A("loc")'>${tr('sloc')}</button><p class='note'>${tr('llive')}</p>`;
  } else if (a.tab === 'c') {
    const cs = Object.keys(S.chats).filter((i) => !S.chats[i].s && !S.chats[i].g);
    b = cs.length
      ? cs
          .map(
            (i) =>
              `<button class='row' onclick='window.A("actc","${i}")'>${av(S.chats[i].n, S.chats[i].photo)}<div class='rt'><b>${esc(
                S.chats[i].n
              )}</b><span dir='ltr' style='text-align:right'>${esc(S.chats[i].p || '')}</span></div></button>`
          )
          .join('')
      : `<p class='note'>${t('nocon')}</p>`;
  } else if (a.tab === 'm') {
    b = `<label class='btn' style='display:flex;align-items:center;justify-content:center;gap:10px' for='af_m'>${ic(
      'bell',
      22
    )}${tr('mus2')}</label><input id='af_m' class='fh' type='file' accept='audio/*' multiple onchange='window.A("aaud",this.files)'>`;
  } else {
    b = `<div class='f' style='padding:6px'>
      <input id='pq' class='fi' placeholder='${tr('pq')}'>
      ${[1, 2, 3, 4].map((i) => `<input id='po${i}' class='fi' placeholder='${tr('po')} ${i}'>`).join('')}
      <button class='btn' onclick='window.A("apoll")'>${tr('snd')}</button>
    </div>`;
  }

  return `<div class='at'>
    <div style='width:40px;height:4px;border-radius:2px;background:var(--sub);margin:8px auto'></div>
    <div class='abody'>${b}</div>
    <div class='atabs'>
      ${tb
        .map(
          (y) =>
            `<button class='${a.tab === y[0] ? 'on' : ''}' onclick='window.V.at.tab="${y[0]}";window.R()'>${ic(
              y[1],
              22
            )}${tr(y[2])}</button>`
        )
        .join('')}
      <button onclick='window.V.at=null;window.R()'>${ic('x', 22)}</button>
    </div>
  </div>`;
}

function FAQ() {
  const ar = S.lang === 'ar';
  return ar
    ? [
        [
          'كيف أضيف جهة اتصال؟',
          'من تبويب جهات الاتصال اضغط زر الإضافة، واكتب الاسم العائلي والمعرّف الشخصي لصديقك (8 أرقام).'
        ],
        [
          'كيف أسجّل بصمة صوتية واستمع لها قبل الإرسال؟',
          'اضغط مطولاً على زر المايك ثم اسحب لأعلى للقفل، أو اضغط زر الإيقاف للاستماع للبصمة الصوتية وحذفها أو إرسالها.'
        ],
        ['كيف تعمل مقاطع الشورتس / تيك توك؟', 'اضغط على أي منشور في الملف الشخصي ليفتح لك بملء الشاشة مع التمرير لأعلى وأسفل لرؤية باقي المنشورات، مع الإعجاب والتعليقات والتنزيل.'],
        ['كيف أغيّر صورة الغلاف؟', 'من ملفك الشخصي اضغط زر (تغيير الغلاف) في أعلى الشاشة لاختيار صورة غلاف أنيقة خلف صورتك.']
      ]
    : [
        ['How do I add a contact?', 'In Contacts tap Add Contact and enter their family name and 8-digit personal ID.'],
        ['How do I preview a voice note?', 'Lock the recording and tap pause to listen before sending or discarding.'],
        ['How do Shorts / TikTok posts work?', 'Tap any post in the profile to open the vertical full-screen swipeable feed.'],
        ['How do I change the cover photo?', 'In Profile tap Change Cover at the top.']
      ];
}

function FEAT() {
  return S.lang === 'ar'
    ? '• رسائل فورية، بصمات صوتية مع استماع قبل الإرسال، وملاحظات فيديو دائري\n• شريط المنشورات في أعلى المحادثات مع دائرة الكل وحلقات زرقاء متوهجة للمنشورات الجديدة\n• عارض منشورات عمودي ملء الشاشة مثل تيك توك / شورتس مع إعجاب، تعليقات، وتنزيل\n• أداة تعديل الصور والمقاطع (تدوير، نصوص، فلاتر) مع تحديد خصوصية المنشور (عام أو جهات اتصالي)\n• مكالمات صوتية ومرئية فورية مع تحكم كامل بالمايك والكاميرا\n• معرف شخصي فريد (8 أرقام) للبحث وإضافة الأصدقاء دون أي بوتات أو حسابات وهمية\n• صورة غلاف للملف الشخصي وخيارات إخفاء البريد والمعرف الشخصي'
    : '• Instant messaging, voice notes with preview-before-send, and circle video notes\n• Posts bar at the top of chats with All circle and glowing rings for new posts\n• Full-screen Shorts / TikTok style feed with likes, comments, and download\n• Post editor with crop, rotate, text and filters, plus privacy controls (Public / Contacts)\n• Voice and video calls with real camera & mic\n• Unique 8-digit personal ID to add friends with no fake bots\n• Profile cover banner and privacy toggles';
}

function PP() {
  return S.lang === 'ar'
    ? 'في تطبيق حمودي رسالة (Hamudi message)، بياناتك الشخصية ومحادثاتك محفوظة بأمان وسرية على جهازك.'
    : 'In Hamudi message, your personal data and chats are stored securely.';
}

const RXB = [
  '❤️',
  '👍',
  '👎',
  '🔥',
  '🥰',
  '👏',
  '😁',
  '🤔',
  '🤯',
  '😱',
  '😢',
  '🎉',
  '🤩',
  '🙏',
  '👌',
  '🤝',
  '💯',
  '🤣',
  '😍',
  '😎'
];
function RXO() {
  const u = S.o.ru || {};
  return [...new Set([...Object.keys(u).sort((a, b) => u[b] - u[a]), ...RXB])];
}

function syncPidState() {
  if (V.a === 'pid') {
    V.pidDigits = [...document.querySelectorAll('.cd')].map((x: any) => x.value || '');
  }
}

function cdIn(i: number, el: HTMLInputElement) {
  const digits = (el.value || '').replace(/\D/g, '');
  el.value = digits ? digits.slice(-1) : '';
  syncPidState();
  if (el.value) {
    el.classList.remove('fl');
    void el.offsetWidth;
    el.classList.add('fl');
    const all = document.querySelectorAll('.cd');
    const n = all[i + 1] as HTMLInputElement;
    if (n) n.focus();
  }
}

function cdKey(i: number, e: KeyboardEvent) {
  const all = document.querySelectorAll('.cd');
  const cur = all[i] as HTMLInputElement;
  if (!cur) return;

  if (e.key === 'Backspace' || e.keyCode === 8) {
    e.preventDefault();
    if (cur.value) {
      // Delete only the current box's single digit and keep all other boxes untouched
      cur.value = '';
      syncPidState();
      if (i > 0) {
        const prevEl = all[i - 1] as HTMLInputElement;
        if (prevEl) prevEl.focus();
      }
    } else if (i > 0) {
      // Current box is already empty: step back to previous box and delete only that single digit
      const prevEl = all[i - 1] as HTMLInputElement;
      if (prevEl) {
        prevEl.value = '';
        syncPidState();
        prevEl.focus();
      }
    }
    return;
  }

  if (e.key === 'Delete') {
    e.preventDefault();
    cur.value = '';
    syncPidState();
    return;
  }

  if (e.key === 'ArrowLeft' && i > 0) {
    e.preventDefault();
    (all[i - 1] as HTMLInputElement)?.focus();
  } else if (e.key === 'ArrowRight' && i < all.length - 1) {
    e.preventDefault();
    (all[i + 1] as HTMLInputElement)?.focus();
  }
}

function cdPaste(e: ClipboardEvent) {
  const d = (e.clipboardData?.getData('text') || '').replace(/\D/g, '');
  if (!d) return;
  e.preventDefault();
  document.querySelectorAll('.cd').forEach((x: any, i) => {
    x.value = d[i] || '';
  });
  syncPidState();
}

function triggerFriendReply(chatKey: string, userMsgText: string) {
  setTimeout(() => {
    const chat = S.chats[chatKey];
    if (!chat || chat.blocked) return;
    const tLow = (userMsgText || '').toLowerCase();
    let reply = '';
    if (tLow.includes('مرحبا') || tLow.includes('سلام') || tLow.includes('هلا') || tLow.includes('أهلا') || tLow.includes('السلام')) {
      reply = 'وعليكم السلام ورحمة الله وبركاته، يا هلا وغلا بيك! كيف أمورك؟';
    } else if (tLow.includes('كيفك') || tLow.includes('شلونك') || tLow.includes('شخبارك') || tLow.includes('عساك بخير')) {
      reply = 'الحمد لله بألف خير ونعمة يا غالي، تسلم على السؤال الطيب! بشرني عنك؟';
    } else if (tLow.includes('وينك') || tLow.includes('وين صرت') || tLow.includes('وين انت')) {
      reply = 'موجود يا طيب، نورتني والله بتواصلك!';
    } else if (tLow.includes('شكرا') || tLow.includes('مشكور') || tLow.includes('تسلم')) {
      reply = 'العفو حبيبي، في الخدمة دائماً ❤️';
    } else if (tLow.includes('منشور') || tLow.includes('فيديو') || tLow.includes('صورة')) {
      reply = 'شفت المنشور، ماشاء الله إبداع وجميل جداً!';
    } else {
      const friendlyReplies = [
        'أهلاً وسهلاً يا غالي، وصلتني رسالتك وتسلم على التواصل الطيب!',
        'يا هلا بيك، معك على تواصل دائماً يا طيب!',
        'وصلت الرسالة تسلملي، كيف يومك إن شاء الله تمام؟',
        'حياك الله، سعيد جداً برسالتك يا أعز الأصدقاء ❤️'
      ];
      reply = friendlyReplies[Math.floor(Math.random() * friendlyReplies.length)];
    }

    const replyMsg: any = {
      t: 't',
      x: reply,
      tm: tm(),
      out: 0
    };
    chat.m.push(replyMsg);
    save();

    // Also sync to global dms
    const myId = S.user?.id || 'me';
    const friendId = chat.p;
    if (friendId) {
      const pairKey = [myId, friendId].sort().join('_');
      try {
        const allDms = JSON.parse(localStorage.getItem('hm_global_dms') || '{}');
        allDms[pairKey] = allDms[pairKey] || [];
        allDms[pairKey].push({ ...replyMsg, senderId: friendId, senderName: chat.n, receiverId: myId });
        localStorage.setItem('hm_global_dms', JSON.stringify(allDms));
      } catch (e) {}
    }

    if (V.c === chatKey) {
      R();
    }
    beep();
  }, 1400);
}

function push(m: any) {
  if (!V.c || !S.chats[V.c]) return;
  const c = S.chats[V.c];
  if (c.blocked) {
    toast(S.lang === 'ar' ? 'جهة الاتصال محظورة، يرجى إلغاء الحظر للمتابعة' : 'Contact is blocked, unblock first');
    return;
  }
  const msgId = 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  m.tm = tm();
  m.out = 1;
  m.serverMsgId = msgId;
  c.m.push(m);
  save();
  R();

  // Send real message to server and sync global dms
  if (c.p && !c.g && !c.s) {
    const myId = String(S.user?.id || 'me').trim();
    const friendId = String(c.p).trim();
    const pairKey = [myId, friendId].sort().join('_');
    try {
      const allDms = JSON.parse(localStorage.getItem('hm_global_dms') || '{}');
      allDms[pairKey] = allDms[pairKey] || [];
      allDms[pairKey].push({ ...m, senderId: myId, senderName: S.user?.n || 'أنا', receiverId: friendId });
      localStorage.setItem('hm_global_dms', JSON.stringify(allDms));
    } catch (e) {}

    // Post real message to backend so friend and other accounts receive it reliably
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: msgId,
        senderId: myId,
        senderName: S.user?.n || 'أنا',
        senderPhoto: S.user?.photo || '',
        receiverId: friendId,
        x: m.x,
        t: m.t,
        tm: m.tm,
        n: m.n,
        z: m.z,
        dur: m.dur,
        rep: m.rep
      })
    }).catch(() => {});
  }
}

let processedMsgIds = new Set<string>();

async function pollRealtimeMessages() {
  if (!S.in || !S.user?.id) return;
  const myId = String(S.user.id).trim();
  try {
    const res = await fetch('/api/messages?user1=' + encodeURIComponent(myId));
    if (!res.ok) return;
    const msgs = await res.json();
    if (!Array.isArray(msgs)) return;

    let hasNewIncoming = false;
    let hasSyncedOutgoing = false;

    for (const msg of msgs) {
      const senderId = String(msg.senderId || '').trim();
      const receiverId = String(msg.receiverId || '').trim();
      const baseKey = msg.id || (senderId + '_' + msg.timestamp + '_' + msg.x);
      const msgKey = myId + '_' + baseKey;

      if (processedMsgIds.has(msgKey)) continue;
      processedMsgIds.add(msgKey);

      const isIncoming = receiverId === myId && senderId !== myId;
      const isOutgoing = senderId === myId && receiverId !== myId;
      if (!isIncoming && !isOutgoing) continue;

      const partnerId = isIncoming ? senderId : receiverId;
      let chatKey = Object.keys(S.chats).find((k) => String(S.chats[k].p || '').trim() === partnerId);

      if (!chatKey && isIncoming) {
        const reg = getUsersRegistry();
        const senderInfo = reg[partnerId] || cachedServerUsers[partnerId] || { n: msg.senderName || 'صديق', photo: msg.senderPhoto || '' };
        chatKey = 'c_' + partnerId;
        S.chats[chatKey] = {
          n: senderInfo.n || msg.senderName || 'صديق',
          p: partnerId,
          photo: senderInfo.photo || msg.senderPhoto || '',
          bio: senderInfo.bio || '',
          blocked: false,
          m: []
        };
      }

      if (!chatKey) continue;
      const chat = S.chats[chatKey];

      if (isIncoming && (!chat.photo && msg.senderPhoto)) {
        chat.photo = msg.senderPhoto;
      }

      const expectedOut = isIncoming ? 0 : 1;
      const alreadyExists = (chat.m || []).some(
        (existing: any) =>
          (msg.id && existing.serverMsgId === msg.id) ||
          (existing.x === msg.x && existing.tm === msg.tm && existing.out === expectedOut)
      );

      if (!alreadyExists && (!isIncoming || !chat.blocked)) {
        chat.m = chat.m || [];
        chat.m.push({
          t: msg.t || 't',
          x: msg.x,
          tm: msg.tm,
          n: msg.n,
          z: msg.z,
          dur: msg.dur,
          rep: msg.rep,
          out: expectedOut,
          serverMsgId: msg.id
        });
        if (isIncoming) {
          hasNewIncoming = true;
        } else {
          hasSyncedOutgoing = true;
        }
      }
    }

    if (hasNewIncoming || hasSyncedOutgoing) {
      save();
      if (hasNewIncoming) beep();
      R();
    }
  } catch (e) {}
}

function sq(f: File, cb: (d: string) => void) {
  const r = new FileReader();
  r.onload = () => {
    const i = new Image();
    i.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const x = c.getContext('2d');
      const s = Math.min(i.width, i.height);
      if (x) {
        x.drawImage(i, (i.width - s) / 2, (i.height - s) / 2, s, s, 0, 0, 256, 256);
        cb(c.toDataURL('image/jpeg', 0.85));
      }
    };
    i.src = r.result as string;
  };
  r.readAsDataURL(f);
}

// Dialogs
function dlg(h: string): Promise<any> {
  return new Promise((res) => {
    const d = document.createElement('div');
    d.className = 'dlgw';
    d.innerHTML = `<div class='act' style='width:320px;border-radius:20px;padding:16px;gap:12px;background:var(--bg);color:var(--tx)'>${h}</div>`;
    document.body.append(d);
    (window as any)._d = {
      res: (v: any) => {
        d.remove();
        res(v);
      }
    };
  });
}

const ask = (ti: string, v = '') =>
  dlg(
    `<b>${esc(ti)}</b>
     <input id='dq' value='${esc(v || '')}' style='background:var(--sf);border-radius:12px;height:46px;padding:0 12px;width:100%'>
     <div style='display:flex;gap:8px;justify-content:flex-end'>
       <button onclick='window._d.res(null)'>${t('cancel')}</button>
       <button style='color:var(--ac)' onclick='window._d.res(document.getElementById("dq").value)'>OK</button>
     </div>`
  ).then((x) => (x == null ? null : x.trim()));

const sure = (ti: string, tx: string, ck?: string) =>
  dlg(
    `<b>${esc(ti)}</b>
     <span>${esc(tx || '')}</span>
     ${ck ? `<label style='display:flex;gap:8px;align-items:center'><input type='checkbox'> ${esc(ck)}</label>` : ''}
     <div style='display:flex;gap:8px;justify-content:flex-end'>
       <button style='color:var(--ac)' onclick='window._d.res(0)'>${t('cancel')}</button>
       <button style='color:#ff5a5a' onclick='window._d.res(1)'>${t('dl')}</button>
     </div>`
  );

// Add Contact Dialog
const contactForm = () =>
  dlg(
    `<b>${S.lang === 'ar' ? 'إضافة جهة اتصال جديدة' : 'New Contact'}</b>
     <input id='cf1' class='fi' placeholder='${S.lang === 'ar' ? 'الاسم الأول (مطلوب)' : 'First name (required)'}'>
     <input id='cf2' class='fi' placeholder='${S.lang === 'ar' ? 'الاسم العائلي (اختياري)' : 'Last name (optional)'}'>
     <input id='cf3' class='fi' dir='ltr' inputmode='numeric' maxlength='8' placeholder='${t('pid')} (8)'>
     <div style='display:flex;gap:8px;justify-content:flex-end;margin-top:8px'>
       <button onclick='window._d.res(null)'>${t('cancel')}</button>
       <button style='color:var(--ac);font-weight:700' onclick='window._d.res({a:document.getElementById("cf1").value,b:document.getElementById("cf2").value,p:document.getElementById("cf3").value})'>${
         S.lang === 'ar' ? 'حفظ' : 'Create Contact'
       }</button>
     </div>`
  );

// Post Details Dialog after Editing (Mandatory Title and Description)
const postDetailsDialog = () => {
  const isAr = S.lang === 'ar';
  (window as any).submitNewPostDialog = () => {
    const tEl = document.getElementById('post_title') as HTMLInputElement;
    const dEl = document.getElementById('post_desc') as HTMLTextAreaElement;
    const tVal = tEl ? tEl.value.trim() : '';
    const dVal = dEl ? dEl.value.trim() : '';
    if (!tVal || !dVal) {
      toast(isAr ? 'يرجى كتابة عنوان المنشور ووصف المنشور للمتابعة' : 'Please provide both title and description');
      return;
    }
    const privEl = document.querySelector('input[name=post_privacy]:checked') as HTMLInputElement;
    const priv = privEl ? privEl.value : 'public';
    if ((window as any)._d && typeof (window as any)._d.res === 'function') {
      (window as any)._d.res({ title: tVal, desc: dVal, privacy: priv });
    }
  };

  return dlg(
    `<div style="text-align:right;direction:rtl">
      <b style="font-size:16px;display:block;margin-bottom:12px;color:var(--tx)">${isAr ? 'تفاصيل المنشور' : 'Post Details'}</b>
      
      <div style="margin-bottom:12px">
        <label style="font-size:12px;font-weight:700;color:var(--sub);display:block;margin-bottom:4px">${isAr ? 'عنوان المنشور (مطلوب)' : 'Post Title (required)'} *</label>
        <input id='post_title' class='fi' placeholder='${isAr ? 'اكتب عنوان المنشور هنا…' : 'Enter post title…'}'>
      </div>

      <div style="margin-bottom:12px">
        <label style="font-size:12px;font-weight:700;color:var(--sub);display:block;margin-bottom:4px">${isAr ? 'وصف المنشور (مطلوب)' : 'Post Description (required)'} *</label>
        <textarea id='post_desc' rows='3' class='fi' style='height:auto;padding:8px' placeholder='${isAr ? 'اكتب وصف المنشور هنا…' : 'Enter post description…'}'></textarea>
      </div>

      <div style='margin-top:8px'>
        <b style='font-size:12px;color:var(--sub)'>${isAr ? 'من يستطيع رؤية هذا المنشور؟' : 'Who can see this?'}</b>
        <div style='display:flex;flex-direction:column;gap:8px;margin-top:6px'>
          <label style='display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer'>
            <input type='radio' name='post_privacy' value='public' checked>
            <span>${isAr ? 'عام (الكل يستطيع رؤيته)' : 'Public (Everyone can see)'}</span>
          </label>
          <label style='display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer'>
            <input type='radio' name='post_privacy' value='contacts'>
            <span>${isAr ? 'فقط الذين يمتلكون رقمك أو معرفك الشخصي' : 'Only contacts with your number or personal ID'}</span>
          </label>
        </div>
      </div>

      <div style='display:flex;gap:8px;justify-content:flex-end;margin-top:14px'>
        <button style="padding:8px 18px;border-radius:12px;background:var(--sf);color:var(--tx)" onclick='window._d.res(null)'>${t('cancel')}</button>
        <button class='btn' style='width:auto;padding:0 24px;border-radius:12px' onclick='window.submitNewPostDialog()'>${isAr ? 'نشر' : 'Publish'}</button>
      </div>
    </div>`
  );
};

// Post Options Bottom Sheet (...)
const postOptionsDialog = (post: any, isOwner: boolean) =>
  dlg(
    `<div style="text-align:right;direction:rtl;width:100%">
      <h3 style="margin:0 0 6px">${esc(post.title || 'منشور')}</h3>
      <p style="font-size:13px;opacity:0.85;margin:0 0 12px">${esc(post.cap || post.desc || 'لا يوجد وصف')}</p>
      <div style="font-size:11px;color:var(--sub);margin-bottom:12px">
        📅 ${S.lang === 'ar' ? 'تاريخ النشر:' : 'Published:'} ${post.date || 'اليوم'} ${post.tm || ''}
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="st-row" onclick="window._d.res('download')">
          <span class="sq" style="background:#2f9cf4">${ic('download', 20)}</span>
          <div class="rt"><b>${S.lang === 'ar' ? 'تحميل وحفظ في الجهاز' : 'Download Media'}</b></div>
        </button>
        ${
          isOwner
            ? `<button class="st-row" onclick="window._d.res('delete')">
                <span class="sq" style="background:#ee1c2c">${ic('trash', 20)}</span>
                <div class="rt"><b style="color:#ff5a5a">${S.lang === 'ar' ? 'حذف المنشور' : 'Delete Post'}</b></div>
              </button>`
            : ''
        }
      </div>
    </div>
    <div style='display:flex;justify-content:flex-end;margin-top:8px'>
      <button style="color:var(--ac)" onclick='window._d.res(null)'>${t('cancel')}</button>
    </div>`
  );

function selTop() {
  const n = Object.keys(V.ms || {}).length;
  return `<div class='top'>
    <button class='ib' onclick="window.A('mx')">${ic('x')}</button>
    <div class='pill' style='flex:1'><b>${n} ${S.lang === 'ar' ? 'محدد' : 'Selected'}</b></div>
    <div class='pill2'>
      <button onclick="window.A('mcp')">${ic('copy', 22)}</button>
      <button onclick="window.A('mfw')">${ic('fwd', 22)}</button>
      <button onclick="window.A('dm')">${ic('trash', 22)}</button>
    </div>
  </div>`;
}

function selBar() {
  return `<div class='bar' style='gap:8px;background:none'>
    <button class='sbtn' onclick="window.A('mrep')">${ic('reply', 22)} ${t('rp')}</button>
    <button class='sbtn' onclick="window.A('mfw')">${t('fw')} ${ic('fwd', 22)}</button>
  </div>`;
}

function RX() {
  return `<div class='ep' style='width:92%;height:340px'>
    <p class='note' style='margin:6px'>${S.lang === 'ar' ? 'اضغط مطولًا لإرسال تفاعل خاص' : 'Press and hold to send a super reaction'}</p>
    <div class='eg'>${EM.map((x) => `<span onclick="window.A('rx','${x}')">${x}</span>`).join('')}</div>
  </div>`;
}

function cprofH() {
  const c = S.chats[V.c];
  if (!c) return '';
  const nb = c.s || c.g;
  return `<div class='top'><button class='ib' onclick="window.V.cp=0;window.R()">${ic('back')}</button></div>
  <div style='text-align:center;padding:10px'>
    ${c.s ? `<span class='av' style='background:var(--ac);margin:auto;width:96px;height:96px'>${ic('bookmark', 40)}</span>` : av(c.n, c.photo)}
    <h2 style='margin:10px 0 2px'>${esc(c.n)}</h2>
    <span style='color:var(--sub)'>${nb ? '' : formatLastSeen(c.p)}</span>
  </div>
  <div style='display:flex;gap:8px;padding:0 12px'>
    ${[
      ['chat', t('msg'), 'window.V.cp=0;window.R()'],
      ['bell', c.mute ? (S.lang === 'ar' ? 'تفعيل' : 'Unmute') : S.lang === 'ar' ? 'كتم' : 'Mute', 'window.A("mute")'],
      ...(nb
        ? []
        : [
            ['phone', S.lang === 'ar' ? 'اتصال' : 'Call', 'window.V.cp=0;window.A("call",0)'],
            ['video', S.lang === 'ar' ? 'مرئي' : 'Video', 'window.V.cp=0;window.A("call",1)']
          ])
    ]
      .map(
        (x) =>
          `<button class='sbtn' style='flex-direction:column;height:64px;border-radius:16px' onclick='${x[2]}'>
            ${ic(x[0], 22)}<span style='font-size:12px'>${x[1]}</span>
          </button>`
      )
      .join('')}
  </div>
  ${c.p ? `<div class='row' style='direction:ltr;margin-top:12px'><div class='rt'><b dir='ltr'>${c.p}</b><span>${t('pid')}</span></div></div>` : ''}`;
}

const NC = ['#2f9cf4', '#34c759', '#f5a623', '#ee4d5f', '#a35be8', '#2fb0d4'];
const BGS = ['#0a0a0c', '#16301f', '#14243a', '#2a1b3a', '#3a2a1b', '#bcd9a8'];
const TH = [
  ['#2b87e0', '#2f9cf4'],
  ['#3f9b5f', '#3fa86a'],
  ['#3a8fb7', '#3aa0c8'],
  ['#6a5be8', '#7a6cf0'],
  ['#d9567a', '#e2668a']
];
const SR = [
  ['acc', 'user', '#2f9cf4'],
  ['cs', 'chat', '#f5a623'],
  ['priv', 'lock', '#34c759'],
  ['nt', 'bell', '#ee4d5f'],
  ['ds', 'data', '#4b78e8'],
  ['fo', 'folder', '#2fb0d4'],
  ['dv', 'dev', '#1ea7b8'],
  ['ps', 'bat', '#f08a24'],
  ['lg', 'globe', '#a35be8']
];

const SS: Record<string, [string, string]> = {
  acc: ['ID, Username, Bio', 'المعرّف، اسم المستخدم، النبذة'],
  cs: ['Wallpaper, Night Mode, Animations', 'الخلفية، الوضع الليلي، الحركات'],
  priv: ['Last Seen, Devices, Passkeys', 'آخر ظهور، الأجهزة، البصمة'],
  nt: ['Sounds, Calls, Badges', 'الأصوات، المكالمات، الشارات'],
  ds: ['Media download settings', 'إعدادات تنزيل الوسائط'],
  fo: ['Sort chats into folders', 'ترتيب المحادثات في مجلدات'],
  dv: ['Manage connected devices', 'إدارة الأجهزة المتصلة'],
  ps: ['Reduce power usage on low charge', 'تقليل استهلاك الطاقة عند انخفاض الشحن']
};

const ss = (k: string) => SS[k]?.[S.lang === 'ar' ? 1 : 0] || '';

const X: Record<string, [string, string]> = {
  yn: ['Your name', 'اسمك'],
  ln: ['Last name', 'اللقب'],
  few: ['A few words about you.', 'بضع كلمات عنك.'],
  yi: ['Your Info', 'معلوماتك'],
  un: ['Username', 'اسم المستخدم'],
  abd: ['Add Birthday', 'إضافة تاريخ الميلاد'],
  bdn: ['Only your contacts can see your birthday.', 'جهات اتصالك فقط تستطيع رؤية تاريخ ميلادك.'],
  em: ['Email (tap to show or hide)', 'البريد الإلكتروني (اضغط للإظهار أو الإخفاء)'],
  pch: ['Personal channel', 'القناة الشخصية'],
  add: ['Add', 'إضافة'],
  cha: ['Chat Automation', 'أتمتة المحادثات'],
  chb: ['Add a bot to answer messages on your behalf.', 'أضف بوتًا للرد على الرسائل نيابةً عنك.'],
  aac: ['Add Account', 'إضافة حساب'],
  sw: ['Chat list actions', 'إجراءات السحب لقائمة المحادثات'],
  swd: ['Delete', 'حذف'],
  swf: ['Change folder', 'تغيير المجلّد'],
  swp: ['Pin', 'تثبيت'],
  swh: [
    'Choose the action performed when you swipe left in the chat list.',
    'اختيار الإجراء المراد تنفيذه عند تمريرك إلى اليسار في قائمة المحادثات.'
  ],
  auto: ['Auto-Night Mode', 'الوضع الليلي التلقائي'],
  autod: ['Follow the system appearance', 'اتباع مظهر النظام'],
  iab: ['In-App Browser', 'المتصفح داخل التطبيق'],
  iabd: ['Open external links within the app', 'فتح الروابط الخارجية داخل التطبيق'],
  anim: ['Animations', 'الحركات'],
  animd: ['Reduce motion effects to save power.', 'تقليل الحركات لتوفير الطاقة.'],
  stk: ['Stickers', 'الملصقات'],
  stkd: ['Manage stickers, emoji and reactions', 'إدارة الملصقات والرموز والتفاعلات'],
  ms: ['Media and Sound', 'الوسائط والصوت'],
  nm: ['Show next media on Tap', 'عرض الوسائط التالية بالنقر'],
  nmd: [
    'Tap near the edge of the screen while viewing media to navigate between photos',
    'انقر قرب حافة الشاشة أثناء عرض الوسائط للتنقل بين الصور'
  ],
  rl: ['Raise to Listen', 'الرفع للاستماع'],
  rld: [
    'Move audio to the earpiece by raising the phone to your ear',
    'نقل الصوت إلى سماعة الأذن عن طريق رفع الهاتف إلى أذنك'
  ],
  rs: ['Raise to Speak', 'الرفع للتحدث'],
  rsd: ['Record voice messages by raising the phone to your ear', 'تسجيل الرسائل الصوتية برفع الهاتف إلى أذنك'],
  pmr: ['Pause music while recording', 'إيقاف الموسيقى أثناء التسجيل'],
  pmrd: ['Pause music when you start recording a video message', 'إيقاف الموسيقى عند بدء تسجيل رسالة مرئية'],
  pmp: ['Pause music while playing media', 'إيقاف الموسيقى أثناء تشغيل الوسائط'],
  mic: ['Microphone for voice messages', 'الميكروفون للرسائل الصوتية'],
  bi: ['Built-In', 'مدمج'],
  os: ['Other Settings', 'إعدادات أخرى'],
  dsh: ['Direct Share', 'مشاركة مباشرة'],
  dshd: ['Show recent chats in the share menu', 'إظهار آخر المحادثات في قائمة المشاركة'],
  a18: ['Show 18+ Content', 'إظهار محتوى +18'],
  a18d: [
    'Do not hide media that contain content suitable only for adults',
    'عدم إخفاء الوسائط التي تحتوي على محتوى مناسب للبالغين فقط'
  ],
  ent: ['Send with Enter', 'إرسال بمفتاح الإدخال'],
  unit: ['Unit of measurement', 'وحدة القياس'],
  aut: ['Auto', 'تلقائي'],
  ts: ['Message text size', 'حجم خط الرسائل'],
  bg: ['Change chat background', 'تغيير خلفية المحادثة'],
  nc: ['Change name color', 'تغيير لون الاسم'],
  ct: ['Color theme', 'سمة الألوان'],
  dm: ['Switch to Day Mode', 'التبديل إلى الوضع النهاري'],
  nmo: ['Switch to Night Mode', 'التبديل إلى الوضع الليلي'],
  bt: ['Browse Themes', 'تصفح السمات'],
  mc: ['Message corners', 'زوايا الرسائل'],
  s1: ['Good morning! 👋', 'صباح الخير! 👋'],
  s3: ['It is morning here 😎', 'عندنا صباح هنا 😎'],
  sn: ['Sounds', 'الأصوات'],
  cl: ['Calls', 'المكالمات'],
  bd: ['Badges', 'الشارات'],
  bn: ['Browser notifications', 'إشعارات المتصفح'],
  md: ['Media auto-download', 'التنزيل التلقائي للوسائط'],
  ma: ['Photos', 'الصور'],
  mv: ['Videos', 'الفيديوهات'],
  ls: ['Last Seen', 'آخر ظهور'],
  ls_all: ['Everybody', 'الجميع'],
  ls_con: ['My Contacts', 'جهات اتصالي'],
  ls_non: ['Nobody', 'لا أحد'],
  help: ['Help', 'مساعدة'],
  prem: ['Hamudi Premium', 'حمودي بريميوم'],
  stars: ['Hamudi Stars', 'نجوم حمودي'],
  biz: ['Hamudi Business', 'حمودي للأعمال'],
  gift: ['Send a Gift', 'إرسال هدية'],
  ask: ['Ask a Question', 'اسأل سؤالاً'],
  faq: ['FAQ', 'الأسئلة الشائعة'],
  feat: ['Hamudi Features', 'ميزات حمودي'],
  pp: ['Privacy Policy', 'سياسة الخصوصية'],
  sp: ['Set Photo', 'تعيين صورة'],
  posts: ['Posts', 'المنشورات'],
  arch: ['Archived Posts', 'المنشورات المؤرشفة'],
  nop: ['No posts yet…', 'لا توجد منشورات بعد…'],
  nopd: ['Publish photos and videos to display on your profile page', 'انشر صورًا وفيديوهات لتظهر في صفحة ملفك'],
  ap: ['Add a post', 'إضافة منشور'],
  cap: ['Caption', 'وصف المنشور'],
  pc: ['Change profile color', 'تغيير لون الملف الشخصي'],
  cu: ['Change Username', 'تغيير اسم المستخدم'],
  cpl: ['Copy link to profile', 'نسخ رابط الملف الشخصي'],
  online: ['online', 'متصل'],
  lc: ['Link copied', 'تم نسخ الرابط'],
  unar: ['Unarchive', 'إلغاء الأرشفة'],
  arch2: ['Archive', 'أرشفة'],
  cam: ['Camera', 'الكاميرا'],
  gal: ['Gallery', 'المعرض'],
  fil: ['File', 'ملف'],
  fil2: ['Choose files', 'اختيار ملفات'],
  lcn: ['Location', 'الموقع'],
  cnt: ['Contact', 'جهة اتصال'],
  mus: ['Music', 'موسيقى'],
  mus2: ['Choose audio files', 'اختيار ملفات صوتية'],
  pol: ['Poll', 'استطلاع'],
  pq: ['Question', 'السؤال'],
  po: ['Option', 'خيار'],
  snd: ['Send', 'إرسال'],
  sloc: ['Send my location', 'إرسال موقعي'],
  llive: ['Live location needs a server.', 'الموقع المباشر يحتاج سيرفر.'],
  pe: ['Enter a question and at least 2 options', 'اكتب سؤالًا وخيارين على الأقل'],
  mkst: ['Create', 'إنشاء'],
  pv: ['Poll', 'استطلاع'],
  vts: ['votes', 'صوت'],
  idt: ['This ID is already in use. Choose another.', 'هذا المعرّف مستخدم. اختر معرفًا آخر.'],
  mx3: ['Maximum 3 accounts', 'الحد الأقصى 3 حسابات'],
  nfo: ['Create New Folder', 'إنشاء مجلد جديد'],
  fod: ['Sort chats into folders', 'ترتيب المحادثات في مجلدات'],
  nofo: ['Create a folder first in Settings > Chat Folders', 'أنشئ مجلدًا أولًا من الإعدادات > مجلدات المحادثات'],
  afo: ['Add to folder', 'إضافة إلى مجلد'],
  fname: ['Folder name', 'اسم المجلد'],
  fall: ['All', 'الكل'],
  ntu: [
    'Notifications are not available here (the preview page blocks them). They work when the app is hosted on your own site.',
    'الإشعارات غير متاحة هنا (صفحة المعاينة تمنعها). تعمل عند استضافة التطبيق على موقعك.'
  ],
  ntd: ['Permission not granted', 'لم يتم منح الإذن'],
  ntok: ['Notifications are on', 'تم تفعيل الإشعارات'],
  ntn: ['Real alerts for new messages need a server.', 'التنبيهات الحقيقية للرسائل الجديدة تحتاج سيرفر.'],
  ntt: ['Send a test notification', 'إرسال إشعار تجريبي'],
  dg: ['Run permission tests', 'فحص الصلاحيات'],
  dgd: ['Camera, microphone, location, clipboard', 'الكاميرا والمايك والموقع والحافظة']
};

const tr = (k: string) => X[k]?.[S.lang === 'ar' ? 1 : 0] || k;

const SL: Record<string, [string, string]> = {
  acc: ['Account', 'الحساب'],
  cs: ['Chat Settings', 'إعدادات المحادثة'],
  priv: ['Privacy & Security', 'الخصوصية والأمان'],
  nt: ['Notifications', 'الإشعارات'],
  ds: ['Data and Storage', 'البيانات والتخزين'],
  fo: ['Chat Folders', 'مجلدات المحادثات'],
  dv: ['Devices', 'الأجهزة'],
  ps: ['Power Saving', 'توفير الطاقة'],
  lg: ['Language', 'اللغة']
};

const sl = (k: string) => (SL[k] ? SL[k][S.lang === 'ar' ? 1 : 0] : tr(k));

const EM = Array.from(
  '😀😃😄😁😆😅😂🤣😊😇🙂😉😍🥰😘😋😎🤩🥳😏😒😞😔😢😭😤😠😡🤯😱😨😰🤔🤗🤭😴🤤😷🤒🥶🥵😈👻💀🤡👍👎👏🙌🙏🤝👊🤞👌👋💪💖🧡💛💚💙💜🖤💔🔥⭐🎉🎂🌹☕🍕⚽🚗✅❌'
);

const mk = (...rg: [number, number][]) =>
  rg
    .flatMap(([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)))
    .filter((c) => /\p{Emoji_Presentation}/u.test(c));

const EMC: [string, string[]][] = [
  ['😀', mk([0x1f600, 0x1f64f], [0x1f910, 0x1f92f], [0x1f970, 0x1f97a])],
  ['👍', mk([0x1f440, 0x1f450], [0x1f466, 0x1f478], [0x1f9d0, 0x1f9df], [0x1f4aa, 0x1f4aa])],
  ['🐶', mk([0x1f400, 0x1f43f], [0x1f980, 0x1f9ae], [0x1f330, 0x1f344])],
  ['🍔', mk([0x1f345, 0x1f37f], [0x1f950, 0x1f96f])],
  ['⚽', mk([0x1f380, 0x1f3ca], [0x26bd, 0x26be])],
  ['🚗', mk([0x1f680, 0x1f6c5], [0x1f3e0, 0x1f3f0], [0x1f300, 0x1f320])],
  ['💡', mk([0x1f4a1, 0x1f4ff], [0x1f500, 0x1f53d])],
  ['💖', mk([0x1f493, 0x1f49f], [0x2b50, 0x2b50], [0x1f525, 0x1f525], [0x1f4a5, 0x1f4af])]
];

function fit(f: File, mx: number): Promise<string | null> {
  return new Promise((res) => {
    const fr = new FileReader();
    fr.onerror = () => res(null);
    fr.onload = () => {
      if (!f.type.startsWith('image/')) return res(fr.result as string);
      const i = new Image();
      i.onerror = () => res(fr.result as string);
      i.onload = () => {
        const k = Math.min(1, mx / Math.max(i.width, i.height));
        const c = document.createElement('canvas');
        c.width = Math.round(i.width * k);
        c.height = Math.round(i.height * k);
        const ctx = c.getContext('2d');
        if (ctx) ctx.drawImage(i, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', 0.85));
      };
      i.src = fr.result as string;
    };
    fr.readAsDataURL(f);
  });
}

function EP() {
  const e = V.ep || 'e';
  const ec = V.ec || 0;
  let g = '';
  if (e === 'e') {
    g = EMC[ec][1].map((z) => `<span onclick="window.A('ae','${z}')">${z}</span>`).join('');
  } else if (e === 's') {
    g =
      `<label class='tile' for='stkf'>${ic('plus', 26)}<span>${tr('mkst')}</span></label>` +
      (S.stk || []).map((z: string, i: number) => `<img src='${z}' onclick="window.A('stk2',${i})" alt='' style='width:100%'>`).join('') +
      EM.slice(0, 24).map((z) => `<span onclick="window.A('stk','${z}')">${z}</span>`).join('') +
      `<input id='stkf' class='fh' type='file' accept='image/*' onchange="window.A('mkst',this.files[0])">`;
  } else {
    g = `<p class='note' style='grid-column:1/-1'>${t('srv')}</p>`;
  }
  return `<div class='ep'>
    ${
      e === 'e'
        ? `<div class='et' style='overflow:auto;justify-content:flex-start'>${EMC.map(
            (z, i) => `<button class='${ec === i ? 'on' : ''}' onclick="window.V.ec=${i};window.R()">${z[0]}</button>`
          ).join('')}</div>`
        : ''
    }
    <div class='eg ${e === 's' ? 'st' : ''}'>${g}</div>
    <div class='et'>
      ${[
        ['e', S.lang === 'ar' ? 'الرموز التعبيرية' : 'Emoji'],
        ['g', 'GIFs'],
        ['s', S.lang === 'ar' ? 'الملصقات' : 'Stickers']
      ]
        .map((z) => `<button class='${e === z[0] ? 'on' : ''}' onclick="window.V.ep='${z[0]}';window.R()">${z[1]}</button>`)
        .join('')}
      ${e === 'e' ? `<button onclick="window.A('bs')">${ic('backspace', 22)}</button>` : ''}
    </div>
  </div>`;
}

function LS() {
  return `<div class='sheet' style='justify-content:flex-end;align-items:stretch'>
    <div class='f' style='background:var(--bg);color:var(--tx);border-radius:20px 20px 0 0'>
      <b>${S.lang === 'ar' ? 'بدء البث المباشر' : 'Start Live Stream'}</b>
      ${['Everyone', 'Contacts', 'Close Friends', 'Selected Contacts']
        .map((x, i) => `<label><input type='radio' name='au' ${i ? '' : 'checked'}> ${x}</label>`)
        .join('')}
      <label><input type='checkbox' checked> Allow Comments</label>
      <label><input type='checkbox' checked> Allow Screenshots</label>
      <button class='btn' onclick='window.V.cam.set=0;window.R()'>OK</button>
    </div>
  </div>`;
}

function camH(a: any) {
  const c = V.cam;
  a.innerHTML = `<div class='cam'>
    <video id='cv' playsinline muted></video>
    <div class='top'>
      <button class='ib' onclick='window.A("camx")'>${ic('back')}</button>
      <b style='flex:1;text-align:center;color:#f55'>${c.rec ? '● REC' : ''}</b>
      ${c.m === 'live' ? `<button class='ib' onclick='window.V.cam.set=1;window.R()'>${ic('gear', 22)}</button>` : ''}
    </div>
    ${c.set ? LS() : ''}
    <div class='r'>
      ${
        c.m === 'live'
          ? `<button class='btn' style='background:#e0455c' onclick='toast(t("srv"))'>Start Live Stream</button>`
          : `<span style='width:48px'></span>
             <button class='shut ${c.m === 'video' ? 'v' : ''}' onclick='window.A("shot")'></button>
             <button class='ib' onclick='window.V.cam.f=window.V.cam.f==="user"?"environment":"user";window.cam2()'>${ic(
               'flip',
               24
             )}</button>`
      }
    </div>
    <div class='mds'>
      ${[
        ['live', 'Live'],
        ['photo', 'Photo'],
        ['video', 'Video']
      ]
        .map((x) => `<button class='${c.m === x[0] ? 'on' : ''}' onclick='window.A("cm","${x[0]}")'>${x[1]}</button>`)
        .join('')}
    </div>
  </div>`;
  const vid = document.getElementById('cv') as HTMLVideoElement;
  if (vid && c.s) {
    vid.srcObject = c.s;
    vid.play().catch(() => {});
  }
}

async function cam2() {
  const c = V.cam;
  if (c.s) c.s.getTracks().forEach((x: any) => x.stop());
  try {
    c.s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: c.f },
      audio: c.m === 'video'
    });
  } catch (e: any) {
    c.s = null;
    toast(t('perm') + ' (' + (e.name || 'error') + ')');
  }
  R();
}

function TG(k: string, ti: string, sb?: string) {
  return `<button class='st-row' onclick="window.A('tg','${k}')">
    <div class='rt'><b>${tr(ti)}</b>${sb ? `<span style='white-space:normal'>${tr(sb)}</span>` : ''}</div>
    <span class='sw ${S.o[k] ? 'on' : ''}'><i></i></span>
  </button>`;
}

function RAD(k: string, v: string, ti: string) {
  return `<button class='st-row' onclick="window.A('opt','${k}','${v}')">
    <div class='rt'><b>${tr(ti)}</b></div>
    <span class='sw ${S.o[k] === v ? 'on' : ''}'><i></i></span>
  </button>`;
}

function CS() {
  const o = S.o;
  return `<div class='cardf'>
    <div class='ct'>${tr('sw')}</div>
    ${RAD('swipe', 'del', 'swd')}
    ${RAD('swipe', 'fold', 'swf')}
    ${RAD('swipe', 'pin', 'swp')}
    <p class='note' style='text-align:start'>${tr('swh')}</p>
  </div>
  <div class='cardf'>
    ${TG('auto', 'auto', 'autod')}
    ${TG('iab', 'iab', 'iabd')}
    <button class='st-row' onclick="window.A('ps')">
      <div class='rt'><b>${tr('anim')}</b><span style='white-space:normal'>${tr('animd')}</span></div>
      <span class='sw ${S.ps ? 'on' : ''}'><i></i></span>
    </button>
    <button class='st-row' onclick="toast(t('soon'))">
      <div class='rt'><b>${tr('stk')}</b><span>${tr('stkd')}</span></div>
    </button>
  </div>
  <div class='cardf'>
    <div class='ct'>${tr('ms')}</div>
    ${TG('nm', 'nm', 'nmd')}
    ${TG('rl', 'rl', 'rld')}
    ${TG('rs', 'rs', 'rsd')}
    ${TG('pmr', 'pmr', 'pmrd')}
    ${TG('pmp', 'pmp')}
    <div class='st-row'><div class='rt'><b>${tr('mic')}</b></div><b style='color:var(--ac)'>${tr('bi')}</b></div>
  </div>
  <div class='cardf'>
    <div class='ct'>${tr('os')}</div>
    ${TG('ds2', 'dsh', 'dshd')}
    ${TG('a18', 'a18', 'a18d')}
    ${TG('enter', 'ent')}
    <div class='st-row'><div class='rt'><b>${tr('unit')}</b></div><b style='color:var(--ac)'>${tr('aut')}</b></div>
  </div>
  <div class='cardf'>
    <div class='ct'>${tr('ts')}: <span id='sl_sf'>${o.sf}</span></div>
    <input type='range' min='12' max='30' value='${o.sf}' oninput='window.ssl("sf",this.value)' style='width:100%'>
    <div class='chat' style='border-radius:14px;padding:10px;min-height:0;${bgStyle()}'>
      <div class='msgs' style='overflow:visible'>
        <div class='mw'><div class='m' style='margin-left:0'>${tr('s1')}</div></div>
        <div class='mw'><div class='m out'>${tr('s3')}</div></div>
      </div>
    </div>
    <label class='st-row' for='bgf'><div class='rt'><b style='color:var(--ac)'>${tr('bg')}</b></div>${ic('img', 22)}</label>
    <input id='bgf' class='fh' type='file' accept='image/*' onchange="window.A('bgf',this.files[0])">
    <div class='chips'><i style='background:var(--sf);border-color:var(--sub)' onclick="window.A('bgc',-1)"></i>${BGS.map(
      (c, i) => `<i class='${o.bg && o.bg.v === c ? 'on' : ''}' style='background:${c}' onclick="window.A('bgc',${i})"></i>`
    ).join('')}</div>
    <div class='ct'>${tr('nc')}</div>
    <div class='chips'>${NC.map(
      (c, i) => `<i class='${o.nc === i ? 'on' : ''}' style='background:${c}' onclick="window.A('opt','nc',${i})"></i>`
    ).join('')}</div>
  </div>
  <div class='cardf'>
    <div class='ct'>${tr('ct')}</div>
    <div class='thm'>${TH.map(
      (c, i) =>
        `<i class='${o.th === i ? 'on' : ''}' onclick="window.A('opt','th',${i})"><span style='display:block;width:64px;height:22px;border-radius:12px;background:${
          c[0]
        };margin-bottom:8px'></span>${['🏠', '🐥', '⛄', '💎', '🌸'][i]}</i>`
    ).join('')}</div>
    <button class='st-row' onclick="window.A('theme')"><div class='rt'><b style='color:var(--ac)'>${
      S.theme === 'dark' ? tr('dm') : tr('nmo')
    }</b></div>${ic('contrast', 22)}</button>
    <button class='st-row' onclick="toast(t('soon'))"><div class='rt'><b style='color:var(--ac)'>${tr('bt')}</b></div></button>
  </div>
  <div class='cardf'>
    <div class='ct'>${tr('mc')}: <span id='sl_br'>${o.br}</span></div>
    <input type='range' min='0' max='20' value='${o.br}' oninput='window.ssl("br",this.value)' style='width:100%'>
  </div>
  <div class='cardf'>
    <div class='ct'>${t('font')}</div>
    <select onchange="window.S.font=this.value;window.save();window.R()" style='width:100%;height:46px;background:var(--sf);border-radius:12px;padding:0 10px'>
      ${FONTS.map((z) => `<option ${S.font === z ? 'selected' : ''}>${z}</option>`).join('')}
    </select>
  </div>`;
}

// Global Action Dispatcher
async function A(k: string, a?: any, b?: any) {
  const c = S.chats[V.c];

  if (k === 'reg') {
    const e = $('#ue').value.trim();
    const p = $('#up').value;
    if (!okE(e)) return toast(t('ie'));
    if (!okP(p)) return toast(t('ip'));
    const s = crypto.randomUUID();
    S.acc = { e, s, h: await hash(s, p), ok: 0 };
    V.a = 'ver';
    V.code = String(Math.floor(100000 + Math.random() * 900000));
    save();
    R();
    return;
  }

  // Google Login - Real Google Account Selection + Google Drive Backup & Restore
  if (k === 'google') {
    const isAr = S.lang === 'ar';
    let signInRes: { user: any; accessToken: string } | null = null;
    try {
      signInRes = await googleSignInWithDrive();
    } catch (err: any) {
      const code = String(err?.code || '');
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return;
      }
      if (code === 'auth/popup-blocked') {
        toast(isAr ? 'يرجى السماح بفتح النوافذ المنبثقة للمتابعة مع Google' : 'Please allow popups to sign in with Google');
        return;
      }
      toast(isAr ? 'تعذر تسجيل الدخول عبر Google' : 'Google sign-in failed');
      return;
    }

    if (!signInRes || !signInRes.user) return;
    const { user, accessToken } = signInRes;
    const email = user.email || '';
    const name = user.displayName || email.split('@')[0] || (isAr ? 'مستخدم جديد' : 'New User');

    // Check Google Drive for an existing backup of this user's data
    let existingBackup: any = null;
    try {
      existingBackup = await findDriveBackup(accessToken);
    } catch (e) {}

    if (existingBackup) {
      const choice = await dlg(
        `<div style="text-align:center;padding:4px 0">
          <h3 style="margin:4px 0 6px;font-size:16px;font-weight:700">${
            isAr ? 'تم العثور على نسخة في Google Drive' : 'Google Drive Backup Found'
          }</h3>
          <p class="note" style="margin:0 0 12px;font-size:13px">${
            isAr
              ? `مرحباً ${esc(name)}، توجد بيانات محفوظة لحسابك في Google Drive. هل تريد استعادتها؟`
              : `Welcome ${esc(name)}, a saved backup was found in your Google Drive. Restore it?`
          }</p>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn" onclick="window._d.res('restore')">${
              isAr ? 'استعادة حسابي وبياناتي من Drive' : 'Restore my account from Drive'
            }</button>
            <button class="btn g" onclick="window._d.res('new')">${
              isAr ? 'إعداد ملف شخصي جديد' : 'Set up a new profile'
            }</button>
          </div>
        </div>`
      );

      if (choice === 'restore') {
        try {
          const data = await downloadDriveBackup(accessToken, existingBackup.id);
          if (data && data.user) {
            S.acc = { e: email, s: crypto.randomUUID(), h: 'google-oauth-authenticated', ok: 1, uid: user.uid };
            S.user = data.user;
            S.chats = data.chats || { saved: { n: t('sv'), m: [], s: 1 } };
            S.posts = data.posts || [];
            S.stk = data.stk || [];
            S.fl = data.fl || [];
            S.in = 1;
            V.add = 0;
            V.t = 'chats';
            V.driveFileId = existingBackup.id;
            processedMsgIds.clear();
            save();
            syncUserToServer(S.user);
            pollRealtimeMessages();
            R();
            toast(isAr ? 'تمت استعادة الحساب والبيانات من Google Drive' : 'Account restored from Google Drive');
            return;
          }
        } catch (e) {
          toast(isAr ? 'تعذر تحميل النسخة من Drive، سيتم المتابعة كحساب جديد' : 'Could not download Drive backup');
        }
      }
      V.existingDriveFileId = existingBackup.id;
    } else {
      V.existingDriveFileId = null;
    }

    const s = crypto.randomUUID();
    S.acc = { e: email, s, h: 'google-oauth-authenticated', ok: 1, uid: user.uid };
    V.a = 'prof';
    V.nm = name;
    V.ph = user.photoURL || null;
    V.pid = '';
    V.pidDigits = Array(8).fill('');
    save();
    R();
    return;
  }

  if (k === 'ver') {
    const v = [...document.querySelectorAll('.cd')].map((x: any) => x.value).join('');
    if (v !== V.code) return toast(S.lang === 'ar' ? 'الرمز غير صحيح' : 'Wrong code');
    S.acc.ok = 1;
    V.a = 'prof';
    V.nm = '';
    V.ph = null;
    V.pid = '';
    V.pidDigits = Array(8).fill('');
    save();
    R();
    return;
  }

  if (k === 'log') {
    const e = $('#ue').value.trim();
    const p = $('#up').value;
    if (!S.acc || !S.acc.ok || S.acc.e !== e || S.acc.h !== (await hash(S.acc.s, p))) {
      return toast(t('wr'));
    }
    if (!S.user) {
      V.a = 'prof';
      V.nm = '';
      V.ph = null;
      V.pid = '';
      V.pidDigits = Array(8).fill('');
      R();
      return;
    }
    S.in = 1;
    processedMsgIds.clear();
    save();
    syncUserToServer(S.user);
    pollRealtimeMessages();
    R();
    return;
  }

  if (k === 'ph') {
    if (a) {
      sq(a, (d) => {
        V.nm = $('#un').value;
        V.bio = $('#ubio') ? $('#ubio').value : '';
        V.ph = d;
        R();
      });
    }
    return;
  }

  if (k === 'fin') {
    const n = $('#un').value.trim();
    if (!n) return toast(t('nm2'));
    const bio = $('#ubio') ? $('#ubio').value.trim() : '';
    V.prof = { n, photo: V.ph, bio };
    V.pidDigits = Array(8).fill('');
    V.a = 'pid';
    R();
    return;
  }

  if (k === 'pidok') {
    const v = [...document.querySelectorAll('.cd')].map((x: any) => x.value).join('');
    if (!/^\d{8}$/.test(v)) return toast(t('idb'));
    if (idTaken(v)) return toast(tr('idt'));

    const candidateUser = {
      n: V.prof.n,
      photo: V.prof.photo,
      bio: V.prof.bio || '',
      id: v,
      cover: null,
      hideE: false,
      hideId: false
    };
    const ownerId = S.acc?.uid || S.acc?.e || S.acc?.s || crypto.randomUUID();

    // Verify and reserve this 8-digit ID atomically on the server
    try {
      const regRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...candidateUser, ownerId, isNew: true })
      });
      if (regRes.status === 409) {
        fetchServerUsers();
        return toast(tr('idt'));
      }
      if (regRes.ok) {
        const regData = await regRes.json();
        if (regData?.taken) {
          fetchServerUsers();
          return toast(tr('idt'));
        }
      }
    } catch (e) {
      // Fallback check via GET if POST errored transiently
      try {
        const chk = await fetch('/api/users/check/' + encodeURIComponent(v), { cache: 'no-store' });
        if (chk.ok) {
          const chkData = await chk.json();
          if (chkData?.taken) return toast(tr('idt'));
        }
      } catch (_) {}
    }

    S.user = candidateUser;
    S.in = 1;
    V.add = 0;
    V.t = 'chats';
    processedMsgIds.clear();
    save();
    fetchServerUsers();
    pollRealtimeMessages();
    R();

    // Save initial backup to Google Drive if signed in with Google
    const driveToken = getCachedDriveToken();
    if (driveToken) {
      const payload = {
        user: S.user,
        chats: S.chats,
        posts: S.posts || [],
        stk: S.stk || [],
        fl: S.fl || [],
        updatedAt: Date.now()
      };
      if (!V.existingDriveFileId) {
        uploadNewDriveBackup(driveToken, payload)
          .then((f) => {
            V.driveFileId = f.id;
            toast(S.lang === 'ar' ? 'تم ربط وحفظ بياناتك في Google Drive' : 'Saved to Google Drive');
          })
          .catch(() => {});
      } else {
        const isAr = S.lang === 'ar';
        const overwriteOk = await dlg(
          `<div style="text-align:center;padding:4px 0">
            <b>${isAr ? 'تحديث نسخة Google Drive' : 'Update Google Drive Backup'}</b>
            <p class="note" style="margin:8px 0 12px">${
              isAr
                ? 'توجد نسخة احتياطية سابقة في Google Drive. هل تريد استبدالها بملفك الشخصي الجديد؟'
                : 'An existing backup exists in Google Drive. Replace it with your new profile?'
            }</p>
            <div style="display:flex;gap:8px;justify-content:flex-end">
              <button class="btn g" style="width:auto;padding:0 16px" onclick="window._d.res(0)">${t('cancel')}</button>
              <button class="btn" style="width:auto;padding:0 16px" onclick="window._d.res(1)">${
                isAr ? 'تحديث النسخة' : 'Update'
              }</button>
            </div>
          </div>`
        );
        if (overwriteOk) {
          overwriteDriveBackup(driveToken, V.existingDriveFileId, payload)
            .then((f) => {
              V.driveFileId = f.id;
              toast(isAr ? 'تم تحديث النسخة في Google Drive' : 'Google Drive backup updated');
            })
            .catch(() => {});
        }
      }
    }
    return;
  }

  // Cover photo upload
  if (k === 'uploadCover') {
    if (!a) return;
    const d = await fit(a, 1280);
    if (d) {
      S.user.cover = d;
      save();
      R();
      toast(S.lang === 'ar' ? 'تم تحديث صورة الغلاف' : 'Cover updated');
    }
    return;
  }

  if (k === 'toggleHideId') {
    S.user.hideId = !S.user.hideId;
    save();
    R();
    return;
  }

  // Story: open add story
  if (k === 'openAddStory') {
    const opt = await dlg(
      `<div style="text-align:center;padding:10px 0">
        <h3>${S.lang === 'ar' ? 'إضافة إلى قصتي' : 'Add to My Story'}</h3>
        <p class="note">${S.lang === 'ar' ? 'اختر صورة أو فيديو لقصتك لتظهر للأصدقاء' : 'Add a photo or video story'}</p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:14px">
          <label class="btn" for="st_file" style="cursor:pointer">
            ${ic('img', 20)} ${S.lang === 'ar' ? 'اختيار وسائط' : 'Choose media'}
          </label>
          <input id="st_file" class="fh" type="file" accept="image/*,video/*" onchange="window.A('uploadStory',this.files[0])">
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end">
        <button onclick="window._d.res(null)">${t('cancel')}</button>
      </div>`
    );
    return;
  }

  if (k === 'uploadStory') {
    if (!a) return;
    const isVid = a.type.startsWith('video');
    const d = await fit(a, 1280);
    if (!d) return;

    S.stories = S.stories || [];
    const newStory = {
      id: Date.now(),
      userId: S.user.id,
      authorName: S.user.n,
      authorPhoto: S.user.photo,
      t: isVid ? 'vd' : 'i',
      x: d,
      seen: false,
      tm: tm()
    };
    S.stories.unshift(newStory);
    save();
    R();
    toast(S.lang === 'ar' ? 'تمت إضافة القصة بنجاح' : 'Story added');
    return;
  }

  if (k === 'viewStory') {
    const friendsStories = (S.stories || []).filter((st: any) => st.userId !== S.user?.id);
    const target = friendsStories[a];
    if (target) {
      target.seen = true;
      save();
      V.storyViewer = { story: target, idx: a };
      R();
    }
    return;
  }

  if (k === 'closeStoryViewer') {
    V.storyViewer = null;
    R();
    return;
  }

  // Post Editor flow
  if (k === 'openPostEditor') {
    const existingInput = document.getElementById('pf4') as HTMLInputElement | null;
    if (existingInput) {
      existingInput.click();
    } else {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*,video/*';
      inp.onchange = () => {
        const file = inp.files && inp.files[0];
        if (file) window.A('startPostEditor', file);
      };
      inp.click();
    }
    return;
  }

  if (k === 'startPostEditor') {
    if (!a) return;
    const isVid = a.type.startsWith('video') || /\.(mp4|mov|webm|mkv|m4v|avi)$/i.test(a.name || '');

    if (isVid) {
      const det = await postDetailsDialog();
      if (!det) return;
      toast(S.lang === 'ar' ? 'جاري حفظ ورفع الفيديو…' : 'Saving video…');
      let mediaUrl = await uploadMediaFile(a, a.name || 'video.mp4');
      if (!mediaUrl && a.size < 2 * 1024 * 1024) {
        mediaUrl = await fit(a, 1280);
      }
      if (!mediaUrl) {
        toast(S.lang === 'ar' ? 'تعذر حفظ الفيديو، يرجى المحاولة مرة أخرى' : 'Could not save video');
        return;
      }
      const newPost = {
        id: Date.now(),
        userId: S.user.id,
        authorName: S.user.n,
        authorPhoto: S.user.photo,
        t: 'vd',
        x: mediaUrl,
        title: det.title,
        cap: det.desc,
        privacy: det.privacy,
        likes: 0,
        liked: false,
        views: 1,
        viewers: [S.user.id],
        comments: [],
        ar: 0,
        date: new Date().toLocaleDateString(S.lang === 'ar' ? 'ar-EG' : 'en-US'),
        tm: tm()
      };
      (S.posts = S.posts || []).unshift(newPost);
      cachedServerPosts = cachedServerPosts.filter((p) => p.id !== newPost.id);
      cachedServerPosts.unshift(newPost);
      try {
        localStorage.setItem('hm_posts_feed', JSON.stringify(cachedServerPosts));
      } catch (e) {}
      await syncPostToServer(newPost);
      save();
      R();
      toast(S.lang === 'ar' ? 'تم نشر الفيديو بنجاح' : 'Video published');
    } else {
      const d = await fit(a, 1280);
      if (!d) return;
      // Image editor with crop, rotate, filter, and text overlay
      V.editor = {
        originalSrc: d,
        rotation: 0,
        filter: 'none',
        text: '',
        textColor: '#ffffff'
      };
      R();
    }
    return;
  }

  if (k === 'editorRotate') {
    if (V.editor) {
      V.editor.rotation = (V.editor.rotation + 90) % 360;
      renderEditorCanvas();
    }
    return;
  }

  if (k === 'editorCycleFilter') {
    if (V.editor) {
      const filters = ['none', 'bw', 'sepia', 'bright'];
      const curIdx = filters.indexOf(V.editor.filter);
      V.editor.filter = filters[(curIdx + 1) % filters.length];
      renderEditorCanvas();
    }
    return;
  }

  if (k === 'editorAddText') {
    const txt = await ask(S.lang === 'ar' ? 'اكتب النص الذي تريد إضافته على الصورة' : 'Enter text overlay', V.editor?.text || '');
    if (txt !== null && V.editor) {
      V.editor.text = txt;
      renderEditorCanvas();
    }
    return;
  }

  if (k === 'finishEditingMedia') {
    const canvas = document.getElementById('editor_canvas') as HTMLCanvasElement;
    const fallbackData = canvas ? canvas.toDataURL('image/jpeg', 0.88) : V.editor.originalSrc;
    let finalBlob: Blob | null = null;
    if (canvas) {
      finalBlob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.88));
    }
    V.editor = null;
    R();

    // Now ask for title, description and privacy
    const det = await postDetailsDialog();
    if (!det) return;

    let finalUrl = finalBlob ? await uploadMediaFile(finalBlob, 'post_image.jpg') : null;
    if (!finalUrl) finalUrl = fallbackData;

    const newPost = {
      id: Date.now(),
      userId: S.user.id,
      authorName: S.user.n,
      authorPhoto: S.user.photo,
      t: 'i',
      x: finalUrl,
      title: det.title,
      cap: det.desc,
      privacy: det.privacy,
      likes: 0,
      liked: false,
      views: 1,
      viewers: [S.user.id],
      comments: [],
      ar: 0,
      date: new Date().toLocaleDateString(S.lang === 'ar' ? 'ar-EG' : 'en-US'),
      tm: tm()
    };
    (S.posts = S.posts || []).unshift(newPost);
    cachedServerPosts = cachedServerPosts.filter((p) => p.id !== newPost.id);
    cachedServerPosts.unshift(newPost);
    try {
      localStorage.setItem('hm_posts_feed', JSON.stringify(cachedServerPosts));
    } catch (e) {}
    await syncPostToServer(newPost);
    save();
    R();
    toast(S.lang === 'ar' ? 'تم نشر المنشور بنجاح' : 'Post published');
    return;
  }

  // Shorts / TikTok Fullscreen Feed
  if (k === 'openFeedFromList') {
    const isArchived = !!V.pa;
    let list: any[] = [];

    if (a === -1) {
      // Circle 2 "الكل": All posts in the app (my posts + other people's posts!)
      const seenIds = new Set<any>();
      const combined = [
        ...(S.posts || []).filter((p: any) => !p.ar),
        ...getGlobalPosts().filter((p: any) => !p.ar)
      ];
      list = combined.filter((p) => {
        if (seenIds.has(p.id)) return false;
        seenIds.add(p.id);
        return true;
      });

      if (!list.length) {
        toast(S.lang === 'ar' ? 'لا توجد منشورات حالياً' : 'No posts yet');
        return;
      }
    } else if (b) {
      // Specific author posts
      list = (S.posts || []).filter((p: any) => (p.userId || S.user?.id) === b && !!p.ar === isArchived);
      if (!list.length) {
        list = getGlobalPosts().filter((p: any) => (p.userId || S.user?.id) === b && !!p.ar === isArchived);
      }
    } else {
      list = (S.posts || []).filter((p: any) => !!p.ar === isArchived);
      if (!list.length) {
        list = getGlobalPosts().filter((p: any) => !p.ar);
      }
    }

    if (!list.length) {
      toast(S.lang === 'ar' ? 'لا توجد منشورات لعرضها' : 'No posts to display');
      return;
    }

    const idx = a === -1 ? 0 : list.findIndex((p: any) => p.id === a);
    const targetPost = list[idx >= 0 ? idx : 0];
    if (targetPost) {
      recordPostView(targetPost);
    }

    V.feed = {
      posts: list,
      index: Math.max(0, idx)
    };
    V.commentsOpen = false;
    V.showDeleteConfirm = false;
    V.activeCommentMenu = null;
    V.feedInfoOpen = false;
    R();
    return;
  }

  if (k === 'closeFeed') {
    V.feedAnimating = false;
    V.feed = null;
    V.commentsOpen = false;
    V.showDeleteConfirm = false;
    V.activeCommentMenu = null;
    V.feedInfoOpen = false;
    R();
    return;
  }

  if (k === 'nextFeedPost' || k === 'prevFeedPost') {
    if (!V.feed || V.feedAnimating) return;
    const isNext = k === 'nextFeedPost';
    if (isNext && V.feed.index >= V.feed.posts.length - 1) return;
    if (!isNext && V.feed.index <= 0) return;

    const commitSwitch = () => {
      V.feedAnimating = false;
      if (!V.feed) return;
      if (isNext && V.feed.index < V.feed.posts.length - 1) V.feed.index++;
      else if (!isNext && V.feed.index > 0) V.feed.index--;
      const p = V.feed.posts[V.feed.index];
      if (p) recordPostView(p);
      V.commentsOpen = false;
      V.showDeleteConfirm = false;
      V.activeCommentMenu = null;
      V.feedInfoOpen = false;
      R();
    };

    const track = document.getElementById('shorts_track');
    if (track) {
      V.feedAnimating = true;
      const sv = document.getElementById('shorts_video') as HTMLVideoElement;
      if (sv) sv.pause();
      track.style.transition = 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)';
      track.style.transform = `translate3d(0, ${isNext ? '-100%' : '100%'}, 0)`;
      setTimeout(commitSwitch, 310);
    } else {
      commitSwitch();
    }
    return;
  }

  if (k === 'handleFeedSingleTap') {
    const sv = document.getElementById('shorts_video') as HTMLVideoElement;
    const ind = document.getElementById('feed_pp_indicator');
    if (sv) {
      // If audio was muted by browser autoplay policy, unmute on first tap
      if (V.browserAutoplayMuted || (sv.muted && !V.userMutedIntent)) {
        sv.muted = false;
        V.feedMuted = false;
        V.browserAutoplayMuted = false;
        const mb = document.getElementById('feed_mute_btn');
        if (mb) mb.innerHTML = ic('vol', 20);
      }

      if (sv.paused) {
        sv.play().catch(() => {});
        if (ind) {
          ind.innerHTML = ic('play', 40);
          ind.style.display = 'flex';
          setTimeout(() => { if (ind) ind.style.display = 'none'; }, 600);
        }
      } else {
        sv.pause();
        if (ind) {
          ind.innerHTML = ic('pause', 40);
          ind.style.display = 'flex';
          setTimeout(() => { if (ind) ind.style.display = 'none'; }, 600);
        }
      }
    }
    return;
  }

  if (k === 'handleFeedDoubleTap') {
    if (V.feed) {
      const p = V.feed.posts[V.feed.index];
      if (!p.liked) {
        p.liked = true;
        p.likes = (p.likes || 0) + 1;
        save();
        saveGlobalPost(p);
      }
      updateFeedOverlays(p);
      const b = document.getElementById('feed_heart_burst');
      if (b) {
        b.style.display = 'flex';
        b.classList.remove('burst-anim');
        void b.offsetWidth;
        b.classList.add('burst-anim');
        setTimeout(() => { if (b) b.style.display = 'none'; }, 800);
      }
    }
    return;
  }

  if (k === 'toggleFeedSound') {
    const sv = document.getElementById('shorts_video') as HTMLVideoElement;
    const btn = document.getElementById('feed_mute_btn');
    if (sv) {
      sv.muted = !sv.muted;
      V.feedMuted = sv.muted;
      V.userMutedIntent = sv.muted;
      V.browserAutoplayMuted = false;
      if (btn) btn.innerHTML = ic(sv.muted ? 'volmute' : 'vol', 20);
      toast(sv.muted ? (S.lang === 'ar' ? 'تم كتم الصوت 🔇' : 'Muted') : (S.lang === 'ar' ? 'تم تشغيل الصوت 🔊' : 'Sound on'));
    }
    return;
  }

  if (k === 'toggleFeedLike') {
    if (V.feed) {
      const p = V.feed.posts[V.feed.index];
      p.liked = !p.liked;
      p.likes = (p.likes || 0) + (p.liked ? 1 : -1);
      if (p.liked) {
        const b = document.getElementById('feed_heart_burst');
        if (b) {
          b.style.display = 'flex';
          b.classList.remove('burst-anim');
          void b.offsetWidth;
          b.classList.add('burst-anim');
          setTimeout(() => { if (b) b.style.display = 'none'; }, 800);
        }
      }
      save();
      saveGlobalPost(p);
      updateFeedOverlays(p);
    }
    return;
  }

  if (k === 'openFeedComments') {
    V.commentsOpen = !V.commentsOpen;
    if (V.feed) updateFeedOverlays(V.feed.posts[V.feed.index]);
    return;
  }

  if (k === 'closeFeedComments') {
    V.commentsOpen = false;
    V.activeCommentMenu = null;
    V.replyingTo = null;
    V.replyingToCommentId = null;
    if (V.feed) updateFeedOverlays(V.feed.posts[V.feed.index]);
    return;
  }

  if (k === 'cancelReply') {
    V.replyingTo = null;
    V.replyingToCommentId = null;
    if (V.feed) updateFeedOverlays(V.feed.posts[V.feed.index]);
    return;
  }

  if (k === 'addComment') {
    const input = document.getElementById('new_comm_input') as HTMLInputElement;
    const text = input ? input.value.trim() : '';
    if (!text || !V.feed) return;

    const p = V.feed.posts[V.feed.index];
    p.comments = p.comments || [];

    if (V.replyingToCommentId) {
      const parent = p.comments.find((x: any) => x.id === V.replyingToCommentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          authorName: S.user.n,
          authorPhoto: S.user.photo,
          text,
          tm: tm()
        });
        V.openReplies = V.openReplies || {};
        V.openReplies[parent.id] = true;
      } else {
        p.comments.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          authorName: S.user.n,
          authorPhoto: S.user.photo,
          text,
          tm: tm(),
          likes: 0,
          liked: false,
          pinned: false,
          creatorHeart: false,
          replies: []
        });
      }
    } else {
      p.comments.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        authorName: S.user.n,
        authorPhoto: S.user.photo,
        text,
        tm: tm(),
        likes: 0,
        liked: false,
        pinned: false,
        creatorHeart: false,
        replies: []
      });
    }

    save();
    saveGlobalPost(p);
    V.replyingTo = null;
    V.replyingToCommentId = null;
    if (input) input.value = '';
    updateFeedOverlays(p);
    return;
  }

  if (k === 'toggleCommentLike') {
    if (!V.feed) return;
    const p = V.feed.posts[V.feed.index];
    const c = (p.comments || []).find((x: any) => x.id === a);
    if (c) {
      c.liked = !c.liked;
      c.likes = (c.likes || 0) + (c.liked ? 1 : -1);
      save();
      saveGlobalPost(p);
      updateFeedOverlays(p);
    }
    return;
  }

  if (k === 'toggleRepliesThread') {
    V.openReplies = V.openReplies || {};
    V.openReplies[a] = !V.openReplies[a];
    if (V.feed) updateFeedOverlays(V.feed.posts[V.feed.index]);
    return;
  }

  if (k === 'openCommentOptions') {
    V.activeCommentMenu = a;
    if (V.feed) updateFeedOverlays(V.feed.posts[V.feed.index], true);
    return;
  }

  if (k === 'closeCommentOptions') {
    V.activeCommentMenu = null;
    if (V.feed) updateFeedOverlays(V.feed.posts[V.feed.index], true);
    return;
  }

  if (k === 'toggleCommentPin') {
    if (!V.feed) return;
    const p = V.feed.posts[V.feed.index];
    const c = (p.comments || []).find((x: any) => x.id === a);
    if (c) {
      c.pinned = !c.pinned;
      save();
      saveGlobalPost(p);
      V.activeCommentMenu = null;
      updateFeedOverlays(p);
      toast(c.pinned ? (S.lang === 'ar' ? 'تم تثبيت التعليق 📌' : 'Comment pinned') : (S.lang === 'ar' ? 'تم إلغاء التثبيت' : 'Unpinned'));
    }
    return;
  }

  if (k === 'toggleCommentHeart') {
    if (!V.feed) return;
    const p = V.feed.posts[V.feed.index];
    const c = (p.comments || []).find((x: any) => x.id === a);
    if (c) {
      c.creatorHeart = !c.creatorHeart;
      save();
      saveGlobalPost(p);
      V.activeCommentMenu = null;
      updateFeedOverlays(p);
      toast(c.creatorHeart ? (S.lang === 'ar' ? 'تم وضع قلب صاحب المنشور ❤️' : 'Hearted') : (S.lang === 'ar' ? 'تمت إزالة القلب' : 'Heart removed'));
    }
    return;
  }

  if (k === 'deleteCommentFromMenu') {
    if (!V.feed) return;
    const p = V.feed.posts[V.feed.index];
    p.comments = (p.comments || []).filter((x: any) => x.id !== a);
    save();
    saveGlobalPost(p);
    V.activeCommentMenu = null;
    updateFeedOverlays(p);
    toast(S.lang === 'ar' ? 'تم حذف التعليق' : 'Comment deleted');
    return;
  }

  if (k === 'editCommentFromMenu') {
    if (!V.feed) return;
    const p = V.feed.posts[V.feed.index];
    const c = (p.comments || []).find((x: any) => x.id === a);
    V.activeCommentMenu = null;
    if (c) {
      updateFeedOverlays(p, true);
      const isAr = S.lang === 'ar';
      const newText = await ask(isAr ? 'تعديل التعليق:' : 'Edit comment:', c.text);
      if (newText !== null && newText.trim() && newText.trim() !== c.text) {
        c.text = newText.trim();
        save();
        saveGlobalPost(p);
        updateFeedOverlays(p);
        toast(isAr ? 'تم تعديل التعليق بنجاح' : 'Comment updated');
      }
    }
    return;
  }

  if (k === 'reportCommentFromMenu') {
    V.activeCommentMenu = null;
    if (V.feed) updateFeedOverlays(V.feed.posts[V.feed.index], true);
    toast(S.lang === 'ar' ? 'تم استلام بلاغك وسيتم مراجعته، شكراً لك' : 'Report submitted and will be reviewed');
    return;
  }

  if (k === 'replyToCommentFromMenu') {
    if (!V.feed) return;
    const p = V.feed.posts[V.feed.index];
    const c = (p.comments || []).find((x: any) => x.id === a);
    V.activeCommentMenu = null;
    if (c) {
      V.replyingToCommentId = c.id;
      V.replyingTo = c.authorName || '';
      updateFeedOverlays(p);
      const inp = document.getElementById('new_comm_input') as HTMLInputElement;
      if (inp) {
        inp.focus();
        inp.value = `@${c.authorName || ''} `;
      }
    }
    return;
  }

  if (k === 'replyToComment') {
    V.replyingToCommentId = a;
    V.replyingTo = b || '';
    if (V.feed) updateFeedOverlays(V.feed.posts[V.feed.index]);
    const inp = document.getElementById('new_comm_input') as HTMLInputElement;
    if (inp) {
      inp.focus();
      inp.value = `@${b || ''} `;
    }
    return;
  }

  if (k === 'deleteComment') {
    if (!V.feed) return;
    const p = V.feed.posts[V.feed.index];
    p.comments = (p.comments || []).filter((x: any) => x.id !== a);
    save();
    updateFeedOverlays(p);
    toast(S.lang === 'ar' ? 'تم حذف التعليق' : 'Comment deleted');
    return;
  }

  if (k === 'sharePost') {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Hamudi message', text: 'شاهد هذا المنشور على حمودي رسالة', url: location.href });
      } else {
        await navigator.clipboard.writeText(location.href);
        toast(S.lang === 'ar' ? 'تم نسخ رابط المنشور' : 'Link copied');
      }
    } catch (e) {}
    return;
  }

  if (k === 'openFeedMenu') {
    V.feedInfoOpen = !V.feedInfoOpen;
    if (V.feed) updateFeedOverlays(V.feed.posts[V.feed.index]);
    return;
  }

  if (k === 'closeFeedMenu') {
    V.feedInfoOpen = false;
    if (V.feed) updateFeedOverlays(V.feed.posts[V.feed.index]);
    return;
  }

  if (k === 'toggleFullDesc') {
    V.showFullDesc = !V.showFullDesc;
    if (V.feed) updateFeedOverlays(V.feed.posts[V.feed.index]);
    return;
  }

  if (k === 'downloadFeedPost') {
    if (!V.feed) return;
    const p = V.feed.posts[V.feed.index];
    const aEl = document.createElement('a');
    aEl.href = p.x;
    aEl.download = `hamudi_${p.id}.${p.t === 'vd' ? 'mp4' : 'jpg'}`;
    aEl.click();
    toast(S.lang === 'ar' ? 'جاري التحميل والحفظ في الهاتف…' : 'Downloading…');
    return;
  }

  if (k === 'savePostToList') {
    if (!V.feed) return;
    const p = V.feed.posts[V.feed.index];
    let savedId = Object.keys(S.chats).find((id) => S.chats[id].s);
    if (!savedId) {
      savedId = 'saved_' + Date.now();
      S.chats[savedId] = { n: 'الرسائل المحفوظة', s: 1, m: [] };
    }
    S.chats[savedId].m.push({
      t: p.t === 'vd' ? 'vd' : 'i',
      x: p.x,
      n: p.title || 'منشور محفوظ',
      tm: tm()
    });
    save();
    toast(S.lang === 'ar' ? 'تم حفظ المنشور في الرسائل المحفوظة ⭐' : 'Saved to Bookmarks');
    return;
  }

  if (k === 'promptDeletePost') {
    V.showDeleteConfirm = true;
    if (V.feed) updateFeedOverlays(V.feed.posts[V.feed.index]);
    return;
  }

  if (k === 'closeDeleteConfirm') {
    V.showDeleteConfirm = false;
    if (V.feed) updateFeedOverlays(V.feed.posts[V.feed.index]);
    return;
  }

  if (k === 'executeDeletePost') {
    const pId = a || (V.feed ? V.feed.posts[V.feed.index]?.id : null);
    if (pId) {
      S.posts = (S.posts || []).filter((q: any) => q.id !== pId);
      deleteGlobalPost(pId);
      save();
    }
    V.showDeleteConfirm = false;
    V.feedInfoOpen = false;
    V.activeCommentMenu = null;
    V.feed = null;
    R();
    toast(S.lang === 'ar' ? 'تم حذف المنشور بنجاح' : 'Post deleted successfully');
    return;
  }

  if (k === 'toggleStoriesBar') {
    V.storiesRevealed = !V.storiesRevealed;
    R();
    return;
  }

  if (k === 'pauseRec') {
    if (V.rec && V.rec.mr && V.rec.mr.state === 'recording') {
      V.rec.mr.pause();
      V.rec.pause = 1;
      V.rec.pauseStart = Date.now();
      recUI();
      toast(S.lang === 'ar' ? 'تم إيقاف التسجيل مؤقتاً' : 'Recording paused');
    }
    return;
  }

  if (k === 'previewAudioChunks') {
    const r = V.rec;
    if (!r) return;
    if ((window as any)._recLiveAudio) {
      (window as any)._recLiveAudio.pause();
      (window as any)._recLiveAudio = null;
      toast(S.lang === 'ar' ? 'تم إيقاف الاستماع' : 'Preview stopped');
      return;
    }
    if (r.mr && r.mr.state === 'recording') {
      r.mr.pause();
      r.pause = 1;
      r.pauseStart = Date.now();
      recUI();
    }
    if (r.mr && r.mr.state !== 'inactive') {
      try { r.mr.requestData(); } catch (e) {}
    }
    setTimeout(() => {
      if (!r.ch || !r.ch.length) {
        toast(S.lang === 'ar' ? 'لا يوجد تسجيل صوتي بعد' : 'No recorded audio yet');
        return;
      }
      const blob = new Blob(r.ch, { type: r.mr.mimeType || (r.m === 'v' ? 'video/webm' : 'audio/webm') });
      const url = URL.createObjectURL(blob);
      const au = new Audio(url);
      (window as any)._recLiveAudio = au;
      au.play().catch(() => {});
      au.onended = () => { (window as any)._recLiveAudio = null; };
      toast(S.lang === 'ar' ? 'جاري الاستماع للتسجيل… يمكنك استئناف التسجيل أو الإرسال' : 'Playing preview… Resume or send anytime');
    }, 120);
    return;
  }

  if (k === 'resumeRec') {
    if ((window as any)._recLiveAudio) {
      (window as any)._recLiveAudio.pause();
      (window as any)._recLiveAudio = null;
    }
    if (V.rec && V.rec.mr && V.rec.mr.state === 'paused') {
      V.rec.mr.resume();
      V.rec.pause = 0;
      if (V.rec.pauseStart) {
        V.rec.pz = (V.rec.pz || 0) + (Date.now() - V.rec.pauseStart);
      }
      recUI();
      toast(S.lang === 'ar' ? 'تم استئناف التسجيل' : 'Recording resumed');
    }
    return;
  }

  if (k === 'openPhotoOptions') {
    const choice = await dlg(
      `<div style="text-align:right;direction:rtl;width:100%">
        <b style="font-size:16px">${S.lang === 'ar' ? 'تعديل الصورة والغلاف' : 'Edit Photo & Cover'}</b>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">
          <button class="st-row" onclick="window._d.res('avatar_file')">
            <span class="sq" style="background:#2f9cf4">${ic('cam', 20)}</span>
            <div class="rt"><b>${S.lang === 'ar' ? 'تغيير صورة الملف الشخصي (صورة)' : 'Change Profile Photo'}</b><span>${S.lang === 'ar' ? 'اختيار صورة وقصها وضبطها' : 'Upload & adjust photo'}</span></div>
          </button>
          <button class="st-row" onclick="window._d.res('avatar_emoji')">
            <span class="sq" style="background:#f5a623">🦁</span>
            <div class="rt"><b>${S.lang === 'ar' ? 'تعيين إيموجي للملف الشخصي' : 'Use Emoji Avatar'}</b><span>${S.lang === 'ar' ? 'اختيار رمز تعبيري بدلاً من الصورة' : 'Pick an emoji icon'}</span></div>
          </button>
          <button class="st-row" onclick="window._d.res('avatar_color')">
            <span class="sq" style="background:#a35be8">${ic('contrast', 20)}</span>
            <div class="rt"><b>${S.lang === 'ar' ? 'لون فقط بدون صورة' : 'Color Only'}</b><span>${S.lang === 'ar' ? 'عرض أول حرف مع لون الخلفية' : 'Initials with solid color'}</span></div>
          </button>
          <button class="st-row" onclick="window._d.res('cover_file')">
            <span class="sq" style="background:#34c759">${ic('img', 20)}</span>
            <div class="rt"><b>${S.lang === 'ar' ? 'تغيير الغلاف (صورة)' : 'Change Cover Banner'}</b><span>${S.lang === 'ar' ? 'اختيار صورة خلفية الملف الشخصي وقصها' : 'Upload cover image'}</span></div>
          </button>
          <button class="st-row" onclick="window._d.res('cover_color')">
            <span class="sq" style="background:#6a5be8">🎨</span>
            <div class="rt"><b>${S.lang === 'ar' ? 'تغيير لون الغلاف' : 'Change Cover Color'}</b><span>${S.lang === 'ar' ? 'اختيار لون أو تدرج لوني للغلاف' : 'Solid color or gradient'}</span></div>
          </button>
          ${
            S.user?.photo
              ? `<button class="st-row" onclick="window._d.res('remove_avatar')">
            <span class="sq" style="background:#ee1c2c">${ic('trash', 20)}</span>
            <div class="rt"><b style="color:#ff5a5a">${S.lang === 'ar' ? 'إزالة صورة الملف الشخصي' : 'Remove Profile Photo'}</b></div>
          </button>`
              : ''
          }
          ${
            S.user?.cover
              ? `<button class="st-row" onclick="window._d.res('remove_cover')">
            <span class="sq" style="background:#ee1c2c">${ic('trash', 20)}</span>
            <div class="rt"><b style="color:#ff5a5a">${S.lang === 'ar' ? 'إزالة الغلاف' : 'Remove Cover'}</b></div>
          </button>`
              : ''
          }
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:12px">
          <button onclick="window._d.res(null)">${t('cancel')}</button>
        </div>
      </div>`
    );
    if (!choice) return;

    if (choice === 'avatar_file') {
      const input = document.getElementById('pf3') as HTMLInputElement;
      if (input) input.click();
    } else if (choice === 'avatar_emoji') {
      const emojis = [
        '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩',
        '😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨',
        '😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕',
        '🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁',
        '😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞',
        '😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺',
        '👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🙈','🙉','🙊',
        '💥','💫','⭐','🌟','✨','⚡','🔥','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎',
        '💔','❣️','💕','💞','💓','💗','💖','💘','💝','👑','💎','🏆','🥇','🚀','🕊️','🦅',
        '🦁','🐺','🦊','🐱','🐶','🌹','🌸','🌺','🍀','🍁','🍕','🍔','☕','🎮','🎵','🎧',
        '🎨','⚽','🏀','💡','💻','📱','🕶️','🔮'
      ];
      const colors12 = [
        '#ffffff', '#1c1c1e', '#2f9cf4', '#ee1c2c',
        '#34c759', '#ff2d55', '#af52de', '#ff9500',
        '#ffcc00', '#30b0c7', '#0a2540', '#8e8e93'
      ];

      (window as any)._ea_curEmoji = '🦁';
      (window as any)._ea_curBg = '#2f9cf4';

      const dataUrl = await dlg(
        `<div style="text-align:right;direction:rtl;width:100%">
          <!-- Live Circular Preview -->
          <div id="ea_prev_wrap" style="width:84px;height:84px;border-radius:50%;background:#2f9cf4;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;box-shadow:0 4px 14px rgba(0,0,0,0.3);transition:background-color 0.2s">
            <span id="ea_prev_emoji" style="font-size:46px;line-height:1">🦁</span>
          </div>

          <div style="text-align:center;font-size:14px;font-weight:700;margin-bottom:10px">
            ${S.lang === 'ar' ? 'اختر الإيموجي ولون الخلفية' : 'Choose Emoji & Background Color'}
          </div>

          <!-- Emojis Grid (120+ unclipped, fully scrollable) -->
          <div style="font-size:12px;color:var(--sub);margin-bottom:4px;font-weight:700">
            ${S.lang === 'ar' ? 'الإيموجيات (مرر لأسفل لرؤية الكل):' : 'Emojis (Scroll to view all):'}
          </div>
          <div style="max-height:180px;overflow-y:auto;padding:6px;display:grid;grid-template-columns:repeat(6, 1fr);gap:6px;background:var(--sf);border-radius:14px;border:1px solid #8882">
            ${emojis.map((em) => `<button type="button" style="font-size:26px;height:42px;border:0;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:8px" onclick="window._ea_curEmoji='${em}';var el=document.getElementById('ea_prev_emoji');if(el)el.textContent='${em}';">${em}</button>`).join('')}
          </div>

          <!-- 12 Colors Grid -->
          <div style="font-size:12px;color:var(--sub);margin:12px 0 6px;font-weight:700">
            ${S.lang === 'ar' ? 'لون خلفية الإيموجي (12 لون):' : 'Emoji Background Color (12 Colors):'}
          </div>
          <div class="color-12-grid">
            ${colors12.map((col, idx) => `<button type="button" class="color-12-dot ${idx === 2 ? 'active' : ''}" style="background-color:${col};border:2px solid ${col === '#ffffff' ? '#ccc' : col}" onclick="window._ea_curBg='${col}';var el=document.getElementById('ea_prev_wrap');if(el)el.style.backgroundColor='${col}';var dots=document.querySelectorAll('.color-12-dot');dots.forEach(function(d){d.classList.remove('active');});this.classList.add('active');"></button>`).join('')}
          </div>

          <!-- Action Buttons -->
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
            <button style="padding:8px 16px;border-radius:12px;background:var(--sf)" onclick="window._d.res(null)">${t('cancel')}</button>
            <button class="btn" style="width:auto;padding:0 20px;height:42px;font-size:13px" onclick="(function(){var cv=document.createElement('canvas');cv.width=180;cv.height=180;var ctx=cv.getContext('2d');if(ctx){ctx.fillStyle=window._ea_curBg||'#2f9cf4';ctx.fillRect(0,0,180,180);ctx.font='90px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(window._ea_curEmoji||'🦁',90,98);window._d.res(cv.toDataURL('image/png'));}else{window._d.res(null);}})()">${S.lang === 'ar' ? 'حفظ كصورة شخصية' : 'Save Avatar'}</button>
          </div>
        </div>`
      );

      if (dataUrl) {
        S.user.photo = dataUrl;
        save();
        R();
        toast(S.lang === 'ar' ? 'تم تعيين الإيموجي للملف الشخصي بنجاح' : 'Emoji avatar saved');
      }
    } else if (choice === 'avatar_color') {
      S.user.photo = '';
      S.o.nc = (S.o.nc + 1) % NC.length;
      save();
      R();
      toast(S.lang === 'ar' ? 'تم تعيين لون الملف الشخصي' : 'Avatar color updated');
    } else if (choice === 'cover_file') {
      const input = document.getElementById('cov_input') as HTMLInputElement;
      if (input) input.click();
    } else if (choice === 'cover_color') {
      const colors = [
        'linear-gradient(135deg, #2f9cf4, #6a5be8)',
        'linear-gradient(135deg, #11998e, #38ef7d)',
        'linear-gradient(135deg, #ff416c, #ff4b2b)',
        'linear-gradient(135deg, #8a2387, #e94057, #f27121)',
        'linear-gradient(135deg, #1f1c2c, #928dab)',
        'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'
      ];
      const chosenColor = await dlg(
        `<div style="text-align:right;direction:rtl">
          <b style="font-size:16px">${S.lang === 'ar' ? 'اختر لون أو تدرج الغلاف' : 'Choose Cover Color'}</b>
          <div style="display:flex;flex-direction:column;gap:10px;margin:16px 0">
            ${colors.map((bg) => `<button style="height:44px;border-radius:12px;background:${bg};border:0;cursor:pointer" onclick="window._d.res('${bg}')"></button>`).join('')}
          </div>
          <div style="display:flex;justify-content:flex-end">
            <button onclick="window._d.res(null)">${t('cancel')}</button>
          </div>
        </div>`
      );
      if (chosenColor) {
        S.user.cover = chosenColor;
        save();
        R();
        toast(S.lang === 'ar' ? 'تم تحديث خلفية الغلاف' : 'Cover color updated');
      }
    } else if (choice === 'remove_avatar') {
      S.user.photo = '';
      save();
      R();
      toast(S.lang === 'ar' ? 'تمت إزالة صورة الملف الشخصي' : 'Avatar removed');
    } else if (choice === 'remove_cover') {
      delete S.user.cover;
      save();
      R();
      toast(S.lang === 'ar' ? 'تمت إزالة الغلاف' : 'Cover removed');
    }
    return;
  }


  if (k === 'viewAuthorProfile') {
    const reg = getUsersRegistry();
    const u = reg[a] || cachedServerUsers[a];
    if (u && u.id !== S.user?.id) {
      V.feed = null;
      V.c = null;
      V.viewingProfile = u;
      R();
    } else if (a === S.user?.id) {
      V.feed = null;
      V.c = null;
      V.t = 'me';
      R();
    }
    return;
  }

  if (k === 'openPartnerChannel') {
    const friendId = a;
    const c = V.c ? S.chats[V.c] : null;
    const reg = getUsersRegistry();
    const target =
      (friendId ? reg[friendId] || cachedServerUsers[friendId] : null) ||
      (c && c.p
        ? {
            id: c.p,
            n: c.n,
            bio: c.bio || '',
            un: (c.n || 'user').replace(/\s+/g, '_').toLowerCase(),
            photo: c.photo || '',
            cover: null,
            hideId: false,
            hideE: false
          }
        : null);

    if (target) {
      V.c = null;
      V.viewingProfile = target;
      R();
      return;
    }
    V.cp = 1;
    R();
    return;
  }


  if (k === 'saveContactDirect') {
    const targetId = a;
    const reg = getUsersRegistry();
    const target = reg[targetId] || cachedServerUsers[targetId];
    if (target) {
      let foundId = Object.keys(S.chats).find((id) => S.chats[id].p === target.id);
      if (!foundId) {
        foundId = 'c_' + target.id;
        S.chats[foundId] = {
          n: target.n,
          p: target.id,
          photo: target.photo,
          bio: target.bio,
          blocked: false,
          m: []
        };
        save();
      }
      toast(S.lang === 'ar' ? `تم حفظ ${target.n} في الصفحة الرئيسية` : `Saved ${target.n} to Home`);
      V.q = '';
      R();
    }
    return;
  }

  // Voice Note preview before sending actions
  if (k === 'togglePlayRecPreview') {
    togglePlayRecPreview();
    return;
  }

  if (k === 'discardRecPreview') {
    if (previewAudioEl) {
      previewAudioEl.pause();
      previewAudioEl = null;
    }
    V.recPreview = null;
    const box = document.getElementById('rec_preview_box');
    if (box) box.remove();
    R();
    return;
  }

  if (k === 'sendRecPreview') {
    if (previewAudioEl) {
      previewAudioEl.pause();
      previewAudioEl = null;
    }
    const p = V.recPreview;
    V.recPreview = null;
    const box = document.getElementById('rec_preview_box');
    if (box) box.remove();
    if (p) {
      push({ t: p.t, x: p.x });
    }
    return;
  }

  // Call other user
  if (k === 'callOtherUser') {
    V.viewingProfile = null;
    let foundId = Object.keys(S.chats).find((id) => S.chats[id].p === a);
    if (!foundId) {
      const reg = getUsersRegistry();
      const target = reg[a];
      foundId = 'c_' + a;
      S.chats[foundId] = {
        n: target?.n || 'صديق',
        p: a,
        photo: target?.photo,
        m: []
      };
      save();
    }
    V.c = foundId;
    V.call = {
      id: foundId,
      v: b,
      st: S.lang === 'ar' ? 'جاري الاتصال…' : 'Connecting…',
      mute: 0,
      sp: 1,
      f: 'user',
      active: false
    };
    R();
    return media();
  }

  if (k === 'startChatWith') {
    V.viewingProfile = null;
    const reg = getUsersRegistry();
    const target = reg[a] || cachedServerUsers[a];
    if (target) {
      let foundId = Object.keys(S.chats).find((id) => S.chats[id].p === target.id);
      if (!foundId) {
        foundId = 'c_' + target.id;
        S.chats[foundId] = {
          n: target.n,
          p: target.id,
          photo: target.photo,
          bio: target.bio,
          m: []
        };
        save();
      }
      V.c = foundId;
      V.q = '';
      V.cp = 0;
      R();
    } else {
      toast(S.lang === 'ar' ? 'لا يوجد شخص بهذا المعرّف' : 'No user with this ID');
    }
    return;
  }

  if (k === 'openContactOptions') {
    V.contactOptionsChatId = a;
    R();
    return;
  }

  if (k === 'closeContactOptions') {
    V.contactOptionsChatId = null;
    R();
    return;
  }

  if (k === 'reportContactAction') {
    V.contactOptionsChatId = null;
    toast(S.lang === 'ar' ? 'تم استلام الإبلاغ عن جهة الاتصال بنجاح' : 'Contact reported successfully');
    R();
    return;
  }

  if (k === 'deleteContactAction') {
    const cid = a || V.contactOptionsChatId;
    if (cid && S.chats[cid]) {
      const cName = S.chats[cid].n || '';
      delete S.chats[cid];
      save();
      toast(S.lang === 'ar' ? (cName ? `تم حذف ${cName}` : 'تم حذف جهة الاتصال') : 'Contact deleted');
    }
    V.contactOptionsChatId = null;
    if (V.c === cid) V.c = null;
    R();
    return;
  }

  if (k === 'toggleBlockContactAction') {
    const cid = a || V.contactOptionsChatId;
    if (cid && S.chats[cid]) {
      const c = S.chats[cid];
      c.blocked = !c.blocked;
      save();
      toast(
        c.blocked
          ? (S.lang === 'ar' ? 'تم حظر جهات الاتصال' : 'Contact blocked')
          : (S.lang === 'ar' ? 'تمت إزالة الحظر بنجاح' : 'Contact unblocked')
      );
    }
    V.contactOptionsChatId = null;
    R();
    return;
  }

  if (k === 'unblockCurrentContact') {
    if (V.c && S.chats[V.c]) {
      S.chats[V.c].blocked = false;
      save();
      toast(S.lang === 'ar' ? 'تمت إزالة الحظر بنجاح' : 'Contact unblocked');
      R();
    }
    return;
  }

  if (k === 't') {
    const slEl = $('.sl');
    const ix = ['chats', 'contacts', 'settings', 'me'].indexOf(a);
    if (slEl && ix >= 0 && !V.c) {
      slEl.style.transform = 'translateX(' + ix * 100 + '%)';
      await new Promise((r) => setTimeout(r, 170));
    }
    V.t = a;
    V.sub = null;
    V.c = null;
    V.viewingProfile = null;
    V.menu = 0;
    V.fade = 1;
    V.rt = 1;
    V.q = '';
  } else if (k === 'sub') {
    V.sub = a;
    V.rt = 1;
  } else if (k === 'calls') {
    V.t = 'calls';
  } else if (k === 'inv') {
    const d = { title: 'حمودي رسالة - Hamudi message', text: 'انضم إلي على حمودي رسالة!', url: location.href };
    try {
      if (navigator.share) await navigator.share(d);
      else await navigator.clipboard.writeText(d.url);
      toast(S.lang === 'ar' ? 'تم نسخ رابط الدعوة' : 'Invite link copied');
    } catch (e) {}
    return;
  } else if (k === 'bio') {
    const n = await ask('Bio', S.user?.bio || '');
    if (n !== null) {
      S.user.bio = n;
      save();
    }
  } else if (k === 'un') {
    const u = await ask('Username', S.user?.un || '');
    if (u !== null) {
      if (/^[A-Za-z0-9_]{5,32}$/.test(u)) {
        S.user.un = u;
        save();
      } else toast('A-Z 0-9 _ (5-32)');
    }
  } else if (k === 'nt') {
    if (S.nt) {
      S.nt = 0;
      save();
    } else {
      if (typeof Notification === 'undefined') return toast(tr('ntu'));
      try {
        const p = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
        if (p === 'granted') {
          S.nt = 1;
          save();
          try {
            new Notification('حمودي رسالة', { body: tr('ntok') });
          } catch (e2) {
            toast(tr('ntok'));
          }
        } else toast(tr('ntd') + ' (' + p + ')');
      } catch (e: any) {
        toast(tr('ntu') + ' (' + (e.name || '') + ')');
      }
    }
  } else if (k === 'ntt') {
    if (typeof Notification === 'undefined') {
      toast(tr('ntu'));
    } else if (Notification.permission === 'granted') {
      try {
        new Notification('حمودي رسالة', {
          body: S.lang === 'ar' ? 'هذا إشعار تجريبي من حمودي رسالة 🔔' : 'Test notification from Hamudi message 🔔',
          icon: '/favicon.ico'
        });
        toast(S.lang === 'ar' ? 'تم إرسال إشعار تجريبي إلى جهازك 🔔' : 'Test notification sent');
      } catch (err) {
        toast(S.lang === 'ar' ? 'تم إرسال إشعار تجريبي 🔔' : 'Test notification sent');
      }
    } else {
      try {
        const p = await Notification.requestPermission();
        if (p === 'granted') {
          S.nt = 1;
          save();
          try {
            new Notification('حمودي رسالة', {
              body: S.lang === 'ar' ? 'تم تفعيل الإشعارات بنجاح! 🔔' : 'Notifications enabled! 🔔'
            });
          } catch (e3) {}
          toast(S.lang === 'ar' ? 'تم تفعيل الإشعارات وإرسال إشعار تجريبي 🔔' : 'Notifications enabled');
        } else {
          toast(S.lang === 'ar' ? 'يرجى السماح بالإشعارات من المتصفح أولاً' : 'Please allow notifications in browser');
        }
      } catch (err) {
        toast(tr('ntu'));
      }
    }
  } else if (k === 'wipe') {
    if (await sure(S.lang === 'ar' ? 'مسح بيانات التطبيق' : 'Clear app data', '')) {
      try {
        localStorage.removeItem('hm2');
        localStorage.removeItem('hm_users_registry');
        localStorage.removeItem('hm_posts_feed');
      } catch (e) {}
      location.reload();
      return;
    }
  } else if (k === 'demo') {
    V.stash = { u: S.user, c: S.chats };
    S.user = { n: t('guest'), id: '00000000', demo: 1 };
    S.chats = { saved: { n: t('sv'), m: [], s: 1 } };
    S.in = 1;
    V.t = 'chats';
    V.c = null;
    V.demo = Date.now() + 6e5;
    V.iv = setInterval(() => {
      const l = V.demo - Date.now();
      if (l <= 0) return endDemo(1);
      const d = $('#dm');
      if (d) {
        d.textContent =
          t('demo') + ' · ' + Math.floor(l / 6e4) + ':' + String(Math.floor(l / 1e3) % 60).padStart(2, '0');
      }
    }, 1000);
  } else if (k === 'cam') {
    V.cam = { m: 'photo', f: 'user', s: null };
    return cam2();
  } else if (k === 'camx') {
    const camObj = V.cam;
    if (camObj?.s) camObj.s.getTracks().forEach((x: any) => x.stop());
    if (camObj?.mr && camObj.mr.state === 'recording') {
      camObj.mr.onstop = null;
      camObj.mr.stop();
    }
    V.cam = null;
  } else if (k === 'cm') {
    V.cam.m = a;
    V.cam.set = 0;
    return cam2();
  } else if (k === 'shot') {
    const camObj = V.cam;
    const v = $('#cv') as HTMLVideoElement;
    if (!camObj?.s) return;
    if (camObj.m === 'photo') {
      const cv = document.createElement('canvas');
      cv.width = v.videoWidth || 640;
      cv.height = v.videoHeight || 480;
      const ctx = cv.getContext('2d');
      if (ctx) ctx.drawImage(v, 0, 0);
      S.chats.saved.m.push({ t: 'i', x: cv.toDataURL('image/jpeg', 0.8), tm: tm() });
      save();
      toast(t('sv'));
    } else if (!camObj.rec) {
      const ch: Blob[] = [];
      const mr = new MediaRecorder(camObj.s);
      camObj.mr = mr;
      mr.ondataavailable = (e) => ch.push(e.data);
      mr.onstop = () => {
        const fr = new FileReader();
        fr.onload = () => {
          S.chats.saved.m.push({ t: 'vd', x: fr.result, tm: tm() });
          save();
          toast(t('sv'));
        };
        fr.readAsDataURL(new Blob(ch, { type: mr.mimeType }));
      };
      mr.start();
      camObj.rec = 1;
      R();
    } else {
      camObj.mr.stop();
      camObj.rec = 0;
      R();
    }
    return;
  } else if (k === 'stk') {
    return push({ t: 's', x: a });
  } else if (k === 'bs') {
    const i = $('#mi');
    i.value = [...i.value].slice(0, -1).join('');
    $('#mic').hidden = !!i.value;
    $('#snd').hidden = !i.value;
    return;
  } else if (k === 'srch') {
    V.menu = 0;
    const q = await ask(t('search'), V.fq);
    if (q !== null) V.fq = q;
  } else if (k === 'mtap') {
    V.sel = a;
    V.rxm = 0;
  } else if (k === 'msel') {
    V.ms = { [a]: 1 };
    V.sel = null;
    V.lt = Date.now();
  } else if (k === 'mtog') {
    if (V.ms[a]) delete V.ms[a];
    else V.ms[a] = 1;
    if (!Object.keys(V.ms).length) V.ms = null;
  } else if (k === 'mx') {
    V.ms = null;
  } else if (k === 'mcp') {
    const ids = Object.keys(V.ms || {})
      .map(Number)
      .sort((x, y) => x - y);
    try {
      await navigator.clipboard.writeText(ids.map((i) => c.m[i].x || '').join('\n'));
    } catch (e) {}
    V.ms = null;
    toast(t('cp'));
  } else if (k === 'mfw') {
    V.fid = V.ms
      ? Object.keys(V.ms)
          .map(Number)
          .sort((x, y) => x - y)
      : [V.sel];
    V.fw = 1;
  } else if (k === 'mrep') {
    const i = Object.keys(V.ms || {});
    if (i.length === 1) V.rep = +i[0];
    V.ms = null;
  } else if (k === 'ph2') {
    if (a) {
      sq(a, (d) => {
        S.user.photo = d;
        save();
        R();
      });
    }
    return;
  } else if (k === 'he') {
    S.user.hideE = !S.user.hideE;
    save();
    R();
  } else if (k === 'ps') {
    S.ps = S.ps ? 0 : 1;
    save();
    toast(
      S.lang === 'ar'
        ? S.ps
          ? 'تم تفعيل توفير الطاقة'
          : 'تم إيقاف توفير الطاقة'
        : S.ps
        ? 'Power saving on'
        : 'Power saving off'
    );
  } else if (k === 'cprof') {
    V.cp = 1;
  } else if (k === 'mute') {
    c.mute = !c.mute;
    save();
  } else if (k === 'accs') {
    V.menu = 3;
  } else if (k === 'swa') {
    if (a === 0) return;
    const z = S.accs.splice(a - 1, 1)[0];
    S.accs.push(snap());
    load(z);
    save();
    if (S.user?.id) {
      syncUserToServer(S.user);
      pollRealtimeMessages();
    }
  } else if (k === 'addacc') {
    if (1 + (S.accs || []).length >= 3) {
      return toast(S.lang === 'ar' ? 'الحد الأقصى 3 حسابات' : 'Maximum 3 accounts');
    }
    (S.accs = S.accs || []).push(snap());
    S.acc = null;
    S.user = null;
    S.chats = { saved: { n: t('sv'), m: [], s: 1 } };
    S.posts = [];
    S.stk = [];
    S.fl = [];
    S.in = 0;
    V.add = 1;
    V.a = 'up';
    V.menu = 0;
    V.sub = null;
  } else if (k === 'canc') {
    load(S.accs.pop());
    S.in = 1;
    V.add = 0;
    V.a = 'up';
  } else if (k === 'askq') {
    const q = $('#aq').value.trim();
    if (!q) return;
    S.chats.saved.m.push({ t: 't', x: '? ' + q, tm: tm() });
    save();
    toast(t('sv'));
  } else if (k === 'mkst') {
    if (!a) return;
    const d = await fit(a, 256);
    if (d) {
      (S.stk = S.stk || []).push(d);
      save();
    }
  } else if (k === 'stk2') {
    return push({ t: 'sk', x: S.stk[a] });
  } else if (k === 'apick') {
    for (const fl of [...a]) {
      const d = await fit(fl, 1280);
      if (d) V.at.imgs.push({ x: d, on: 1 });
    }
  } else if (k === 'asel') {
    V.at.imgs[a].on = !V.at.imgs[a].on;
  } else if (k === 'asend') {
    const im = V.at.imgs.filter((m: any) => m.on);
    V.at = null;
    im.forEach((m: any) => c.m.push({ t: 'i', x: m.x, tm: tm() }));
    save();
  } else if (k === 'afile' || k === 'aaud') {
    for (const fl of [...a]) {
      const d = await new Promise((z) => {
        const fr = new FileReader();
        fr.onload = () => z(fr.result);
        fr.onerror = () => z(null);
        fr.readAsDataURL(fl);
      });
      if (d) {
        c.m.push({ t: k === 'afile' ? 'f' : 'au', x: d, n: fl.name, z: fl.size, tm: tm() });
      }
    }
    V.at = null;
    save();
  } else if (k === 'actc') {
    const o = S.chats[a];
    c.m.push({ t: 'ct', x: o.n, p: o.p || '', tm: tm() });
    V.at = null;
    save();
  } else if (k === 'apoll') {
    const q = $('#pq').value.trim();
    const op = [1, 2, 3, 4].map((i) => $('#po' + i).value.trim()).filter(Boolean);
    if (!q || op.length < 2) return toast(tr('pe'));
    c.m.push({ t: 'po', q, o: op.map((z) => ({ t: z, v: 0 })), vt: -1, tm: tm() });
    V.at = null;
    save();
  } else if (k === 'vote') {
    const m = c.m[a];
    if (m.vt === b) return;
    if (m.vt >= 0) m.o[m.vt].v--;
    m.o[b].v++;
    m.vt = b;
    save();
  } else if (k === 'diag') {
    const o: Record<string, string> = {};
    const T = async (n: string, fn: () => Promise<any>) => {
      try {
        await fn();
        o[n] = 'OK';
      } catch (e: any) {
        o[n] = (e.name || '') + ' ' + (e.message || '');
      }
    };
    o.secure = String(window.isSecureContext);
    await T('mic', async () => {
      const z = await navigator.mediaDevices.getUserMedia({ audio: true });
      z.getTracks().forEach((y) => y.stop());
    });
    await T('camera', async () => {
      const z = await navigator.mediaDevices.getUserMedia({ video: true });
      z.getTracks().forEach((y) => y.stop());
    });
    V.dg = o;
  } else if (k === 'tg') {
    S.o[a] = S.o[a] ? 0 : 1;
    save();
  } else if (k === 'downloadSourceZip') {
    const isAr = S.lang === 'ar';
    toast(isAr ? 'جاري تجهيز ملف الكود ZIP…' : 'Preparing ZIP…');
    try {
      const res = await fetch('/hamudi-message-source.zip');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const aEl = document.createElement('a');
      aEl.href = url;
      aEl.download = 'hamudi-message-source.zip';
      document.body.appendChild(aEl);
      aEl.click();
      aEl.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      toast(isAr ? 'تم بدء تحميل hamudi-message-source.zip' : 'Download started');
    } catch (e) {
      toast(isAr ? 'تعذر التحميل من المعاينة، استخدم زر التنزيل في شريط المنصة بالأعلى' : 'Use platform Download button at top');
    }
    return;
  } else if (k === 'opt') {
    S.o[a] = b;
    save();
  } else if (k === 'sw') {
    const ch = S.chats[a];
    if (!ch) return;
    const w = S.o.swipe;
    if (w === 'pin') {
      ch.pin = ch.pin ? 0 : 1;
      save();
    } else if (w === 'del') {
      if (ch.s) return toast(t('soon'));
      if (await sure(t('dc'), '')) {
        delete S.chats[a];
        save();
      }
    }
  } else if (k === 'bgc') {
    S.o.bg = a < 0 ? null : { t: 'c', v: BGS[a] };
    save();
  } else if (k === 'bgf') {
    if (!a) return;
    const d = await fit(a, 1280);
    if (d) {
      S.o.bg = { t: 'i', v: d };
      save();
    }
  } else if (k === 'bd') {
    const currentBd = S.user?.bd || '2000-01-01';
    const parts = currentBd.split('-');
    const curY = parts[0] || '2000';
    const curM = parts[1] || '01';
    const curD = parts[2] || '01';
    const curPriv = S.user?.bdPrivacy || 'all';

    const years: string[] = [];
    for (let y = 2026; y >= 1950; y--) years.push(String(y));
    const months: string[] = [];
    for (let m = 1; m <= 12; m++) months.push(String(m).padStart(2, '0'));
    const days: string[] = [];
    for (let d = 1; d <= 31; d++) days.push(String(d).padStart(2, '0'));

    const res = await dlg(
      `<div style="text-align:right;direction:rtl;width:100%">
        <b style="font-size:16px">🎂 ${S.lang === 'ar' ? 'تحديد تاريخ الميلاد' : 'Date of Birth'}</b>
        <p style="font-size:12px;color:var(--sub);margin:4px 0 14px">${S.lang === 'ar' ? 'اضبط سنة وشهر ويوم ميلادك' : 'Set your year, month, and day'}</p>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
          <div>
            <label style="font-size:11px;color:var(--sub)">${S.lang === 'ar' ? 'السنة' : 'Year'}</label>
            <select id="bd_year" class="fi" style="height:40px">
              ${years.map((y) => `<option value="${y}" ${y === curY ? 'selected' : ''}>${y}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:11px;color:var(--sub)">${S.lang === 'ar' ? 'الشهر' : 'Month'}</label>
            <select id="bd_month" class="fi" style="height:40px">
              ${months.map((m) => `<option value="${m}" ${m === curM ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:11px;color:var(--sub)">${S.lang === 'ar' ? 'اليوم' : 'Day'}</label>
            <select id="bd_day" class="fi" style="height:40px">
              ${days.map((d) => `<option value="${d}" ${d === curD ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="cardf" style="padding:10px;margin-bottom:14px">
          <b style="font-size:12px;color:var(--sub)">${S.lang === 'ar' ? 'من يستطيع رؤية تاريخ ميلادك؟' : 'Who can see your birthday?'}</b>
          <div style="display:flex;gap:16px;margin-top:8px">
            <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
              <input type="radio" name="bd_priv" value="all" ${curPriv === 'all' ? 'checked' : ''}>
              <span>${S.lang === 'ar' ? 'ظاهر للجميع' : 'Visible to all'}</span>
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
              <input type="radio" name="bd_priv" value="me" ${curPriv === 'me' ? 'checked' : ''}>
              <span>${S.lang === 'ar' ? 'فقط لي' : 'Only me'}</span>
            </label>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px">
          <button onclick="window._d.res(null)">${t('cancel')}</button>
          <button style="color:var(--ac);font-weight:700" onclick="(function(){var y=document.getElementById('bd_year').value;var m=document.getElementById('bd_month').value;var d=document.getElementById('bd_day').value;var privEl=document.querySelector('input[name=bd_priv]:checked');var p=privEl?privEl.value:'all';window._d.res({date:y+'-'+m+'-'+d,priv:p});})()">${S.lang === 'ar' ? 'حفظ' : 'Save'}</button>
        </div>
      </div>`
    );

    if (res) {
      S.user.bd = res.date;
      S.user.bdPrivacy = res.priv;
      save();
      R();
      toast(S.lang === 'ar' ? 'تم حفظ تاريخ الميلاد' : 'Birthday saved');
    }
  } else if (k === 'pcol') {
    S.o.nc = (S.o.nc + 1) % NC.length;
    V.menu = 0;
    save();
  } else if (k === 'cl2') {
    V.menu = 0;
    try {
      await navigator.clipboard.writeText(location.href);
      toast(tr('lc'));
    } catch (e: any) {
      toast(t('perm') + ' (' + e.name + ')');
    }
  } else if (k === 'mm') {
    V.menu = V.t === 'me' ? 2 : 1;
  } else if (k === 'theme') {
    S.theme = S.theme === 'dark' ? 'light' : 'dark';
    S.o.auto = 0;
    V.menu = 0;
    save();
  } else if (k === 'grp') {
    V.t = 'grp';
    V.grp = {};
    V.menu = 0;
  } else if (k === 'sv') {
    V.c = 'saved';
    V.menu = 0;
  } else if (k === 'out') {
    if (V.demo) return endDemo();
    const isAr = S.lang === 'ar';
    const actionChoice = await dlg(
      `<div style="text-align:center;padding:4px 0">
        <b style="font-size:17px">${isAr ? 'تسجيل الخروج أم حذف الحساب؟' : 'Sign Out or Delete Account?'}</b>
        <p class="note" style="margin:8px 0 14px">${
          isAr
            ? 'اختر تسجيل الخروج للاحتفاظ بحسابك، أو حذف الحساب نهائياً لإزالته بالكامل.'
            : 'Choose to sign out and keep your account, or permanently delete your account.'
        }</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn" onclick="window._d.res('logout')">${isAr ? 'تسجيل الخروج' : 'Sign Out'}</button>
          <button class="btn" style="background:#ee1c2c;color:#fff" onclick="window._d.res('delete')">${
            isAr ? 'حذف الحساب نهائياً' : 'Delete Account Permanently'
          }</button>
          <button class="btn g" onclick="window._d.res(null)">${t('cancel')}</button>
        </div>
      </div>`
    );
    if (!actionChoice) return;

    if (actionChoice === 'delete') {
      const confirmDelete = await dlg(
        `<div style="text-align:center;padding:4px 0">
          <b style="font-size:16px;color:#ff5a5a">${isAr ? 'تأكيد حذف الحساب نهائياً' : 'Confirm Permanent Deletion'}</b>
          <p class="note" style="margin:8px 0 14px">${
            isAr
              ? 'هل أنت متأكد؟ سيتم حذف حسابك ومنشوراتك بشكل نهائي ولا يمكن التراجع.'
              : 'Are you sure? Your account and posts will be permanently deleted.'
          }</p>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button class="btn g" style="flex:1" onclick="window._d.res(0)">${t('cancel')}</button>
            <button class="btn" style="flex:1;background:#ee1c2c;color:#fff" onclick="window._d.res(1)">${
              isAr ? 'نعم، احذف نهائياً' : 'Delete Permanently'
            }</button>
          </div>
        </div>`
      );
      if (!confirmDelete) return;

      const deletedUid = String(S.user?.id || '').trim();
      if (deletedUid) {
        try {
          await fetch('/api/users/' + encodeURIComponent(deletedUid), { method: 'DELETE' });
        } catch (e) {}
        delete cachedServerUsers[deletedUid];
        try {
          const rawReg = localStorage.getItem('hm_users_registry');
          if (rawReg) {
            const reg = JSON.parse(rawReg);
            delete reg[deletedUid];
            localStorage.setItem('hm_users_registry', JSON.stringify(reg));
          }
        } catch (e) {}
        cachedServerPosts = cachedServerPosts.filter((p: any) => String(p.userId || '').trim() !== deletedUid);
        try {
          localStorage.setItem('hm_posts_feed', JSON.stringify(cachedServerPosts));
        } catch (e) {}
      }

      await googleSignOut();
      if (S.accs && S.accs.length) {
        load(S.accs.pop());
        save();
      } else {
        S.in = 0;
        S.user = null;
        S.acc = null;
        S.chats = {};
        S.posts = [];
        S.stk = [];
        S.fl = [];
        V.ok = 0;
        V.a = 'up';
        V.c = null;
        V.t = 'chats';
        V.sub = null;
        V.feed = null;
        V.driveFileId = null;
        V.existingDriveFileId = null;
        V.pidDigits = ['', '', '', '', '', '', '', ''];
        try {
          localStorage.removeItem('hm2');
        } catch (e) {}
      }
      R();
      toast(isAr ? 'تم حذف الحساب نهائياً' : 'Account permanently deleted');
      return;
    }

    const driveToken = getCachedDriveToken();
    if (driveToken && S.user?.id) {
      const saveBeforeOut = await dlg(
        `<div style="text-align:center;padding:4px 0">
          <b>${isAr ? 'حفظ نسخة في Google Drive' : 'Save Google Drive Backup'}</b>
          <p class="note" style="margin:8px 0 12px">${
            isAr
              ? 'هل تريد حفظ أحدث محادثاتك وبياناتك في Google Drive قبل تسجيل الخروج؟'
              : 'Save your latest chats and data to Google Drive before signing out?'
          }</p>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button class="btn g" style="width:auto;padding:0 16px" onclick="window._d.res(0)">${
              isAr ? 'تخطي' : 'Skip'
            }</button>
            <button class="btn" style="width:auto;padding:0 16px" onclick="window._d.res(1)">${
              isAr ? 'حفظ وخروج' : 'Save & Sign out'
            }</button>
          </div>
        </div>`
      );
      if (saveBeforeOut) {
        try {
          const payload = {
            user: S.user,
            chats: S.chats,
            posts: S.posts || [],
            stk: S.stk || [],
            fl: S.fl || [],
            updatedAt: Date.now()
          };
          const existingId = V.driveFileId || V.existingDriveFileId || (await findDriveBackup(driveToken))?.id;
          if (existingId) {
            await overwriteDriveBackup(driveToken, existingId, payload);
          } else {
            await uploadNewDriveBackup(driveToken, payload);
          }
          toast(isAr ? 'تم حفظ النسخة في Google Drive' : 'Saved backup to Google Drive');
        } catch (e) {}
      }
    }

    if (S.accs && S.accs.length) {
      load(S.accs.pop());
      save();
    } else {
      await googleSignOut();
      S.in = 0;
      V.ok = 0;
      V.a = 'up';
      V.driveFileId = null;
      V.existingDriveFileId = null;
      save();
    }
  } else if (k === 'open') {
    if (Date.now() - (V.lt || 0) < 500) return;
    V.c = a;
    V.cp = 0;
    V.ms = null;
    pollRealtimeMessages();
  } else if (k === 'back') {
    V.c = null;
    V.fq = '';
    V.rep = null;
    V.ms = null;
    V.cp = 0;
    V.at = null;
  } else if (k === 'addc') {
    const f = await contactForm();
    if (!f) return;
    const n = (f.a + ' ' + (f.b || '')).trim();
    const p = f.p.trim();
    if (!f.a.trim()) return toast(t('nme'));
    if (!/^\d{8}$/.test(p) || p === S.user?.id || Object.values(S.chats).some((z: any) => z.p === p)) {
      return toast(t('ib'));
    }
    const reg = getUsersRegistry();
    const existing = reg[p];
    S.chats['c' + Date.now()] = {
      n: existing?.n || n,
      p,
      photo: existing?.photo,
      bio: existing?.bio,
      m: []
    };
    save();
    toast(existing?.n || n);
  } else if (k === 'edit') {
    const n = await ask(t('nm'), S.user?.n);
    if (n) {
      S.user.n = n;
      save();
    }
  } else if (k === 'mkg') {
    const n = $('#gn').value.trim();
    const m = Object.keys(V.grp).filter((i) => V.grp[i]);
    if (!n || !m.length) return toast(t('gs'));
    S.chats['g' + Date.now()] = { n, g: 1, m: [] };
    save();
    V.t = 'chats';
  } else if (k === 'send') {
    const x = $('#mi').value.trim();
    if (!x) return;
    const m: any = { t: 't', x };
    if (V.rep != null) {
      m.rep = prev(c.m[V.rep]);
      V.rep = null;
    }
    V.emo = 0;
    $('#mi').value = '';
    $('#mic').hidden = 0;
    $('#snd').hidden = 1;
    return push(m);
  } else if (k === 'ae') {
    $('#mi').value += a;
    $('#mic').hidden = 1;
    $('#snd').hidden = 0;
    return;
  } else if (k === 'loc') {
    V.at = null;
    R();
    navigator.geolocation.getCurrentPosition(
      (pos) => push({ t: 'l', x: pos.coords.latitude.toFixed(5) + ',' + pos.coords.longitude.toFixed(5) }),
      (er) => toast(t('perm') + ' (' + (er.message || er.code) + ')')
    );
  } else if (k === 'rx') {
    const m = c.m[V.sel];
    m.rx = m.rx === a ? '' : a;
    if (m.rx) {
      S.o.ru = S.o.ru || {};
      S.o.ru[a] = (S.o.ru[a] || 0) + 1;
      burst(a);
    }
    V.sel = null;
    V.rxm = 0;
    save();
  } else if (k === 'rep') {
    V.rep = V.sel;
    V.sel = null;
  } else if (k === 'cp') {
    if (navigator.clipboard) navigator.clipboard.writeText(c.m[V.sel].x || '');
    V.sel = null;
    toast(t('cp'));
  } else if (k === 'fwd') {
    (V.fid || []).forEach((i: number) => S.chats[a].m.push({ ...c.m[i], tm: tm(), rx: '', pin: 0 }));
    save();
    V.sel = null;
    V.fw = 0;
    V.ms = null;
  } else if (k === 'pin') {
    c.m.forEach((m: any) => (m.pin = 0));
    c.m[V.sel].pin = 1;
    V.sel = null;
    save();
  } else if (k === 'dm') {
    const ids = V.ms ? Object.keys(V.ms).map(Number) : [V.sel];
    const isSaved = !!c.s;
    if (isSaved) {
      const ok = await sure(
        S.lang === 'ar' ? 'حذف من الرسائل المحفوظة' : 'Delete from Saved',
        S.lang === 'ar' ? 'هل تريد حذف هذه الرسالة من المحفوظات؟' : 'Delete this message?'
      );
      if (ok) {
        c.m = c.m.filter((_: any, i: number) => !ids.includes(i));
        save();
        toast(S.lang === 'ar' ? 'تم حذف الرسالة' : 'Message deleted');
      }
    } else {
      const choice = await dlg(
        `<div style="text-align:right;direction:rtl;width:100%">
          <b style="font-size:16px">${S.lang === 'ar' ? 'حذف الرسالة' : 'Delete message'}</b>
          <p style="font-size:13px;margin:8px 0 16px;color:var(--sub)">${
            S.lang === 'ar'
              ? 'هل ترغب في حذف الرسالة لك فقط أم للجميع؟'
              : 'Do you want to delete for yourself or everyone?'
          }</p>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="st-row" onclick="window._d.res('all')">
              <span class="sq" style="background:#ee1c2c">${ic('trash', 20)}</span>
              <div class="rt"><b style="color:#ff5a5a">${S.lang === 'ar' ? 'حذف للجميع' : 'Delete for everyone'}</b></div>
            </button>
            <button class="st-row" onclick="window._d.res('me')">
              <span class="sq" style="background:#8885">${ic('trash', 20)}</span>
              <div class="rt"><b>${S.lang === 'ar' ? 'حذف لدي فقط' : 'Delete for me only'}</b></div>
            </button>
          </div>
          <div style="display:flex;justify-content:flex-end;margin-top:10px">
            <button onclick="window._d.res(null)">${t('cancel')}</button>
          </div>
        </div>`
      );
      if (choice) {
        c.m = c.m.filter((_: any, i: number) => !ids.includes(i));
        save();
        toast(
          choice === 'all'
            ? S.lang === 'ar'
              ? 'تم الحذف للجميع'
              : 'Deleted for everyone'
            : S.lang === 'ar'
            ? 'تم الحذف لديك فقط'
            : 'Deleted for you'
        );
      }
    }
    V.ms = null;
    V.sel = null;
  } else if (k === 'clr') {
    V.menu = 0;
    if (await sure(t('cl'), '')) {
      c.m = [];
      save();
    }
  } else if (k === 'del') {
    V.menu = 0;
    if (await sure(t('dc'), '')) {
      if (c.s) c.m = [];
      else delete S.chats[V.c];
      V.c = null;
      save();
    }
  } else if (k === 'call') {
    V.menu = 0;
    V.call = {
      id: V.c,
      v: a,
      st: S.lang === 'ar' ? 'جاري الاتصال…' : 'Connecting…',
      mute: 0,
      sp: 1,
      f: 'user',
      active: false
    };
    R();
    return media();
  } else if (k === 'toggleCallMute') {
    if (V.call) {
      V.call.mute = !V.call.mute;
      if (V.call.s) {
        V.call.s.getAudioTracks().forEach((x: any) => (x.enabled = !V.call.mute));
      }
      R();
    }
    return;
  } else if (k === 'toggleCallVideo') {
    if (V.call) {
      V.call.v = V.call.v ? 0 : 1;
      return media();
    }
    return;
  } else if (k === 'end') {
    const cc = V.call;
    stopRingtone();
    playHangupSound();
    if (cc?.connectTimer) clearTimeout(cc.connectTimer);
    if (cc?.durationInterval) clearInterval(cc.durationInterval);
    if (cc?.s) cc.s.getTracks().forEach((x: any) => x.stop());

    const dur = cc?.sec
      ? ` (${String(Math.floor(cc.sec / 60)).padStart(2, '0')}:${String(cc.sec % 60).padStart(2, '0')})`
      : '';
    const msgText = cc?.v
      ? S.lang === 'ar'
        ? `مكالمة مرئية${dur}`
        : `Video Call${dur}`
      : S.lang === 'ar'
      ? `مكالمة صوتية${dur}`
      : `Voice Call${dur}`;

    V.call = null;
    return push({ t: 'c', x: msgText });
  }

  R();
}

// Window attachments
(window as any).toast = toast;
(window as any).t = t;
(window as any).tr = tr;
(window as any).A = A;
(window as any).R = R;
(window as any).V = V;
(window as any).S = S;
(window as any).cdIn = cdIn;
(window as any).cdKey = cdKey;
(window as any).cdPaste = cdPaste;
(window as any).mdn = mdn;
(window as any).cam2 = cam2;
(window as any).media = media;
(window as any).finishRec = finishRec;
(window as any).stopAndPreviewRec = stopAndPreviewRec;
(window as any).togglePlayRecPreview = togglePlayRecPreview;
(window as any).toggleVoiceAudio = toggleVoiceAudio;
(window as any).ssl = ssl;
(window as any).uf = uf;
(window as any).cl = cl;
(window as any).nl = nl;
(window as any).startContactLongPress = startContactLongPress;
(window as any).endContactLongPress = endContactLongPress;
(window as any).cancelContactLongPress = cancelContactLongPress;

// Initialize background syncing for cross-device real-time messaging, posts, and Google Auth
let backgroundSyncStarted = false;
function initBackgroundSync() {
  if (backgroundSyncStarted) return;
  backgroundSyncStarted = true;
  initGoogleAuth();
  fetchServerUsers();
  fetchServerPosts();
  if (S.in && S.user?.id) {
    syncUserToServer(S.user);
    pollRealtimeMessages();
  }
}

// Re-render smoothly when crossing mobile <-> PC desktop breakpoint
if (typeof window !== 'undefined') {
  let wasDesktop = window.innerWidth >= 820;
  let resizeTimer: any = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const nowDesktop = window.innerWidth >= 820;
      if (nowDesktop !== wasDesktop) {
        wasDesktop = nowDesktop;
        R();
      }
    }, 120);
  });
}

// Background polling every 2.5 seconds for instant multi-device messaging, presence, and posts
let hbCounter = 0;
setInterval(() => {
  if (S.in && S.user?.id) {
    pollRealtimeMessages();
    hbCounter++;
    if (hbCounter % 4 === 0) {
      fetch('/api/users/' + encodeURIComponent(S.user.id) + '/heartbeat', { method: 'POST' }).catch(() => {});
    }
  }
  fetchServerUsers();
  fetchServerPosts();
}, 2500);

let splashTimerStarted = false;
function initHamudiApp() {
  initBackgroundSync();
  if (!$('#app')) return;
  R();
  if (!splashTimerStarted) {
    splashTimerStarted = true;
    setTimeout(() => {
      if (V.a === 'splash') {
        V.a = 'up';
        R();
      }
    }, 1000);
  }
}

(window as any).initHamudiApp = initHamudiApp;

if (typeof document !== 'undefined') {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initHamudiApp();
  } else {
    document.addEventListener('DOMContentLoaded', initHamudiApp);
  }
}

export {};

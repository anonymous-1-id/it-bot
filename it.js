import './settings.js';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname fix untuk ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prefix = ".";

// === Load tutorial database (opsional) ===
const tutorialPath = path.join(__dirname, "tutorial.json");
let tutorials = {};
if (fs.existsSync(tutorialPath)) {
  tutorials = JSON.parse(fs.readFileSync(tutorialPath, "utf-8"));
}

// === Fungsi utilitas ===
function listTutorials() {
  return ` ╭───⟪ 𝐈𝐓 𝐂𝐋𝐔𝐁 𝐒𝐌𝐊𝐍 𝟒 𝐊𝐋𝐀𝐓𝐄𝐍 ⟫───╮
   │
   │   *Daftar Tutorial IT Club*
   │
   │   1. .github
   │   2. .vercel
   │
   │  💡 Ketik: *.[nama]* untuk mulai
   │
   ╰────────────────────────╯`;
}

export default async function handler(it, m) {
  try {
    const msg = m.messages[0];
    if (!msg || !msg.message) return;

    const from = msg.key.remoteJid;
    const pushname = msg.pushName || "it";

    // === Ambil isi pesan ===
    const body =
      (msg.message.conversation) ? msg.message.conversation :
      (msg.message.imageMessage?.caption) ? msg.message.imageMessage.caption :
      (msg.message.documentMessage?.caption) ? msg.message.documentMessage.caption :
      (msg.message.videoMessage?.caption) ? msg.message.videoMessage.caption :
      (msg.message.extendedTextMessage?.text) ? msg.message.extendedTextMessage.text :
      (msg.message.buttonsResponseMessage?.selectedButtonId) ? msg.message.buttonsResponseMessage.selectedButtonId :
      (msg.message.interactiveResponseMessage) ? JSON.parse(msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id :
      (msg.message.templateButtonReplyMessage?.selectedId) ? msg.message.templateButtonReplyMessage.selectedId :
      "";

    // === Prefix dan Command ===
    const prefixes = Array.isArray(prefix) ? prefix : [prefix];
    const usedPrefix = prefixes.find((p) => body.startsWith(p));
    if (!usedPrefix) return;

    const args = body.slice(usedPrefix.length).trim().split(" ");
    const command = args.shift().toLowerCase();
    const q = args.join(" ");
    const isGroup = from.endsWith("@g.us");

    // === Helper Reply ===
    const reply = async (message) => {
      await it.sendMessage(from, global.makeMsg ? global.makeMsg(message) : { text: message }, { quoted: m });
    };
    m.reply = reply;

    // === Fake Status contoh ===
    const fakeStatus = {
      key: {
        fromMe: false,
        participant: `0@s.whatsapp.net`,
        ...(from ? { remoteJid: "status@broadcast" } : {})
      },
      message: {
        imageMessage: {
          mimetype: "image/jpeg",
          caption: "IT CLUB BOT",
          jpegThumbnail: fs.readFileSync("./media/thumb.jpg")
        }
      }
    };

    // === Handler Utama ===
    switch (command) {
      case "it":
        reply(listTutorials());
        break;

      // === Tutorial GitHub ===
      case "github": {
        if (!q) {
          reply(
            `📚 *Daftar Kategori Tutorial GitHub*

Ketik .github [materi]
1. akun     → Cara Membuat Akun GitHub
2. login    → Cara Login ke GitHub
3. pages    → Public Repo menggunakan GitHub Pages
4. kolab    → Kolaborasi di Repository
5. repo     → Membuat Repository
6. file     → Membuat File pada Repository
7. delrepo  → Menghapus Repository
8. transfer → Mentransfer Repository

Contoh: .github akun`
          );
          return;
        }

        switch (q.toLowerCase()) {
          case "akun":
            reply(`📖 *Tutorial: Membuat Akun GitHub*
1. Buka https://github.com
2. Klik tombol Sign Up
3. Masukkan email, username, password
4. Ikuti verifikasi Captcha
5. Verifikasi email melalui link yang dikirim
✅ Akun GitHub berhasil dibuat!`);
            break;

          case "login": {
            let menuText = `📖 *Tutorial: Login GitHub*
1. Buka https://github.com/login
2. Masukkan username/email dan password
3. Klik tombol Sign In
4. Jika diminta, masukkan kode verifikasi (2FA jika aktif)
✅ Kamu sudah masuk ke GitHub.`;

            let thumbnail = fs.readFileSync("./media/thumb.jpg");

            await it.sendMessage(from, {
  document: fs.readFileSync("./package.json"),
  fileName: `IT CLUB - SNEKA`,
  mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  fileLength: 9999999999,
  caption: menuText,
  footer: `© ITCLUB`,
  headerType: 4,
  contextInfo: {
    isForwarded: true,
    externalAdReply: {
      title: `IT CLUB`,
      body: `Powered by IT CLUB`,
      thumbnail: fs.readFileSync("./media/thumb.jpg"),
      mediaType: 1,
      renderLargerThumbnail: true,
    },
  },
}, { quoted: fakeStatus })
break;
}

          case "pages":
            reply(`📖 *Tutorial: Public Repo dengan GitHub Pages*
1. Masuk ke repo yang ingin dipublish
2. Klik tab Settings
3. Scroll ke Pages
4. Pilih branch (misalnya: main) dan folder (root atau /docs)
5. Klik Save
6. Tunggu beberapa menit, webmu akan bisa diakses di
https://username.github.io/namarepo
✅ Repo berhasil dipublish dengan GitHub Pages.`);
            break;

          case "kolab":
            reply(`📖 *Tutorial: Kolaborasi di Repository*
1. Masuk ke repo milikmu
2. Klik tab Settings
3. Pilih Collaborators
4. Klik Add people
5. Masukkan username temanmu di GitHub
6. Atur permission (Read, Write, Admin)
7. Klik Add
✅ Temanmu bisa kolaborasi di repo tersebut.`);
            break;

          case "repo":
            reply(`📖 *Tutorial: Membuat Repository*
1. Login ke GitHub
2. Klik ikon + di kanan atas → pilih New repository
3. Isi Repository name
4. Pilih Public atau Private
5. Centang Add a README file jika ingin langsung ada file README.md
6. Klik Create repository
✅ Repository berhasil dibuat.`);
            break;

          case "file":
            reply(`📖 *Tutorial: Membuat File pada Repository*
1. Masuk ke repository
2. Klik tombol Add file → pilih Create new file
3. Beri nama file (contoh: index.html)
4. Isi konten file sesuai kebutuhan
5. Scroll ke bawah, beri pesan commit
6. Klik Commit new file
✅ File baru berhasil ditambahkan.`);
            break;

          case "delrepo":
            reply(`📖 *Tutorial: Menghapus Repository*
⚠️ Hati-hati! Repo yang dihapus tidak bisa dikembalikan.
1. Masuk ke repository
2. Klik tab Settings
3. Scroll ke bawah ke bagian Danger Zone
4. Klik Delete this repository
5. Ketik ulang nama repository sebagai konfirmasi
6. Klik I understand the consequences, delete this repository
✅ Repository berhasil dihapus.`);
            break;

          case "transfer":
            reply(`📖 *Tutorial: Mentransfer Repository*
⚠️ Hati-hati! Repo yang di-Transfer tidak bisa dikembalikan kecuali ditransfer kembali.
1. Masuk ke repository
2. Klik tab Settings
3. Scroll ke bawah ke bagian Danger Zone
4. Klik Transfer Ownership
5. Ketik ulang nama repository yang baru sebagai konfirmasi.
6. Masukkan username akun tujuan transfer.
7. Klik tombol konfirmasi.
✅ Repository berhasil di-Transfer.`);
            break;

          default:
            reply("❌ Materi tidak ditemukan. Ketik *.github* untuk melihat daftar.");
        }
        break;
      }

      // === Tutorial Vercel ===
      case "vercel": {
        if (!q) {
          reply(
            `🚀 *Daftar Kategori Tutorial Vercel*

Ketik .vercel [materi]
1. akun    → Cara Membuat Akun Vercel
2. project → Cara Deploy Project / Hosting
3. domain  → Cara Pasang Custom Domain
4. env     → Cara Menambahkan Environment Variable
5. redeploy→ Cara Update Project
6. upload  → Deploy Tanpa GitHub

Contoh: .vercel akun`
          );
          return;
        }

        switch (q.toLowerCase()) {
          case "akun":
            reply(`🆕 Tutorial: Membuat Akun Vercel
1. Buka https://vercel.com
2. Klik Sign Up
3. Pilih login menggunakan GitHub (Sangat Disarankan)
4. Klik Authorize Vercel
✅ Akun berhasil dibuat!`);
            break;

          case "project":
            reply(`🚀 Tutorial: Deploy Project ke Vercel
1. Siapkan project di GitHub (HTML / Node.js / Next.js / dsb)
2. Buka https://vercel.com/dashboard
3. Klik New Project
4. Pilih repository GitHub kamu
5. Klik Deploy
✅ Website kamu langsung online pakai domain bawaan vercel.app`);
            break;

          case "domain":
            reply(`🌐 Tutorial: Pasang Custom Domain di Vercel
1. Masuk ke Project → Tab Domains
2. Klik Add Domain
3. Masukkan domain kamu, contoh: mywebsite.com
4. Klik Continue
5. Masuk ke penyedia domain (Niagahoster / Cloudflare / dll)
6. Tambahkan DNS:
• A Record → 76.76.21.21 (untuk root domain)
• CNAME → cname.vercel-dns.com (untuk subdomain)
7. Kembali ke Vercel dan klik Verify
✅ Domain kamu sudah aktif!`);
            break;

          case "env":
            reply(`⚙️ Tutorial: Menambahkan Environment Variable di Vercel
1. Buka https://vercel.com/dashboard
2. Pilih project yang ingin kamu ubah
3. Masuk ke tab Settings → Environment Variables
4. Klik Add New
5. Isi kolom:
• Name → Nama variabel (misal: API_KEY)
• Value → Nilai variabel kamu
6. Pilih environment: Production / Preview / Development
7. Klik Save
✅ Variabel berhasil ditambahkan dan siap digunakan di project kamu.`);
            break;

          case "redeploy":
            reply(`🔁 Tutorial: Update / Redeploy Project di Vercel
1. Pastikan kamu sudah menghubungkan project ke GitHub.
2. Lakukan perubahan pada kode project di lokal.
3. Commit dan Push ke GitHub.
4. Vercel akan otomatis mendeteksi perubahan dan melakukan redeploy.
📌 Jika ingin redeploy manual:
• Buka https://vercel.com/dashboard
• Pilih project → Tab Deployments
• Klik Redeploy
✅ Project berhasil diupdate ke versi terbaru.`);
            break;

          case "upload":
            reply(`📦 Tutorial: Deploy Project ke Vercel Tanpa GitHub
1. Buka https://vercel.com/new
2. Scroll ke bawah, pilih Import Project Manually
3. Klik Upload Folder atau Drag & Drop file project kamu (.zip / folder)
4. Tunggu proses upload selesai
5. Klik Deploy
✅ Website kamu langsung online tanpa perlu repository GitHub.`);
            break;

          default:
            reply("❌ Materi tidak ditemukan. Ketik *.vercel* untuk melihat daftar.");
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("ERROR in main handler:", err);
  }
}

import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  proto
} from "baileys";
import pino from "pino";
import chalk from "chalk";
import readline from "readline";

// Mode Pairing Code
const usePairingCode = true;

// Prompt input terminal
async function question(prompt) {
  process.stdout.write(prompt);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question("", (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("./dpwSesi");

  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`DPW v${version.join(".")}, isLatest: ${isLatest}`);

  const gb = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: !usePairingCode,
    auth: state,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    version,
    syncFullHistory: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg?.message || undefined;
      }
      return proto.Message.fromObject({});
    },
  });

  // Handle Pairing Code
  if (usePairingCode && !gb.authState.creds.registered) {
    try {
      const phoneNumber = await question(
        chalk.cyan("📱 Silakan Masukkan Nomor WhatsApp Kamu (Awali dengan 62):\n") +
        chalk.white("Contoh: 6281234567890\n\n") +
        chalk.yellow("➤ Masukkan di sini: ")
      );
      const code = await gb.requestPairingCode(phoneNumber.trim());
      console.log(`🎁 Pairing Code : ${chalk.green(code)}\n`);
    } catch (err) {
      console.error("❌ Gagal mendapatkan pairing code:", err);
    }
  }

  // Simpan sesi login
  gb.ev.on("creds.update", saveCreds);

  // Saat koneksi WA berubah
  gb.ev.on("connection.update", async (update) => {
    const { connection } = update;

    if (connection === "close") {
      console.log(chalk.red("❌  Koneksi Terputus, Mencoba Menyambung Ulang..."));
      connectToWhatsApp(); // Reconnect
    } else if (connection === "open") {
      console.clear();
      console.log(chalk.green(`
  ╔═══════════════════════════════╗
  ║     🤖 DPW WHATSAPP BOT       ║
  ╠═══════════════════════════════╣
  ║   BOT SUKSES TERHUBUNG KE WA  ║
  ║     Siap menerima perintah!   ║
  ╚═══════════════════════════════╝
  `));
      console.log(
        chalk.green.bold("✅ BOT TELAH BERHASIL TERHUBUNG KE WHATSAPP!\n") +
        chalk.magenta("🎉 Selamat! Bot kamu sekarang aktif dan berjalan normal.\n") +
        chalk.white("🟢 Status: Online & Siaga!\n") +
        chalk.yellow("🚀 Powered by Baileys x DPW Official\n")
      );
    }
  });

  // Respon pesan masuk
  gb.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const body =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const sender = msg.key.remoteJid;
    const pushname = msg.pushName || "DPW Bot";

    const listColor = ["red", "green", "yellow", "magenta", "cyan", "white"];
    const randomColor = listColor[Math.floor(Math.random() * listColor.length)];

    console.log(
      chalk.yellow.bold("Credit : Dpw"),
      chalk.green.bold("[ WhatsApp ]"),
      chalk[randomColor](pushname),
      chalk[randomColor](" : "),
      chalk.white(body)
    );

    const gbHandler = await import("./it.js");
    gbHandler.default(gb, m);
  });
}

// 💡 Banner saat menghubungkan
console.clear();
console.log(chalk.green(`
╔════════════════════════════════════════╗
║           🔄 MENGHUBUNGKAN BOT...      ║
╚════════════════════════════════════════╝
`));

// 🚀 Jalankan koneksi
connectToWhatsApp();

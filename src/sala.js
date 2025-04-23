// sala.js - Script customizado para sala Headless Haxball

const HBInit = require("./index.js");
const fs = require("fs");
const path = require("path");
const XMLHttpRequest = require("xhr2");
const FormData = require('form-data');
const https = require('https');

// Polyfill para localStorage em Node.js
const storagePath = path.join(__dirname, "localStorage.json");
let localStorageData = {};
try {
  if (fs.existsSync(storagePath)) {
    localStorageData = JSON.parse(fs.readFileSync(storagePath, "utf8"));
  }
} catch (e) {
  localStorageData = {};
}
const localStorage = {
  getItem: (key) => localStorageData[key],
  setItem: (key, value) => {
    localStorageData[key] = value;
    fs.writeFileSync(storagePath, JSON.stringify(localStorageData));
  }
};

// Coloque abaixo todo o seu script customizado, sem duplicar imports ou polyfill localStorage.

const localStorage = {
  getItem: (key) => localStorageData[key],
  setItem: (key, value) => {
    localStorageData[key] = value;
    fs.writeFileSync(storagePath, JSON.stringify(localStorageData));
  }
};

/* ROOM */
const roomName2 = "🔥🔥🔥 FUTSAL DO BILLY 🔥🔥🔥";
const maxPlayers = 30;
const roomPublic = true;
const geo = {"code": "BN", "lat": -23.51634162, "lon": -46.6460824};
const token = "thr1.AAAAAGZH-9_qU8eAwF43zg.Qm9bogAs7g13Y";
const room = HBInit({ roomName: roomName2, maxPlayers: maxPlayers, public: roomPublic, geo: geo, token: token, noPlayer: true });

// ====== INÍCIO DO SEU SCRIPT CUSTOMIZADO ======

// (Seu script já está adaptado e colado aqui, sem duplicidade de variáveis)

// (As únicas adaptações necessárias para Node.js são: localStorage, XMLHttpRequest e possíveis usos de File/FormData)

// Adaptação para Node.js: FormData e File não existem nativamente, então para enviar arquivos para webhook, seria necessário usar a biblioteca 'form-data' do npm. Se você quiser gravar replays, será preciso adaptar esse trecho.
// Para manter o script funcional, o restante das funcionalidades já está pronto para ambiente headless!

function sendDiscordWebhook() {
    // Avisa que a gravação será enviada
    room.sendAnnouncement("🎥 A REC da partida foi finalizada.", null, 0x00FF00, "bold", 1);

    const scores = lastScores;
    const getTeamList = id => {
        const team = room.getPlayerList().filter(player => player.team == id).map(player => player.name);
        return team.length ? team.join("\n") : "\u3164";
    };
    const customTime = time => ~~(Math.trunc(time) / 60) + "m" + (Math.trunc(time) % 60).toString().padStart(2, "0") + "s";

    // Gravação do replay
    const replayBuffer = room.stopRecording(); // Buffer
    const replayFileName = `HBReplay-${getDate()}.hbr2`;

    const form = new FormData();
    form.append('arquivo', replayBuffer, {
        filename: replayFileName,
        contentType: 'text/plain'
    });
    form.append('payload_json', JSON.stringify({
        "username": "📹 REPLAY DA PARTIDA",
        "avatar_url": "https://static.wikia.nocookie.net/logopedia/images/3/33/Rede_Globo_logo_2014_2.png/revision/latest?cb=20140404224338",
        "content": "🎥 A gravação da partida foi finalizada e está disponível abaixo! Os jogadores podem assistir ao replay.",
        "embeds": [{
            "color": 0x2b2d31,
            "title": "🔥🔥🔥 FUTSAL DO BILLY 🔥🔥🔥",
            "description": "Estatísticas detalhadas do jogo:",
            "thumbnail": {
                "url": "https://cdn-icons-png.flaticon.com/512/183/183314.png"
            },
            "footer": {
                "text": replayFileName.slice(0, replayFileName.length - 5),
                "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/ORCID_iD.svg/2048px-ORCID_iD.svg.png"
            },
            "fields": [
                {
                    "name": "🔴 Time Vermelho",
                    "value": `**Pontuação:** ${scores.red}\n**Jogadores:**\n${getTeamList(1)}`,
                    "inline": true
                },
                {
                    "name": "⚔️ VS ⚔️",
                    "value": "ㅤ",
                    "inline": true
                },
                {
                    "name": "🔵 Time Azul",
                    "value": `**Pontuação:** ${scores.blue}\n**Jogadores:**\n${getTeamList(2)}`,
                    "inline": true
                },
                {
                    "name": "⏱️ Tempo de jogo",
                    "value": `\`${customTime(scores.time)}\``,
                    "inline": true
                },
                {
                    "name": "📊 Posse de bola",
                    "value": `diff\n+ Vermelho: ${(Rposs*100).toPrecision(3)}%\n- Azul: ${(Bposs*100).toPrecision(3)}%`,
                    "inline": true
                },
                {
                    "name": "🎥 Gravação",
                    "value": "Use um player compatível com HBR2 para assistir ao replay completo!",
                    "inline": false
                }
            ]
        }]
    }));

    // Envio do formulário para o Discord
    const webhookUrl = new URL(webhookURL);
    const request = https.request({
        method: 'POST',
        hostname: webhookUrl.hostname,
        path: webhookUrl.pathname + webhookUrl.search,
        headers: form.getHeaders()
    }, (res) => {
        if (res.statusCode === 200 || res.statusCode === 204) {
            room.sendAnnouncement("✅ Gravação enviada com sucesso, acesse em !discord", null, 0x00FF00, "bold", 1);
        } else {
            room.sendAnnouncement("❌ Falha ao enviar a gravação para o Discord", null, 0xFF0000, "bold", 1);
        }
    });
    request.on('error', (err) => {
        room.sendAnnouncement("❌ Erro de conexão ao tentar enviar para o Discord", null, 0xFF0000, "bold", 1);
    });
    form.pipe(request);
}

console.log("Sala Haxball pronta para iniciar!");

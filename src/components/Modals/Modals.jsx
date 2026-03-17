import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import styles from './Modals.module.css';

// ─── Configuración Gemini Directa ───────────────────────────────────────────
const GEMINI_KEY = 'AIzaSyAJDGhLvoJN0DqTUOmq8RENP_FteTX6tRY'; // Clave actualizada
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

const NORMA_PROMPT = `
Eres NORMA, la IA defensora de usuarios de telecomunicaciones en Perú — HazMeCasoPE.
Tu estilo: **Amiga experta, directa, empática y MUY ÁGIL.**

════════════════════════════════
REGLAS DE ORO DE CONSERVACIÓN
════════════════════════════════
1. **Un paso a la vez**: No lances toda la ley de golpe. Haz preguntas cortas.
2. **Brevedad Extrema**: Máximo 2 párrafos cortos. Usa negritas para lo vital.
3. **Cero Aburrimiento**: Evita sonar como un contrato. Habla como alguien que quiere ayudar YA.
4. **Empoderamiento**: Cuando sea el momento de la verdad, cita el artículo clave (ej: "Art. 66.9 Ley 29571") para que el usuario se sienta seguro.

════════════════════════════════
FLUJO DINÁMICO
════════════════════════════════
• Saludo + Emoción: "¡Qué rabia lo de tu recibo! Soy Norma. ¿Cómo te llamas?" (Y PARAS AHÍ).
• Una vez sepas el nombre: "¿Con qué operador estás teniendo este lío, [Nombre]?" (Y PARAS AHÍ).
• Diagnóstico + Ley: "Entiendo. Eso vulnera el **Art. 24 de la Ley 29571**. ¡No pueden ignorar tu reclamo! ¿Quieres que te diga qué pasos seguir?"

════════════════════════════════
BASE LEGAL RÁPIDA (Solo cita cuando sea relevante)
════════════════════════════════
- **Ley 29571**: Art. 66.9 (No corte si hay pago), Art. 24 (Atención eficaz), Prohibición de pago previo para reclamar.
- **Ley 29733**: Art. 5 (Consentimiento para datos/spam).
- **Res. 172-2022/OSIPTEL**: Plazos (3-20 días hábiles para resolver).
- **Ley 27444**: Debido proceso y Silencio Administrativo.

¡Haz que el usuario se sienta escuchado y protegido, no que está leyendo un manual! ✨⚖️
`;

const SESSION_KEY = 'norma_session_id';

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = 'usr_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function fmt(date = new Date()) {
  return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// Convierte Blob → base64 puro, con debug
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (!result || !result.includes(',')) {
        reject(new Error('FileReader no devolvió data URI: ' + typeof result));
        return;
      }
      const b64 = result.split(',')[1];
      if (!b64 || b64.length < 50) {
        reject(new Error('base64 demasiado corto: ' + b64?.length));
        return;
      }
      console.log('✅ blobToBase64 OK:', b64.length, 'chars');
      resolve(b64);
    };
    reader.onerror = (e) => reject(new Error('FileReader error: ' + e));
    reader.readAsDataURL(blob);
  });
}

// ─── Language Selector ──────────────────────────────────────────────────────
const LANGS = [
  { code: 'es', label: 'ES', name: 'Español', flag: '🇵🇪' },
  { code: 'qu', label: 'QU', name: 'Quechua', flag: '🏔️' },
  { code: 'ay', label: 'AY', name: 'Aymara', flag: '🌊' },
];

function LanguagePill({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const cur = LANGS.find(l => l.code === lang) || LANGS[0];
  return (
    <div className={styles.langWrap}>
      <button className={styles.langBtn} onClick={() => setOpen(o => !o)} title="Cambiar idioma">
        <span>{cur.flag}</span> <span>{cur.label}</span> <span className={styles.langArrow}>▾</span>
      </button>
      {open && (
        <div className={styles.langMenu}>
          {LANGS.map(l => (
            <button
              key={l.code}
              className={`${styles.langOpt} ${l.code === lang ? styles.langOptAct : ''}`}
              onClick={() => { setLang(l.code); setOpen(false); }}
            >
              {l.flag} {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Attachment Preview ──────────────────────────────────────────────────────
function AttachPreview({ attachments, onRemove }) {
  if (!attachments.length) return null;
  return (
    <div className={styles.attachRow}>
      {attachments.map((a, i) => (
        <div key={i} className={styles.attachChip}>
          {a.type.startsWith('image/') ? (
            <img src={URL.createObjectURL(a.file)} className={styles.attachThumb} alt={a.file.name} />
          ) : (
            <span className={styles.attachIcon}>{a.type === 'application/pdf' ? '📄' : '📎'}</span>
          )}
          <span className={styles.attachName}>
            {a.file.name.slice(0, 18)}{a.file.name.length > 18 ? '…' : ''}
          </span>
          <button className={styles.attachRm} onClick={() => onRemove(i)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Message Bubble ──────────────────────────────────────────────────────────
function MsgBubble({ m }) {
  const isBot = m.type === 'bot';
  return (
    <div className={`${styles.msg} ${isBot ? styles.botMsg : styles.userMsg}`}>
      {m.attachments && m.attachments.map((a, i) =>
        a.type.startsWith('image/') ? (
          <img key={i} src={URL.createObjectURL(a.file)} className={styles.bubbleImg} alt={a.file.name} />
        ) : (
          <div key={i} className={styles.bubbleDoc}>
            {a.type === 'application/pdf' ? '📄' : '📎'} {a.file.name}
          </div>
        )
      )}
      {m.audioUrl && (
        <audio controls src={m.audioUrl} className={styles.audioPlayer} />
      )}
      {m.text && <MsgText text={m.text} />}
      <div className={styles.msgMeta}>
        {m.lang && m.lang !== 'es' && (
          <span className={styles.msgLang}>{LANGS.find(l => l.code === m.lang)?.flag}</span>
        )}
        <span className={styles.msgTime}>{m.time}</span>
        {isBot && <span className={styles.msgStatus}>✓✓</span>}
      </div>
    </div>
  );
}

function MsgText({ text }) {
  const lines = text.split('\n');
  return (
    <div className={styles.msgText}>
      {lines.map((line, i) => {
        const bold = line.replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong>${t}</strong>`);
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return <div key={i} className={styles.msgBullet} dangerouslySetInnerHTML={{ __html: '• ' + bold.slice(2) }} />;
        }
        return <div key={i} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />;
      })}
    </div>
  );
}

// ─── Typing Indicator ────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className={styles.typingWrap}>
      <div className={styles.typingAvatar}>🤖</div>
      <div className={styles.typing}><span /><span /><span /></div>
    </div>
  );
}

// ─── Quick Reply Chips ────────────────────────────────────────────────────────
const QUICK_REPLIES = {
  es: ['📱 Problema con mi señal', '💸 Me cobran de más', '🌐 Internet lento', '❌ Cancelar servicio', '⚖️ Quiero reclamar'],
  qu: ['📱 Señalmi mana allinchu', '💸 Astawanmi cobrashanku', '🌐 Internetmi pisilla', '⚖️ Reclamamunay munani'],
  ay: ['📱 Señalax janiw walikitixa', '💸 Askichata qullqipa apanipxi', '⚖️ Reclamaña muntha'],
};

function QuickReplies({ lang, onSelect }) {
  const chips = QUICK_REPLIES[lang] || QUICK_REPLIES.es;
  return (
    <div className={styles.quickRow}>
      {chips.map((c, i) => (
        <button key={i} className={styles.quickChip} onClick={() => onSelect(c)}>{c}</button>
      ))}
    </div>
  );
}

// ─── Voice Recorder Hook ──────────────────────────────────────────────────────
function useVoiceRecorder(onResult) {
  const [recording, setRecording] = useState(false);
  const [recError, setRecError] = useState(null);
  const mrRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const start = useCallback(async () => {
    setRecError(null);
    chunksRef.current = [];

    if (mrRef.current && mrRef.current.state === 'recording') return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Detectar primer MIME soportado por el browser
      const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4',
      ];
      const mime = candidates.find(m => MediaRecorder.isTypeSupported(m)) || '';
      console.log('🎙️ Iniciando grabación con MIME:', mime || 'browser default');

      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
      mrRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log(`📦 chunk: ${e.data.size}b, total: ${chunksRef.current.length}`);
        }
      };

      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());

        const chunks = chunksRef.current;
        const totalBytes = chunks.reduce((s, c) => s + c.size, 0);
        console.log(`⏹️ Stop: ${chunks.length} chunks, ${totalBytes} bytes`);

        if (!chunks.length || totalBytes < 500) {
          setRecError('Audio muy corto. Mantén el botón presionado mientras hablas.');
          return;
        }

        const realMime = mr.mimeType || mime || 'audio/webm';
        const blob = new Blob(chunks, { type: realMime });
        console.log(`🎵 Blob final: ${blob.size}b, tipo: ${blob.type}`);

        const url = URL.createObjectURL(blob);
        onResult(blob, url);
      };

      mr.onerror = (e) => {
        console.error('❌ MediaRecorder error:', e.error);
        setRecError('Error de grabación: ' + (e.error?.message || 'desconocido'));
      };

      mr.start(100); // chunk cada 100ms
      setRecording(true);

    } catch (err) {
      console.error('❌ getUserMedia:', err.name, err.message);
      if (err.name === 'NotAllowedError') {
        setRecError('Permiso de micrófono denegado. Habilítalo en la barra del navegador.');
      } else if (err.name === 'NotFoundError') {
        setRecError('No se encontró micrófono. Conecta uno e intenta de nuevo.');
      } else {
        setRecError('No se pudo acceder al micrófono: ' + err.message);
      }
    }
  }, [onResult]);

  const stop = useCallback(() => {
    console.log('⏹️ stop() — estado mr:', mrRef.current?.state);
    if (mrRef.current && mrRef.current.state === 'recording') {
      mrRef.current.stop();
    }
    setRecording(false);
  }, []);

  return { recording, recError, start, stop };
}

// ─── MAIN CHAT MODAL ─────────────────────────────────────────────────────────
export function ChatModal({ isOpen, onClose }) {
  const [msgs, setMsgs] = useState([{
    id: 1, type: 'bot', time: fmt(),
    text: '👋 ¡Hola! Soy **NORMA**, tu defensora legal de telecomunicaciones. Puedo entenderte en **español, quechua o aymara**.\n\nPuedes escribirme, enviarme una **nota de voz** 🎙️, adjuntar **fotos de tu recibo** o documentos. ¿Cuál es tu problema? 💪',
    lang: 'es',
  }]);
  const [inp, setInp] = useState('');
  const [lang, setLang] = useState('es');
  const [typing, setTyping] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showQuick, setShowQuick] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef(null);
  const msgsEndRef = useRef(null);
  const sessionId = getSessionId();

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing, isOpen]);

  // ── Handler de audio ──────────────────────────────────────────────────────
  const handleVoiceResult = useCallback(async (blob, url) => {
    console.group('📤 handleVoiceResult');
    console.log('blob.size:', blob.size, '| blob.type:', blob.type);

    // Burbuja del usuario con audio
    setMsgs(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      time: fmt(),
      audioUrl: url,
      text: '🎙️ Nota de voz',
      lang,
    }]);
    setTyping(true);
    setShowQuick(false);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: NORMA_PROMPT,
      });

      // Historial para audio mejorado con contexto
      const chatHistory = msgs.slice(1).map(m => ({
        role: m.type === 'bot' ? 'model' : 'user',
        parts: [{ text: m.text || "[Nota de Voz/Multimedia]" }],
      }));

      const chat = model.startChat({ history: chatHistory });

      // Obtener el MIME type real del blob para Gemini
      const realMime = blob.type || 'audio/webm;codecs=opus';
      console.log('🎤 Enviando audio a Gemini con MIME:', realMime);

      const parts = [
        { text: "El usuario ha enviado un mensaje de voz. Por favor, escúchalo con atención, transcríbelo mentalmente y responde a su consulta siguiendo tu personalidad de NORMA." },
        {
          inlineData: {
            data: await blobToBase64(blob),
            mimeType: realMime.split(';')[0], // Gemini prefiere el tipo base sin parámetros adicionales
          }
        }
      ];

      const result = await chat.sendMessage(parts);
      const response = await result.response;
      const text = response.text();

      setTyping(false);
      setMsgs(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        time: fmt(),
        text: text || '(Norma escuchó el audio pero no pudo generar una respuesta clara. ¿Podrías repetirlo?)',
        lang: 'es',
      }]);

    } catch (err) {
      console.error('❌ Error (Audio):', err);
      const errorHint = err.message?.includes('429') ? '(Cuota agotada)' : '';
      setTyping(false);
      setMsgs(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        time: fmt(),
        text: `Estamos trabajando, una disculpa si no se conecta en este momento. ${errorHint} 🙏 Por favor, intenta de nuevo.`,
      }]);
    }
  }, [sessionId, lang]);

  const { recording, recError, start: startRec, stop: stopRec } =
    useVoiceRecorder(handleVoiceResult);

  // Mostrar errores del micrófono como burbuja del bot
  useEffect(() => {
    if (recError) {
      setMsgs(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        time: fmt(),
        text: `🎙️ ${recError}`,
      }]);
    }
  }, [recError]);

  // ── Envío de texto / archivos ──────────────────────────────────────────
  const sendMsg = async (textOverride) => {
    const text = (textOverride || inp).trim();
    if (!text && !attachments.length) return;

    setMsgs(prev => [...prev, {
      id: Date.now(), type: 'user', time: fmt(),
      text, attachments: [...attachments], lang,
    }]);
    setInp('');
    setAttachments([]);
    setTyping(true);
    setShowQuick(false);
    setAnalyzing(attachments.length > 0);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: NORMA_PROMPT,
      });

      // Convertir msgs previos al formato de historial de Gemini ({ role, parts })
      const chatHistory = msgs.slice(1).map(m => ({
        role: m.type === 'bot' ? 'model' : 'user',
        parts: [{ text: m.text || (m.audioUrl ? "[Nota de Voz]" : "[Archivo]") }],
      }));

      const chat = model.startChat({
        history: chatHistory,
      });

      const parts = [];
      if (attachments.length > 0) {
        for (const a of attachments) {
          const b64 = await fileToBase64(a.file);
          parts.push({
            inlineData: {
              data: b64,
              mimeType: a.type,
            }
          });
        }
      }
      parts.push({ text: text || 'El usuario envió archivos.' });

      const result = await chat.sendMessage(parts);
      const response = await result.response;
      const responseText = response.text();

      setTyping(false);
      setAnalyzing(false);
      setMsgs(prev => [...prev, {
        id: Date.now() + 1, type: 'bot', time: fmt(),
        text: responseText || '(Sin respuesta)', lang: 'es',
      }]);
    } catch (err) {
      console.error('❌ Error API Gemini:', err);
      // Incluir una pista mínima del error para saber si es cuota o seguridad
      const errorHint = err.message?.includes('429') ? '(Cuota agotada)' : (err.message?.includes('Safety') ? '(Bloqueo de seguridad)' : '');
      
      setTyping(false);
      setAnalyzing(false);
      setMsgs(prev => [...prev, {
        id: Date.now() + 1, type: 'bot', time: fmt(),
        text: `Estamos trabajando, una disculpa si no se conecta. ${errorHint} 🙏 ¿Podrías intentar de nuevo en un momento?`,
      }]);
    }
  };

  const handleFiles = (fileList) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'image/gif'];
    const newAtts = Array.from(fileList)
      .filter(f => allowed.includes(f.type))
      .map(f => ({ file: f, type: f.type }));
    setAttachments(prev => [...prev, ...newAtts].slice(0, 5));
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.chatOverlay} ${isOpen ? styles.open : ''}`}
      onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      onDragOver={e => e.preventDefault()}
    >
      <div className={styles.chatWindow}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className={styles.chatHdr}>
          <div className={styles.chatAv}>
            <span className={styles.chatAvEmoji}>⚖️</span>
            <div className={styles.pulseDot} />
          </div>
          <div className={styles.chatHdrInfo}>
            <div className={styles.chName}>NORMA · HazMeCasoPE</div>
            <div className={styles.chStatus}>Asistente Legal IA · Español · Quechua · Aymara</div>
          </div>
          <LanguagePill lang={lang} setLang={setLang} />
          <button className={styles.chatX} onClick={onClose}>✕</button>
        </div>

        {/* ── Capabilities bar ───────────────────────────────────── */}
        <div className={styles.capsBar}>
          <span className={styles.cap}>🎙️ Voz</span>
          <span className={styles.cap}>📄 PDF</span>
          <span className={styles.cap}>🖼️ Foto</span>
          <span className={styles.cap}>🏔️ Quechua</span>
          <span className={styles.cap}>🌊 Aymara</span>
        </div>

        {/* ── Messages ───────────────────────────────────────────── */}
        <div className={styles.chatMsgs}>
          {showQuick && <QuickReplies lang={lang} onSelect={t => sendMsg(t)} />}
          {msgs.map(m => <MsgBubble key={m.id} m={m} />)}
          {typing && (
            <div>
              <TypingDots />
              {analyzing && <div className={styles.analyzingNote}>🔍 Analizando tu documento…</div>}
            </div>
          )}
          <div ref={msgsEndRef} />
        </div>

        {/* ── Attachment preview ─────────────────────────────────── */}
        <AttachPreview
          attachments={attachments}
          onRemove={i => setAttachments(prev => prev.filter((_, j) => j !== i))}
        />

        {/* ── Input area ─────────────────────────────────────────── */}
        <div className={styles.chatInpArea}>
          <button className={styles.iconBtn} onClick={() => fileRef.current?.click()} title="Adjuntar">
            📎
          </button>
          <input ref={fileRef} type="file" hidden multiple accept="image/*,application/pdf"
            onChange={e => handleFiles(e.target.files)} />

          <input
            type="text"
            className={styles.chatInp}
            placeholder={
              lang === 'qu' ? 'Kaypi qillqay…' :
                lang === 'ay' ? 'Akaru qillqaña…' :
                  'Escribe tu consulta…'
            }
            value={inp}
            onChange={e => setInp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
          />

          {/*
            Botón de voz.
            USA onPointerDown/Up en lugar de onMouseDown/Up:
            - funciona igual en mouse, touch y stylus
            - setPointerCapture asegura que el Up se capture aunque el dedo se mueva
          */}
          <button
            className={`${styles.iconBtn} ${recording ? styles.recActive : ''}`}
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              startRec();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              stopRec();
            }}
            onPointerCancel={(e) => {
              e.preventDefault();
              stopRec();
            }}
            title="Mantén presionado para grabar"
          >
            {recording ? '⏹️' : '🎙️'}
          </button>

          <button
            className={styles.chatSend}
            onClick={() => sendMsg()}
            disabled={!inp.trim() && !attachments.length}
          >
            ➤
          </button>
        </div>

        {recording && (
          <div className={styles.recBar}>
            <div className={styles.recDot} /> Grabando… suelta para enviar
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TICKET MODAL ────────────────────────────────────────────────────────────
export function TicketModal({ isOpen, onClose, sede }) {
  if (!isOpen || !sede) return null;
  const now = new Date();
  const hora = fmt(now);
  const num = 'OSI-' + now.getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);

  return (
    <div className={`${styles.modalOverlay} ${isOpen ? styles.openFlex : ''}`}>
      <div className={styles.modalBox}>
        <div className={styles.modalTop}>
          <div className={styles.modalIconBig}>🎫</div>
          <h3>¡Cita Reservada!</h3>
          <p>Tu ticket digital ha sido generado</p>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.ticketIdBox}>
            <div className={styles.ticketNum}>{num}</div>
            <div className={styles.ticketNumLbl}>Número de Ticket</div>
          </div>
          <div className={styles.tRows}>
            {[
              ['🏢', 'Sede', sede.name],
              ['📍', 'Dirección', sede.addr],
              ['🕐', 'Hora reservada', `${hora} — Hoy`],
              ['⏱', 'Espera estimada', sede.wait],
              ['📞', 'Teléfono', sede.phone],
            ].map(([ico, lbl, val]) => (
              <div key={lbl} className={styles.tRow}>
                <span className={styles.trIco}>{ico}</span>
                <div>
                  <div className={styles.trLbl}>{lbl}</div>
                  <div className={styles.trVal}>{val}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.modalActs}>
            <button className={styles.btnSec} onClick={onClose}>Cerrar</button>
            <button className={styles.btnPri} onClick={onClose}>Descargar Ticket</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NORM ANALYSIS MODAL ──────────────────────────────────────────────────────
export function NormModal({ isOpen, onClose, initialClaim }) {
  const [claim, setClaim] = useState(initialClaim || '');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    setClaim(initialClaim || '');
    setAnalysis(null);
    setError(null);
    setFile(null);
  }, [initialClaim, isOpen]);

  const handleAnalyze = async () => {
    if (!claim.trim() && !file) return;
    setLoading(true);
    setError(null);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: "Eres un analista legal experto en telecomunicaciones peruanas. Analiza el caso y cita normas.",
      });

      const parts = [{ text: claim || 'Analiza este documento.' }];

      if (file) {
        const b64 = await fileToBase64(file);
        parts.push({
          inlineData: {
            data: b64,
            mimeType: file.type,
          }
        });
      }

      const result = await model.generateContent(parts);
      const res = await result.response;
      setAnalysis(res.text());
    } catch {
      setError('No se pudo conectar directamente con el motor de análisis. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.normOverlay} ${isOpen ? styles.openFlex : ''}`}>
      <div className={styles.normBox}>
        <div className={styles.normHdr}>
          <div className={styles.normHdrL}>
            <div className={styles.normIco}>⚖️</div>
            <div>
              <h3>Análisis Normativo OSIPTEL</h3>
              <p>Describe tu caso o adjunta un documento / foto de recibo</p>
            </div>
          </div>
          <button className={styles.normX} onClick={onClose}>✕</button>
        </div>
        <div className={styles.normBody}>
          <textarea
            className={styles.claimTa}
            value={claim}
            onChange={e => setClaim(e.target.value)}
            placeholder="Ej: Movistar me cortó el servicio sin avisar y me cobran una multa indebida..."
            style={{ minHeight: 90 }}
          />
          <div className={styles.normAttachRow}>
            <button className={styles.normAttachBtn} onClick={() => fileRef.current?.click()}>
              📎 Adjuntar documento / foto de recibo
            </button>
            <input ref={fileRef} type="file" hidden accept="image/*,application/pdf"
              onChange={e => setFile(e.target.files[0])} />
            {file && (
              <span className={styles.normFileName}>
                {file.type.startsWith('image/') ? '🖼️' : '📄'} {file.name.slice(0, 30)}
                <button onClick={() => setFile(null)} className={styles.attachRm}>✕</button>
              </span>
            )}
          </div>
          <button
            className={styles.btnOrange}
            onClick={handleAnalyze}
            disabled={loading || (!claim.trim() && !file)}
          >
            {loading ? '⚖️ Analizando tu caso…' : '⚖️ Analizar con IA'}
          </button>
          {error && <div className={styles.normError}>🚨 {error}</div>}
          {analysis && (
            <div className={styles.normResult}>
              <div className={styles.normResultTitle}>📋 Resultado del Análisis</div>
              <div className={styles.normArts} style={{ whiteSpace: 'pre-wrap' }}>{analysis}</div>
              <div className={styles.normDisclaimer}>
                ⚠️ Este análisis es orientativo. Para casos complejos, acude a OSIPTEL o un abogado.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
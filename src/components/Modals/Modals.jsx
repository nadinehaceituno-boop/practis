import { useState, useRef, useEffect } from 'react';
import styles from './Modals.module.css';

const BOT_REPLIES = [
  "Entendido. ¿Con qué operador tienes el problema? (Claro, Movistar, Entel o Bitel)",
  "Según la Resolución N°040-2023-CD/OSIPTEL, tienes 30 días hábiles para reclamar. ¿Deseas que inicie el trámite?",
  "Estoy analizando tu caso. Te mostraré los centros de atención disponibles más cercanos.",
  "Puedo conectarte con el área especializada o generar un expediente de reclamo. ¿Qué prefieres?",
  "Tu caso es prioritario. Un asesor te contactará en menos de 2 horas. ¿Quieres reservar una cita presencial?",
];

export function ChatModal({ isOpen, onClose }) {
  const [msgs, setMsgs] = useState([
    { id: 1, type: 'bot', text: '👋 ¡Hola! Soy el asistente inteligente de HazMeCasoPE. Estoy aquí para ayudarte con cualquier problema con tu operador. ¿Cuál es tu consulta?', time: 'ahora' }
  ]);
  const [inp, setInp] = useState('');
  const [typing, setTyping] = useState(false);
  const msgsEndRef = useRef(null);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing, isOpen]);

  if (!isOpen) return null;

  const sendMsg = () => {
    if (!inp.trim()) return;
    const t = new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2, '0');
    setMsgs(prev => [...prev, { id: Date.now(), type: 'user', text: inp, time: t }]);
    setInp('');
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const r = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
      setMsgs(prev => [...prev, { id: Date.now()+1, type: 'bot', text: r, time: t }]);
    }, 1300);
  };

  return (
    <div className={`${styles.chatOverlay} ${isOpen ? styles.open : ''}`}>
      <div className={styles.chatWindow}>
        <div className={styles.chatHdr}>
          <div className={styles.chatAv}>🤖</div>
          <div className={styles.chatHdrInfo}>
            <div className={styles.chName}>Asistente IA · HazMeCasoPE</div>
            <div className={styles.chStatus}><div className={styles.pulseDot}/>En línea · Gemini activo</div>
          </div>
          <button className={styles.chatX} onClick={onClose}>✕</button>
        </div>
        <div className={styles.chatMsgs}>
          {msgs.map(m => (
            <div key={m.id} className={`${styles.msg} ${m.type === 'bot' ? styles.botMsg : styles.userMsg}`}>
              {m.text}
              <div className={styles.msgTime}>{m.time}</div>
            </div>
          ))}
          {typing && (
            <div className={styles.typing}><span></span><span></span><span></span></div>
          )}
          <div ref={msgsEndRef} />
        </div>
        <div className={styles.chatInpArea}>
          <input 
            type="text" 
            className={styles.chatInp} 
            placeholder="Escribe tu consulta..."
            value={inp}
            onChange={e => setInp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMsg()}
          />
          <button className={styles.chatSend} onClick={sendMsg}>▶</button>
        </div>
      </div>
    </div>
  );
}

export function TicketModal({ isOpen, onClose, sede }) {
  if (!isOpen || !sede) return null;

  const now = new Date();
  const hora = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  const num = 'OSI-' + now.getFullYear() + '-' + String(Math.floor(Math.random()*9000)+1000);

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
            <div className={styles.tRow}><span className={styles.trIco}>🏢</span><div><div className={styles.trLbl}>Sede</div><div className={styles.trVal}>{sede.name}</div></div></div>
            <div className={styles.tRow}><span className={styles.trIco}>📍</span><div><div className={styles.trLbl}>Dirección</div><div className={styles.trVal}>{sede.addr}</div></div></div>
            <div className={styles.tRow}><span className={styles.trIco}>🕐</span><div><div className={styles.trLbl}>Hora reservada</div><div className={styles.trVal}>{hora} — Hoy</div></div></div>
            <div className={styles.tRow}><span className={styles.trIco}>⏱</span><div><div className={styles.trLbl}>Espera estimada</div><div className={styles.trVal}>{sede.wait}</div></div></div>
            <div className={styles.tRow}><span className={styles.trIco}>📞</span><div><div className={styles.trLbl}>Teléfono de la sede</div><div className={styles.trVal}>{sede.phone}</div></div></div>
          </div>
          <div className={styles.qrWrap}>
            <svg className={styles.qrSvg} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="8" fill="#F5F7FA"/>
              <rect x="8" y="8" width="28" height="28" rx="2" fill="#0A3D7C"/>
              <rect x="13" y="13" width="18" height="18" rx="1" fill="white"/>
              <rect x="17" y="17" width="10" height="10" rx="1" fill="#0A3D7C"/>
              <rect x="44" y="8" width="28" height="28" rx="2" fill="#0A3D7C"/>
              <rect x="49" y="13" width="18" height="18" rx="1" fill="white"/>
              <rect x="53" y="17" width="10" height="10" rx="1" fill="#0A3D7C"/>
              <rect x="8" y="44" width="28" height="28" rx="2" fill="#0A3D7C"/>
              <rect x="13" y="49" width="18" height="18" rx="1" fill="white"/>
              <rect x="17" y="53" width="10" height="10" rx="1" fill="#0A3D7C"/>
              <rect x="44" y="44" width="8" height="8" fill="#FF7A00"/>
              <rect x="56" y="44" width="8" height="8" fill="#1C8EC6"/>
              <rect x="44" y="56" width="8" height="8" fill="#1C8EC6"/>
              <rect x="56" y="56" width="16" height="8" fill="#0A3D7C"/>
              <rect x="68" y="44" width="4" height="12" fill="#0A3D7C"/>
            </svg>
            <div className={styles.qrNote}>Muestra este QR en el centro de atención</div>
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

const NORM_ARTS = [
  {art:'Art. 5° – Reglamento de Calidad',text:'El operador debe garantizar los niveles mínimos de calidad contratados. En caso de incumplimiento, el usuario tiene derecho a compensación proporcional.'},
  {art:'Art. 22° – TUO de Telecomunicaciones',text:'Todo usuario tiene derecho a presentar reclamo ante el operador y, en segunda instancia, ante OSIPTEL, sin perjuicio de acciones legales.'},
  {art:'Res. 040-2023-CD/OSIPTEL',text:'Los plazos de atención no podrán exceder 30 días hábiles en primera instancia. Vencido ese plazo, el usuario puede recurrir al TRASU.'},
];

export function NormModal({ isOpen, onClose, initialClaim }) {
  const [claim, setClaim] = useState(initialClaim || '');
  const [showRes, setShowRes] = useState(false);

  useEffect(() => {
    setClaim(initialClaim || '');
    setShowRes(false);
  }, [initialClaim, isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`${styles.normOverlay} ${isOpen ? styles.openFlex : ''}`}>
      <div className={styles.normBox}>
        <div className={styles.normHdr}>
          <div className={styles.normHdrL}>
            <div className={styles.normIco}>⚖️</div>
            <div><h3>Análisis Normativo OSIPTEL</h3><p>La IA analizará tu caso según normativa vigente</p></div>
          </div>
          <button className={styles.normX} onClick={onClose}>✕</button>
        </div>
        <div className={styles.normBody}>
          <textarea 
            className={styles.claimTa} 
            value={claim} 
            onChange={e => setClaim(e.target.value)} 
            placeholder="Describe tu caso aquí..." 
            style={{minHeight:90}} 
          />
          <button className={styles.btnOrange} onClick={() => setShowRes(true)}>
            ⚖️ Analizar con IA
          </button>
          
          {showRes && (
            <div className={styles.normResult}>
              <div className={styles.normResultTitle}>📋 Artículos aplicables a tu caso:</div>
              <div className={styles.normArts}>
                {NORM_ARTS.map(a => (
                  <div key={a.art} className={styles.normArt}>
                    <strong>{a.art}:</strong> {a.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

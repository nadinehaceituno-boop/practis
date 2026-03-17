import { useState } from 'react';
import styles from './AtencionCards.module.css';

// ── SVG Logos ──────────────────────────────────────────────────────────────
const LogoWhatsApp = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#25D366" />
    <path d="M17.5 14.5c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.1-.7-1.6-1-2.2-.2-.5-.5-.4-.7-.4H8c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.3 3.2c.2.2 2.2 3.4 5.3 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3z" fill="white" />
  </svg>
);
const LogoMovistar = () => (
  <svg width="20" height="14" viewBox="0 0 70 50">
    <path d="M8 42 Q13 8 23 20 Q33 32 43 20 Q53 8 62 42" stroke="#7AB800" strokeWidth="10" fill="none" strokeLinecap="round" />
  </svg>
);
const LogoEntel = () => (
  <svg width="22" height="22" viewBox="0 0 60 60">
    <rect width="60" height="60" rx="10" fill="#0033FF" />
    <text x="5" y="42" fontSize="34" fontWeight="900" fill="white" fontFamily="sans-serif">e</text>
    <path d="M43 16 Q54 30 43 44" stroke="#FF4500" strokeWidth="7" fill="none" strokeLinecap="round" />
  </svg>
);
const LogoBitel = () => (
  <svg width="22" height="22" viewBox="0 0 60 60">
    <rect width="60" height="60" rx="10" fill="#FFE000" />
    <text x="22" y="40" fontSize="18" fontWeight="800" fill="#009999" fontFamily="sans-serif">bitel</text>
    <path d="M10 10 Q10 25 18 25 Q10 25 10 40 M10 25 Q21 25 21 17 Q21 10 13 10Z" stroke="#009999" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LogoClaro = () => (
  <svg width="22" height="22" viewBox="0 0 60 60">
    <rect width="60" height="60" rx="10" fill="#DA291C" />
    <text x="4" y="38" fontSize="17" fontWeight="800" fill="white" fontFamily="sans-serif">Claro</text>
    <line x1="47" y1="13" x2="55" y2="7" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="51" y1="20" x2="58" y2="20" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="47" y1="27" x2="55" y2="33" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

const OPERATORS = [
  { value: 'Claro', Logo: LogoClaro, color: '#DA291C', bg: '#fff5f5', res: '82.6%', tiempo: '20s', satisf: '84%' },
  { value: 'Movistar', Logo: LogoMovistar, color: '#7AB800', bg: '#f5ffea', res: '86.3%', tiempo: '15s', satisf: '87%' },
  { value: 'Entel', Logo: LogoEntel, color: '#0033FF', bg: '#eef2ff', res: '89.8%', tiempo: '11s', satisf: '91%' },
  { value: 'Bitel', Logo: LogoBitel, color: '#009999', bg: '#e6fafa', res: '74.5%', tiempo: '26s', satisf: '76%' },
];

// ── FAQ Data ───────────────────────────────────────────────────────────────
const FAQ_CATEGORIES = [
  {
    id: 'indicadores',
    label: '📊 Indicadores',
    color: '#2563eb',
    items: [
      {
        q: '¿Qué son los indicadores de atención del panel?',
        a: 'Son métricas que muestran cómo funciona la atención al usuario en telecomunicaciones. Permiten medir calidad del servicio y brindan información pública sobre el desempeño de atención al cliente en el sector.',
      },
      {
        q: '¿Para qué sirven estos indicadores?',
        a: 'Sirven para evaluar la calidad de atención, fomentar mejoras en los servicios y dar a los ciudadanos información clara sobre cómo las empresas operadoras brindan su atención.',
      },
      {
        q: '¿Todos los indicadores tienen el mismo propósito?',
        a: 'No. Algunos miden la calidad directa de atención (satisfacción, resolución) y otros generan transparencia sobre el volumen y funcionamiento de los servicios de telecomunicaciones.',
      },
      {
        q: '¿Quién genera o mide estos indicadores?',
        a: 'Se basan en información pública, reportes de operadores y análisis de datos del sistema HazmeCasoPE, para brindar referencias generales sobre la atención en el sector.',
      },
    ],
  },
  {
    id: 'metricas',
    label: '📈 Métricas',
    color: '#059669',
    items: [
      {
        q: '¿Qué significa el indicador de "Satisfacción"?',
        a: 'Muestra el nivel de satisfacción de usuarios tras recibir atención. Un porcentaje alto indica que la mayoría considera que la atención recibida fue adecuada o positiva.',
      },
      {
        q: '¿Qué significa el indicador de "Resolución"?',
        a: 'Indica el porcentaje de casos resueltos efectivamente, sin necesidad de que el usuario repita el reclamo o vuelva a contactar al operador por el mismo motivo.',
      },
      {
        q: '¿Qué significa el "Tiempo promedio de atención"?',
        a: 'Muestra cuánto tarda en promedio un usuario en recibir respuesta o solución a su consulta. Un tiempo menor indica mayor eficiencia en la atención del canal.',
      },
      {
        q: '¿Qué significa el indicador de "Casos por mes"?',
        a: 'Muestra la cantidad de consultas, solicitudes o reclamos registrados mensualmente, permitiendo observar cómo evoluciona la demanda de atención en el tiempo.',
      },
      {
        q: '¿Los indicadores garantizan la calidad del servicio?',
        a: 'No necesariamente. Son referencias sobre tendencias de atención, pero no constituyen una evaluación oficial ni una garantía absoluta de la calidad del servicio de ninguna empresa.',
      },
    ],
  },
  {
    id: 'derechos',
    label: '⚖️ Derechos',
    color: '#d97706',
    items: [
      {
        q: '¿Cuánto tiempo tengo para presentar un reclamo?',
        a: 'Tienes hasta 20 días hábiles desde que ocurrió el problema para presentar tu reclamo ante el operador. Guarda siempre evidencia: capturas, contratos o comprobantes de pago.',
      },
      {
        q: '¿En cuánto tiempo debe responder mi operador?',
        a: 'El operador tiene un plazo máximo de 15 días hábiles para responder tu reclamo en primera instancia, según el Reglamento de Usuarios (Res. 087-2013-CD/OSIPTEL).',
      },
      {
        q: '¿Qué hago si no me satisface la respuesta del operador?',
        a: 'Puedes presentar un recurso de apelación ante OSIPTEL dentro de los 15 días hábiles siguientes a recibir la respuesta. OSIPTEL resolverá de forma imparcial e independiente.',
      },
      {
        q: '¿Cuál es la velocidad mínima garantizada de internet?',
        a: 'Según el Art. 6 de la Res. 123-2014-CD/OSIPTEL, el operador debe garantizar al menos el 40% de la velocidad contratada de forma continua. Si no lo cumple, tienes derecho a reclamar.',
      },
      {
        q: '¿Puedo cancelar mi servicio sin penalidad?',
        a: 'Sí. Si el servicio presenta fallas reiteradas o incumplimiento de condiciones contratadas, el Art. 45 del Reglamento de Usuarios te permite solicitar la cancelación sin penalidad económica.',
      },
    ],
  },
  {
    id: 'plataforma',
    label: '🖥️ Plataforma',
    color: '#7c3aed',
    items: [
      {
        q: '¿Por qué es importante que estos indicadores sean públicos?',
        a: 'La transparencia permite que los ciudadanos comprendan mejor cómo funciona la atención al cliente y cuenten con información objetiva al momento de interactuar con los servicios de telecomunicaciones.',
      },
      {
        q: '¿Con qué frecuencia se actualizan los datos del panel?',
        a: 'Los datos del panel se actualizan periódicamente a partir de reportes oficiales y fuentes públicas del sector telecomunicaciones en Perú.',
      },
      {
        q: '¿Cómo puedo comparar operadores en la plataforma?',
        a: 'Usa el selector de operadores en la sección de Llamada Asistida para ver las métricas de resolución, tiempo promedio y satisfacción de cada empresa.',
      },
      {
        q: '¿HazmeCasoPE reemplaza al proceso oficial de reclamos?',
        a: 'No. HazmeCasoPE es una herramienta de información y orientación ciudadana. El proceso oficial de reclamos se realiza directamente ante el operador o ante OSIPTEL.',
      },
      {
        q: '¿Es gratuito usar HazmeCasoPE?',
        a: 'Sí. HazmeCasoPE es una plataforma de acceso libre y gratuito, diseñada para orientar a los ciudadanos sobre sus derechos en el sector de telecomunicaciones en Perú.',
      },
    ],
  },
];

// ── FAQ Accordion ──────────────────────────────────────────────────────────
function FaqSection() {
  const [activeCat, setActiveCat] = useState('indicadores');
  const [openItem, setOpenItem] = useState(null);
  const [search, setSearch] = useState('');

  const currentCat = FAQ_CATEGORIES.find(c => c.id === activeCat);

  const filtered = search.trim()
    ? FAQ_CATEGORIES.flatMap(c =>
      c.items
        .filter(it =>
          it.q.toLowerCase().includes(search.toLowerCase()) ||
          it.a.toLowerCase().includes(search.toLowerCase())
        )
        .map(it => ({ ...it, _catColor: c.color, _catLabel: c.label }))
    )
    : currentCat.items.map(it => ({ ...it, _catColor: currentCat.color }));

  return (
    <div className={styles.faqSection}>

      {/* Header */}
      <div className={styles.faqHeader}>
        <div className={styles.faqHeadingRow}>
          <div className={styles.faqIconBox}>❓</div>
          <div>
            <div className={styles.faqTitle}>Preguntas Frecuentes</div>
            <div className={styles.faqSubtitle}>Indicadores de Atención · HazmeCasoPE</div>
          </div>
          <span className={styles.faqTotalBadge}>{FAQ_CATEGORIES.reduce((s, c) => s + c.items.length, 0)} preguntas</span>
        </div>

        {/* Search bar */}
        <div className={styles.faqSearchWrap}>
          <span className={styles.faqSearchIcon}>🔍</span>
          <input
            className={styles.faqSearch}
            placeholder="Buscar en todas las preguntas..."
            value={search}
            onChange={e => { setSearch(e.target.value); setOpenItem(null); }}
          />
          {search && (
            <button className={styles.faqSearchClear} onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      {!search && (
        <div className={styles.faqTabs}>
          {FAQ_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`${styles.faqTab} ${activeCat === cat.id ? styles.faqTabActive : ''}`}
              style={activeCat === cat.id ? { '--tab-color': cat.color } : {}}
              onClick={() => { setActiveCat(cat.id); setOpenItem(null); }}
            >
              {cat.label}
              <span className={styles.faqTabCount}>{cat.items.length}</span>
            </button>
          ))}
        </div>
      )}

      {/* Result count */}
      <div className={styles.faqMeta}>
        {search
          ? <span className={styles.faqCount}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para &ldquo;{search}&rdquo;
          </span>
          : <span className={styles.faqCount}>{currentCat.items.length} preguntas</span>
        }
      </div>

      {/* Accordion */}
      <div className={styles.faqList}>
        {filtered.length === 0 && (
          <div className={styles.faqEmpty}>
            <span className={styles.faqEmptyIcon}>🔎</span>
            <p>No se encontraron preguntas para <strong>&ldquo;{search}&rdquo;</strong></p>
            <button className={styles.faqEmptyReset} onClick={() => setSearch('')}>Limpiar búsqueda</button>
          </div>
        )}
        {filtered.map((item, idx) => {
          const key = search ? `search-${idx}` : `${activeCat}-${idx}`;
          const isOpen = openItem === key;
          return (
            <div key={key} className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}>
              <button
                className={styles.faqQ}
                onClick={() => setOpenItem(isOpen ? null : key)}
                style={{ '--item-color': item._catColor }}
              >
                <span className={styles.faqQNum}>{idx + 1}</span>
                <span className={styles.faqQText}>{item.q}</span>
                <span className={`${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ''}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
              </button>
              {isOpen && (
                <div className={styles.faqA}>
                  <p>{item.a}</p>
                  {search && item._catLabel && (
                    <span className={styles.faqACatTag} style={{ '--tag-color': item._catColor }}>
                      {item._catLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className={styles.faqFooter}>
        <span>¿No encontraste tu respuesta?</span>
        <a href="https://www.osiptel.gob.pe" target="_blank" rel="noreferrer" className={styles.faqFooterLink}>
          Consultar en OSIPTEL →
        </a>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AtencionCards({ onChatOpen, onNormOpen }) {
  const [callOp, setCallOp] = useState('');
  const [opDropOpen, setOpDropOpen] = useState(false);

  const WHATSAPP_NUMBER = '+1 555 179 2260'; // ← reemplaza con el número real de Norma

  const openWhatsApp = () => {
    const msg = encodeURIComponent('Hola Norma, necesito ayuda con un reclamo ante mi operador.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  const iniciarLlamada = () => {
    if (!callOp) { alert('Por favor selecciona un operador.'); return; }
    const PH_NUMBER = '19110014067807301';
    alert(`✅ Conectando llamada asistida con ${callOp}...\n\n📞 La IA analizará la llamada en tiempo real.`);
    window.location.href = `tel:${PH_NUMBER}`;
  };

  const selectedOp = OPERATORS.find(o => o.value === callOp);

  return (
    <div className={styles.panel}>

      {/* ── Header ── */}
      <div className={styles.sectionHeader}>
        <div className={styles.secHeading}>Canales de Atención</div>
        <p className={styles.secSub}>Elige tu canal preferido para resolver tu reclamo</p>
      </div>

      {/* ── Card WhatsApp ── */}
      <div className={styles.card}>
        <div className={`${styles.stripe} ${styles.stripeGreen}`} />
        <div className={styles.cardBody}>
          <div className={styles.cardTopRow}>
            <div className={`${styles.cardIcon} ${styles.ciGreen}`}><LogoWhatsApp size={22} /></div>
            <span className={`${styles.cardTag} ${styles.tagAi}`}>🤖 IA Avanzada</span>
          </div>
          <div className={styles.cardTitle}>Chat IA por WhatsApp</div>
          <div className={styles.cardDesc}>
            Chatea con <strong>Norma</strong> directamente en WhatsApp. Analiza tu caso,
            cita la normativa vigente y te guía paso a paso.
          </div>
          <div className={styles.featureList}>
            <span className={styles.feat}>✓ Respuesta inmediata</span>
            <span className={styles.feat}>✓ Sin espera</span>
            <span className={styles.feat}>✓ 24 / 7</span>
          </div>
          <button className={`${styles.btn} ${styles.btnGreen}`} onClick={openWhatsApp}>
            <LogoWhatsApp size={17} /> Abrir en WhatsApp
          </button>
        </div>
      </div>

      {/* ── Card Llamada ── */}
      <div className={styles.card}>
        <div className={`${styles.stripe} ${styles.stripeBlue}`} />
        <div className={styles.cardBody}>
          <div className={styles.cardTopRow}>
            <div className={`${styles.cardIcon} ${styles.ciBlue}`}>📞</div>
            <span className={`${styles.cardTag} ${styles.tagLive}`}>🔴 En vivo</span>
          </div>
          <div className={styles.cardTitle}>Llamada Asistida por IA</div>
          <div className={styles.cardDesc}>
            Conectamos tu llamada con análisis en tiempo real. Selecciona tu operador e iniciamos.
          </div>

          <div className={styles.opSelectWrap}>
            <button
              className={styles.opSelectBtn}
              onClick={() => setOpDropOpen(v => !v)}
              type="button"
            >
              {selectedOp
                ? <span className={styles.opSelectCurrent}><selectedOp.Logo />{selectedOp.value}</span>
                : <span className={styles.opSelectPlaceholder}>— Selecciona operador —</span>}
              <span className={`${styles.opArrow} ${opDropOpen ? styles.opArrowOpen : ''}`}>▾</span>
            </button>
            {opDropOpen && (
              <div className={styles.opDropdown}>
                {OPERATORS.map(op => (
                  <button
                    key={op.value}
                    className={`${styles.opDropItem} ${callOp === op.value ? styles.opDropItemActive : ''}`}
                    onClick={() => { setCallOp(op.value); setOpDropOpen(false); }}
                    type="button"
                  >
                    <op.Logo /><span>{op.value}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedOp && (
            <div className={styles.opStatBar}
              style={{ '--op-color': selectedOp.color, '--op-bg': selectedOp.bg }}>
              <div className={styles.opStatItem}>
                <span className={styles.opStatVal}>{selectedOp.res}</span>
                <span className={styles.opStatLbl}>Resolución</span>
              </div>
              <div className={styles.opStatDivider} />
              <div className={styles.opStatItem}>
                <span className={styles.opStatVal}>{selectedOp.tiempo}</span>
                <span className={styles.opStatLbl}>Tiempo prom.</span>
              </div>
              <div className={styles.opStatDivider} />
              <div className={styles.opStatItem}>
                <span className={styles.opStatVal}>{selectedOp.satisf}</span>
                <span className={styles.opStatLbl}>Satisfacción</span>
              </div>
            </div>
          )}

          <button className={`${styles.btn} ${styles.btnBlue}`} onClick={iniciarLlamada}>
            <span>📞</span> Iniciar Llamada
          </button>
        </div>
      </div>

      {/* ── FAQ ── */}
      <FaqSection />

    </div>
  );
}
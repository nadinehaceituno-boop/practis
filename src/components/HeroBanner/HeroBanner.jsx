import styles from './HeroBanner.module.css';

const kpis = [
  { val: '86.2%', lbl: 'Satisfacción', delta: '+2.1% vs mes anterior' },
  { val: '80.1%', lbl: 'Resolución bot', delta: '+4.3% vs mes anterior' },
  { val: '18 min', lbl: 'Tiempo promedio', delta: '−5 min de mejora' },
  { val: '12.4k', lbl: 'Casos / mes', delta: '+8.2% crecimiento' },
];


const chips = [
  '🛡️ Respaldado por OSIPTEL',
  '⏰ Disponible 24/7',
  '📍 +80 Locales en Perú',
];

export default function HeroBanner() {
  return (
    <div className={styles.hero}>
      <div className={styles.glow} />
      <div className={styles.inner}>
        <div className={styles.text}>
          <h2>
            Atención <em>Inteligente</em> para<br />
            Usuarios de Telecomunicaciones
          </h2>
          <p>
            Plataforma integrada con IA, datos en tiempo real y asistencia omnicanal
            para resolver tus reclamos con los operadores del Perú. Respaldada por OSIPTEL.
          </p>
          <div className={styles.chips}>
            {chips.map(c => <span key={c} className={styles.chip}>{c}</span>)}
          </div>
        </div>
        <div className={styles.kpis}>
          {kpis.map(k => (
            <div key={k.lbl} className={styles.kpiPill}>
              <div className={styles.val}>{k.val}</div>
              <div className={styles.lbl}>{k.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

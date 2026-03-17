import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './OsiptelDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

/* ─────────────────────────── DATOS ─────────────────────────── */
const COLORS = { Claro: '#e02611ff', Movistar: '#0caf1fff', Entel: '#0099BB', Bitel: '#c6d033ff' };
const OPS = ['Claro', 'Movistar', 'Entel', 'Bitel'];
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const RT = {
  Claro: [18, 22, 19, 31, 24, 15, 13],
  Movistar: [14, 16, 21, 18, 16, 12, 11],
  Entel: [11, 13, 12, 14, 13, 9, 8],
  Bitel: [25, 28, 33, 27, 30, 21, 19],
};

const RES = {
  Claro: { dig: 86.2, tel: 79.0 },
  Movistar: { dig: 91.1, tel: 81.4 },
  Entel: { dig: 94.8, tel: 84.8 },
  Bitel: { dig: 80.5, tel: 68.5 },
};

const KPIS = [

];

const HBARS3 = [
  {
    title: 'Desistieron de ser atendidos — límite 5%',
    lim: 5,
    data: { Entel: 11.91, Movistar: 4.05, Claro: 3.78, Bitel: 0.85 },
  },
  {
    title: 'Tiempo de espera mayor de 15 min — límite 5%',
    lim: 5,
    data: { Entel: 3.04, Claro: 2.45, Movistar: 1.83, Bitel: 0.85 },
  },
];

const HBARS4 = [
  {
    title: 'Llamadas cortadas por empresa — límite 15%',
    lim: 15,
    data: { Entel: 14.69, Claro: 5.85, Bitel: 4.12, Movistar: 3.91 },
  },
  {
    title: 'Espera más de 40s para asesor humano — límite 15%',
    lim: 15,
    data: { Bitel: 43.80, Entel: 18.52, Movistar: 18.07, Claro: 13.64 },
  },
  {
    title: 'Espera más de 20s para traslado con asesor — límite 20%',
    lim: 20,
    data: { Claro: 12.76, Movistar: 5.08, Entel: 3.04, Bitel: 0.52 },
  },
];

const CANAL_DATA = {
  labels: ['Presencial total', 'Atendidos', 'Tel. llamadas', 'Tel. exitosas'],
  values: [12.9, 12.3, 66.6, 52.5],
  colors: ['#B5D4F4', '#85B7EB', '#9FE1CB', '#5DCAA5'],
};

/* ─────────────────────────── CHART OPTIONS ─────────────────────────── */
const TOOLTIP_BASE = {
  backgroundColor: '#1e293b',
  titleColor: '#f1f5f9',
  bodyColor: '#cbd5e1',
  borderColor: 'rgba(255,255,255,.08)',
  borderWidth: 1,
  padding: 10,
  cornerRadius: 8,
  titleFont: { size: 11, weight: '500' },
  bodyFont: { size: 11 },
};

const AXIS_TICK = { font: { size: 10 }, color: '#9CA3AF' };

/* ─────────────────────────── SUBCOMPONENTES ─────────────────────────── */
function LiveDot() {
  return <span className="od-live-dot" />;
}

function HBarSection({ sections, animate }) {
  return (
    <div>
      {sections.map((sec) => {
        const maxT = Math.max(...Object.values(sec.data), sec.lim) * 1.1;
        const limPct = ((sec.lim / maxT) * 100).toFixed(1);
        return (
          <div key={sec.title} className="od-isec">
            <div className="od-isec-ttl">{sec.title}</div>
            {Object.entries(sec.data).map(([op, v]) => {
              const w = Math.min((v / maxT) * 100, 100);
              const over = v > sec.lim;
              const bg = over ? '#E24B4A' : COLORS[op];
              const tc = v < 5 ? '#111' : '#fff';
              return (
                <div key={op} className="od-hrow">
                  <div className="od-hlbl">{op}</div>
                  <div className="od-htrack">
                    <div
                      className="od-hfill"
                      style={{
                        width: animate ? `${w}%` : '0%',
                        background: bg,
                        color: tc,
                        transition: 'width .7s cubic-bezier(.4,0,.2,1)',
                      }}
                    >
                      {v}%
                    </div>
                    <div className="od-hlimit" style={{ left: `${limPct}%` }}>
                      <span className="od-hlimit-tag">Lím {sec.lim}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function ResMinis() {
  return (
    <div className="od-res-minis">
      {OPS.map((op) => {
        const avg = ((RES[op].dig + RES[op].tel) / 2).toFixed(1);
        return (
          <div key={op} className="od-rm" style={{ '--rc': COLORS[op] }}>
            <div className="od-rm-name">{op}</div>
            <div className="od-rm-pct">{avg}%</div>
            <div className="od-rm-detail">
              📱{RES[op].dig}% 📞{RES[op].tel}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── TAB: GRÁFICOS ─────────────────────────── */
function TabGraficos() {
  const [active, setActive] = useState({ Claro: true, Movistar: true, Entel: true, Bitel: true });

  const toggle = (op) => setActive((prev) => ({ ...prev, [op]: !prev[op] }));

  const c1datasets = OPS.filter((o) => active[o]).map((o) => ({
    label: o,
    data: RT[o],
    borderColor: COLORS[o],
    backgroundColor: COLORS[o] + '15',
    borderWidth: 2,
    pointBackgroundColor: COLORS[o],
    pointBorderColor: '#fff',
    pointBorderWidth: 1.5,
    pointRadius: 3,
    pointHoverRadius: 6,
    tension: 0.42,
    fill: false,
  }));

  const c2datasets = [
    {
      label: 'Digital (App/Chat)',
      data: OPS.map((o) => RES[o].dig),
      backgroundColor: 'rgba(26,109,181,.75)',
      borderRadius: 4,
      borderSkipped: false,
    },
    {
      label: 'Telefónico (IVR)',
      data: OPS.map((o) => RES[o].tel),
      backgroundColor: 'rgba(255,122,0,.72)',
      borderRadius: 4,
      borderSkipped: false,
    },
  ];

  return (
    <div className="od-tab-pane">
      {/* Filtros */}
      <div className="od-filters">
        <span className="od-filters-lbl">Operadora:</span>
        {OPS.map((op) => (
          <button
            key={op}
            className={`od-op-btn${active[op] ? ' on' : ''}`}
            style={{ '--oc': COLORS[op] }}
            onClick={() => toggle(op)}
          >
            <span className="od-op-pip" />
            {op}
          </button>
        ))}
      </div>

      {/* Gráfico 1 — Tiempo respuesta */}
      <div className="od-chart-card">
        <div className="od-ccard-hdr">
          <span className="od-ccard-ico">⏱</span>
          <div>
            <div className="od-ccard-ttl">Tiempo de respuesta del bot</div>
            <div className="od-ccard-sub">Segundos promedio por día · por operadora</div>
          </div>
          <span className="od-cpill blue">↓ Entel Dom 8s</span>
        </div>
        <div className="od-chart-wrap">
          <Line
            data={{ labels: DAYS, datasets: c1datasets }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: 'index', intersect: false },
              plugins: {
                legend: { display: false },
                tooltip: {
                  ...TOOLTIP_BASE,
                  callbacks: { label: (c) => ` ${c.dataset.label}: ${c.parsed.y}s` },
                },
              },
              scales: {
                x: { ticks: { ...AXIS_TICK }, grid: { display: false }, border: { display: false } },
                y: {
                  ticks: { ...AXIS_TICK, callback: (v) => `${v}s` },
                  grid: { color: 'rgba(0,0,0,.04)' },
                  border: { display: false },
                },
              },
            }}
          />
        </div>
        <hr className="od-hdiv" />
        <div className="od-leg">
          {OPS.map((op) => {
            const avg = (RT[op].reduce((a, b) => a + b, 0) / RT[op].length).toFixed(1);
            const mx = Math.max(...RT[op]);
            return (
              <span key={op} className={`od-leg-i${active[op] ? '' : ' dim'}`}>
                <span className="od-leg-sw" style={{ background: COLORS[op] }} />
                <b>{op}</b> · {avg}s · Pico{' '}
                <span style={{ color: '#A32D2D' }}>{mx}s</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Gráfico 2 — Resolución */}
      <div className="od-chart-card">
        <div className="od-ccard-hdr">
          <span className="od-ccard-ico">✅</span>
          <div>
            <div className="od-ccard-ttl">Tasa de resolución del bot</div>
            <div className="od-ccard-sub">Digital vs Telefónico · % casos resueltos</div>
          </div>
          <span className="od-cpill green">↑ Entel digital 94.8%</span>
        </div>
        <div className="od-chart-wrap">
          <Bar
            data={{ labels: OPS, datasets: c2datasets }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: 'index', intersect: false },
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  labels: { color: '#6B7280', font: { size: 10 }, usePointStyle: true, pointStyleWidth: 7, padding: 12 },
                },
                tooltip: {
                  ...TOOLTIP_BASE,
                  callbacks: { label: (c) => ` ${c.dataset.label}: ${c.parsed.y}%` },
                },
              },
              scales: {
                x: { ticks: { ...AXIS_TICK }, grid: { display: false }, border: { display: false } },
                y: {
                  min: 0, max: 100,
                  ticks: { ...AXIS_TICK, callback: (v) => `${v}%` },
                  grid: { color: 'rgba(0,0,0,.04)' },
                  border: { display: false },
                },
              },
            }}
          />
        </div>
        <ResMinis />
      </div>
    </div>
  );
}

/* ─────────────────────────── TAB: INDICADORES ─────────────────────────── */
function TabIndicadores() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  const statTotals = [
    { lbl: 'Desistieron', num: '548 mil', pct: '4.26%', warn: false },
    { lbl: 'Espera +15 min', num: '747 mil', pct: '5.13%', warn: false },
    { lbl: 'Llamadas cortadas', num: '1,117 mil', pct: '2.13%', warn: true },
    { lbl: 'Espera +40s asesor', num: '9,586 mil', pct: '6.27%', warn: true },
    { lbl: 'Espera +20s traslado', num: '4,176 mil', pct: '22.00%', warn: true },
  ];

  return (
    <div className="od-tab-pane">
      <div className="od-stat-row">
        {statTotals.map((s) => (
          <div key={s.lbl} className={`od-stat-c${s.warn ? ' warn' : ''}`}>
            <div className="od-stat-lbl">{s.lbl}</div>
            <div className={`od-stat-num${s.warn ? ' red' : ''}`}>{s.num}</div>
            <div className="od-stat-pct">{s.pct}</div>
          </div>
        ))}
      </div>

      <div className="od-chart-card">
        <div className="od-ccard-hdr">
          <span className="od-ccard-ico">📉</span>
          <div>
            <div className="od-ccard-ttl">Abandono y espera — canal presencial</div>
            <div className="od-ccard-sub">Rojo = supera límite regulatorio OSIPTEL</div>
          </div>
          <span className="od-cpill red">Entel supera límite</span>
        </div>
        <HBarSection sections={HBARS3} animate={animated} />
      </div>

      <div className="od-chart-card" style={{ marginTop: 12 }}>
        <div className="od-ccard-hdr">
          <span className="od-ccard-ico">📞</span>
          <div>
            <div className="od-ccard-ttl">Calidad — canal telefónico</div>
            <div className="od-ccard-sub">% llamadas con incidencias · límites OSIPTEL</div>
          </div>
          <span className="od-cpill amber">Bitel lidera espera +40s</span>
        </div>
        <HBarSection sections={HBARS4} animate={animated} />
      </div>
    </div>
  );
}

/* ─────────────────────────── TAB: CANALES ─────────────────────────── */
function TabCanales() {
  const presencial = [
    { lbl: 'Usuarios totales', val: '12,867,135', color: '#1A6DB5' },
    { lbl: 'Atendidos', val: '12,318,882', color: '#15803D' },
    { lbl: 'Espera <15 min', val: '13,811,668', color: null },
    { lbl: 'Tasa atención', val: '95.7%', color: '#15803D' },
  ];
  const telefonico = [
    { lbl: 'Llamadas totales', val: '66,603,327', color: '#1A6DB5' },
    { lbl: 'Exitosas', val: '52,478,443', color: '#15803D' },
    { lbl: 'Asesor <40s', val: '62,427,119', color: null },
    { lbl: 'Traslado <20s', val: '33,993,341', color: null },
    { lbl: 'Tasa éxito', val: '78.8%', color: '#15803D' },
  ];

  const canalDataset = {
    labels: CANAL_DATA.labels,
    datasets: [
      {
        data: CANAL_DATA.values,
        backgroundColor: CANAL_DATA.colors,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="od-tab-pane">
      <div className="od-canal-cards">
        <div className="od-cc">
          <div className="od-cc-hdr">
            <span className="od-cc-ico">🏢</span>
            <div>
              <div className="od-cc-ttl">Canal Presencial</div>
              <div className="od-cc-sub">Dic 2025</div>
            </div>
          </div>
          <div className="od-cc-stats">
            {presencial.map((s) => (
              <div key={s.lbl} className="od-cc-stat">
                <div className="od-cc-stat-lbl">{s.lbl}</div>
                <div className="od-cc-stat-val" style={s.color ? { color: s.color } : {}}>
                  {s.val}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="od-cc">
          <div className="od-cc-hdr">
            <span className="od-cc-ico">📞</span>
            <div>
              <div className="od-cc-ttl">Canal Telefónico</div>
            </div>
          </div>
          <div className="od-cc-stats">
            {telefonico.map((s) => (
              <div key={s.lbl} className="od-cc-stat">
                <div className="od-cc-stat-lbl">{s.lbl}</div>
                <div className="od-cc-stat-val" style={s.color ? { color: s.color } : {}}>
                  {s.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="od-chart-card">
        <div className="od-ccard-hdr">
          <span className="od-ccard-ico">📊</span>
          <div>
            <div className="od-ccard-ttl">Volumen por canal</div>
            <div className="od-ccard-sub">Millones de interacciones procesadas</div>
          </div>
        </div>
        <div style={{ position: 'relative', width: '100%', height: 160 }}>
          <Bar
            data={canalDataset}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: 'y',
              plugins: {
                legend: { display: false },
                tooltip: {
                  ...TOOLTIP_BASE,
                  callbacks: { label: (c) => ' ' + c.parsed.x.toFixed(1) + 'M' },
                },
              },
              scales: {
                x: {
                  ticks: { ...AXIS_TICK, callback: (v) => v + 'M' },
                  grid: { color: 'rgba(0,0,0,.04)' },
                  border: { display: false },
                },
                y: { ticks: { ...AXIS_TICK }, grid: { display: false }, border: { display: false } },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── TAB: POWER BI ─────────────────────────── */
function TabPowerBI() {
  return (
    <div className="od-tab-pane">
      <div className="od-pbi-wrap">
        <div className="od-pbi-hdr">
          <span className="od-pbi-dot" />
          Power BI · Dashboard interactivo OSIPTEL
        </div>
        <iframe
          src="https://app.powerbi.com/view?r=eyJrIjoiZDAyZTQ4NmMtYjE2NS00ZTMwLTkzYmItZTJhY2Y1NjU3ZmZiIiwidCI6ImI1MDA2NWZjLWVjYjgtNDMxZC05MGZlLTJlMzA4ZDBkNjM3OCIsImMiOjR9"
          width="100%"
          height="520"
          frameBorder="0"
          allowFullScreen
          title="Power BI OSIPTEL"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────── COMPONENTE PRINCIPAL ─────────────────────────── */
export default function OsiptelDashboard() {
  const [tab, setTab] = useState('graficos');

  const TABS = [
    { id: 'graficos', label: 'Gráficos' },
    { id: 'indicadores', label: 'Indicadores OSIPTEL' },
    { id: 'canales', label: 'Canales' },
    { id: 'powerbi', label: 'Power BI' },
  ];

  const RESUMEN = [
    { ico: '🏢', label: 'Presencial', big: '12.9M', sub: 'usuarios totales', barW: 95.7, barC: '#185FA5', barLbl: '95.7% atendidos' },
    { ico: '📞', label: 'Telefónico', big: '66.6M', sub: 'llamadas recibidas', barW: 78.8, barC: '#15803D', barLbl: '78.8% exitosas' },
    { ico: '🤖', label: 'Bot IA', big: '88.7%', sub: 'tasa resolución', barW: 88.7, barC: '#7C3AED', barLbl: '+4.3% vs mes ant.' },
  ];

  return (
    <div className="od-dash">
      {/* HEADER */}
      <header className="od-hdr">
        <div className="od-hdr-left">
          <span className="od-badge-osip">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="4" stroke="#185FA5" strokeWidth="1.2" />
              <path d="M5 3v4M3 5h4" stroke="#185FA5" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            OSIPTEL · Métricas bot
          </span>
          <div className="od-hdr-title">Dashboard — Calidad de atención</div>
          <div className="od-hdr-sub">Operadoras Perú · Diciembre 2025</div>
        </div>
      </header>

      {/* RESUMEN EJECUTIVO GRÁFICO */}
      <div className="od-resumen">
        {RESUMEN.map((r) => (
          <div key={r.label} className="od-res-card">
            <span className="od-res-icon">{r.ico}</span>
            <span className="od-res-label">{r.label}</span>
            <span className="od-res-big" style={{ color: r.barC }}>{r.big}</span>
            <span className="od-res-sub">{r.sub}</span>
            <div className="od-res-bar">
              <div className="od-res-bar-fill" style={{ width: `${r.barW}%`, background: r.barC }} />
            </div>
            <span className="od-res-sub" style={{ color: r.barC, fontWeight: 500 }}>{r.barLbl}</span>
          </div>
        ))}
      </div>



      {/* TABS */}
      <div className="od-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`od-tab-btn${tab === t.id ? ' on' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO PESTAÑAS */}
      {tab === 'graficos' && <TabGraficos />}
      {tab === 'indicadores' && <TabIndicadores />}
      {tab === 'canales' && <TabCanales />}
      {tab === 'powerbi' && <TabPowerBI />}

      {/* FOOTER */}
      <div className="od-ftr">
        Fuente: OSIPTEL — Operadoras Perú · Datos actualizados diciembre 2025 ·
        Bot simulado con base en estadísticas Q1 2025
      </div>
    </div>
  );
}
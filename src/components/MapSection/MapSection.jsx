import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MapSection.module.css';
import { OP_COLORS, OP_BG, SAT_COLOR, SAT_LABEL, SAT_CLASS, SEDES } from '../../data/sedes';

// ─── RATING HELPERS ───────────────────────────────────────────────────────────
const FACE_LEVELS = [
  { min: 0, max: 1.9, emoji: '😡', label: 'Muy malo', color: '#EF4444', bg: '#FEF2F2' },
  { min: 2, max: 2.9, emoji: '😕', label: 'Malo', color: '#F97316', bg: '#FFF7ED' },
  { min: 3, max: 3.4, emoji: '😐', label: 'Regular', color: '#EAB308', bg: '#FEFCE8' },
  { min: 3.5, max: 3.9, emoji: '🙂', label: 'Bueno', color: '#84CC16', bg: '#F7FEE7' },
  { min: 4, max: 4.4, emoji: '😊', label: 'Muy bueno', color: '#22C55E', bg: '#F0FDF4' },
  { min: 4.5, max: 5, emoji: '🤩', label: 'Excelente', color: '#10B981', bg: '#ECFDF5' },
];

const getFaceLevel = (rating) =>
  FACE_LEVELS.find(f => rating >= f.min && rating <= f.max) || FACE_LEVELS[2];

// Aforo simulado por hora (6am-10pm)
const AFORO_BASE = [5, 12, 30, 55, 70, 80, 65, 75, 90, 85, 60, 45, 35, 50, 70, 80, 75, 55, 30, 18, 10, 6];

const getAforoHora = (sedeId, hora) => {
  const seed = (sedeId * 7 + hora * 3) % 25;
  return Math.min(100, Math.max(5, AFORO_BASE[hora] + seed - 12));
};

const currentHour = new Date().getHours();
const getAforoActual = (sedeId) => {
  const h = currentHour - 8;
  if (h < 0 || h >= 22) return 5;
  return getAforoHora(sedeId, h);
};

const getAforoColor = (pct) => {
  if (pct < 40) return '#22C55E';
  if (pct < 70) return '#FBBF24';
  return '#EF4444';
};

const getAforoLabel = (pct) => {
  if (pct < 40) return 'Poca afluencia';
  if (pct < 70) return 'Afluencia media';
  return 'Alta afluencia';
};

// ─── ICON GENERATOR ───────────────────────────────────────────────────────────
const getMarkerIcon = (s, isActive = false) => {
  const face = getFaceLevel(s.rating);
  const oc = OP_COLORS[s.op];
  const size = isActive ? 52 : 40;
  const html = `
    <div style="position:relative;width:${size}px;height:${size + 8}px;">
      <div style="width:${size}px;height:${size}px;background:${oc};border:3px solid ${isActive ? '#FFD700' : 'white'};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${isActive ? 22 : 17}px;box-shadow:0 4px 14px rgba(0,0,0,.3),0 0 0 ${isActive ? '4px rgba(255,215,0,0.35)' : '0'};cursor:pointer;transition:all 0.3s;">${face.emoji}</div>
      <div style="position:absolute;bottom:0;right:-2px;width:${size * 0.38}px;height:${size * 0.38}px;background:${SAT_COLOR[s.sat]};border:2px solid white;border-radius:50%;"></div>
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [size, size + 8], iconAnchor: [size / 2, size + 8], popupAnchor: [0, -(size + 8)] });
};

// ─── MAP CONTROLLERS ──────────────────────────────────────────────────────────
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

// ─── AFORO CHART ──────────────────────────────────────────────────────────────
function AforoChart({ sedeId }) {
  const hours = Array.from({ length: 13 }, (_, i) => i + 10); // 6am a 9pm
  const bars = hours.map(h => ({ h, pct: getAforoHora(sedeId, h - 6) }));
  const now = currentHour;

  return (
    <div className={styles.afoChart}>
      <div className={styles.afoTitle}>
        <span>📊</span> Aforo estimado por hora
      </div>
      <div className={styles.afoBars}>
        {bars.map(({ h, pct }) => {
          const isNow = h === now;
          const color = getAforoColor(pct);
          const label = h < 12 ? `${h}am` : h === 12 ? '10pm' : `${h - 12}pm`;
          return (
            <div key={h} className={`${styles.afoBarWrap} ${isNow ? styles.afoNow : ''}`} title={`${label}: ${pct}%`}>
              <div className={styles.afoBarTrack}>
                <div
                  className={styles.afoBarFill}
                  style={{ height: `${pct}%`, background: color, opacity: isNow ? 1 : 0.65 }}
                />
              </div>
              <span className={styles.afoLabel}>{label}</span>
              {isNow && <div className={styles.afoNowDot} style={{ background: color }} />}
            </div>
          );
        })}
      </div>
      <div className={styles.afoFooter}>
        <div className={styles.afoNowInfo}>
          <span className={styles.afoNowBadge} style={{ background: getAforoColor(getAforoActual(sedeId)) }}>
            AHORA {getAforoActual(sedeId)}%
          </span>
          <span className={styles.afoNowLabel} style={{ color: getAforoColor(getAforoActual(sedeId)) }}>
            {getAforoLabel(getAforoActual(sedeId))}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── RATING DISPLAY ───────────────────────────────────────────────────────────
function RatingDisplay({ rating, totalVotes = 0, compact = false }) {
  const face = getFaceLevel(rating);
  const stars = Math.round(rating);

  if (compact) {
    return (
      <div className={styles.ratingCompact} style={{ background: face.bg, borderColor: face.color }}>
        <span className={styles.ratingFaceSmall}>{face.emoji}</span>
        <span className={styles.ratingNumSmall} style={{ color: face.color }}>{rating.toFixed(1)}</span>
      </div>
    );
  }

  return (
    <div className={styles.ratingDisplay} style={{ background: face.bg, borderColor: face.color + '55' }}>
      <div className={styles.ratingFaceBig}>{face.emoji}</div>
      <div className={styles.ratingInfo}>
        <div className={styles.ratingScore} style={{ color: face.color }}>{rating.toFixed(1)}</div>
        <div className={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} style={{ color: i <= stars ? '#FBBF24' : '#D1D5DB', fontSize: 16 }}>★</span>
          ))}
        </div>
        <div className={styles.ratingLabel} style={{ color: face.color }}>{face.label}</div>
        <div className={styles.ratingVotes}>{totalVotes} valoraciones</div>
      </div>
      <div className={styles.ratingBarGroup}>
        {[5, 4, 3, 2, 1].map(n => {
          const pct = totalVotes > 0 ? Math.round(20 + Math.random() * 20) : 0;
          return (
            <div key={n} className={styles.ratingBarRow}>
              <span className={styles.ratingBarNum}>{n}★</span>
              <div className={styles.ratingBarTrack}>
                <div
                  className={styles.ratingBarFill}
                  style={{ width: `${pct}%`, background: n >= 4 ? '#22C55E' : n === 3 ? '#FBBF24' : '#EF4444' }}
                />
              </div>
              <span className={styles.ratingBarPct}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── RATING FORM ──────────────────────────────────────────────────────────────
function RatingForm({ sede, onSubmit, onClose }) {
  const [atention, setAtention] = useState(0);
  const [time, setTime] = useState(0);
  const [hoverAt, setHoverAt] = useState(0);
  const [hoverTm, setHoverTm] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const faceAt = getFaceLevel(hoverAt || atention);
  const faceTm = getFaceLevel(hoverTm || time);

  const handleSubmit = () => {
    if (!atention || !time) return;
    const avg = ((atention + time) / 2).toFixed(1);
    onSubmit({ atention, time, comment, avg: parseFloat(avg) });
    setSubmitted(true);
    setTimeout(onClose, 2200);
  };

  if (submitted) {
    return (
      <div className={styles.rfSuccess}>
        <div className={styles.rfSuccessIcon}>🎉</div>
        <div className={styles.rfSuccessTitle}>¡Gracias por tu valoración!</div>
        <div className={styles.rfSuccessText}>Tu opinión ayuda a otros usuarios</div>
      </div>
    );
  }

  const StarRow = ({ label, value, hover, onChange, onHover, onLeave }) => {
    const face = getFaceLevel(hover || value);
    return (
      <div className={styles.rfCriterion}>
        <div className={styles.rfCritRow}>
          <span className={styles.rfCritLabel}>{label}</span>
          {(hover || value) > 0 && (
            <div className={styles.rfCritFace} style={{ background: face.bg, borderColor: face.color }}>
              <span>{face.emoji}</span>
              <span style={{ color: face.color, fontWeight: 700 }}>{face.label}</span>
            </div>
          )}
        </div>
        <div className={styles.rfStars}>
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              className={`${styles.rfStar} ${i <= (hover || value) ? styles.rfStarActive : ''}`}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={onLeave}
              onClick={() => onChange(i)}
              style={{ color: i <= (hover || value) ? '#FBBF24' : '#D1D5DB' }}
            >★</button>
          ))}
          <span className={styles.rfStarNum}>{value > 0 ? `${value}.0` : '—'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.ratingForm}>
      <div className={styles.rfHeader}>
        <div className={styles.rfTitle}>
          <span>📝</span> Califica tu visita
        </div>
        <div className={styles.rfSedeName}>{sede.name}</div>
        <button className={styles.rfClose} onClick={onClose}>✕</button>
      </div>

      <div className={styles.rfBody}>
        <StarRow
          label="🤝 Calidad de atención"
          value={atention} hover={hoverAt}
          onChange={setAtention}
          onHover={setHoverAt}
          onLeave={() => setHoverAt(0)}
        />
        <StarRow
          label="⏱ Tiempo de espera"
          value={time} hover={hoverTm}
          onChange={setTime}
          onHover={setHoverTm}
          onLeave={() => setHoverTm(0)}
        />

        {(atention > 0 && time > 0) && (
          <div className={styles.rfAvgPreview} style={{ background: getFaceLevel((atention + time) / 2).bg }}>
            <span className={styles.rfAvgFace}>{getFaceLevel((atention + time) / 2).emoji}</span>
            <div>
              <div className={styles.rfAvgLabel}>Calificación global</div>
              <div className={styles.rfAvgScore} style={{ color: getFaceLevel((atention + time) / 2).color }}>
                {((atention + time) / 2).toFixed(1)} — {getFaceLevel((atention + time) / 2).label}
              </div>
            </div>
          </div>
        )}

        <div className={styles.rfCommentWrap}>
          <label className={styles.rfCommentLabel}>💬 Comentario (opcional)</label>
          <textarea
            className={styles.rfComment}
            placeholder="Cuéntanos tu experiencia..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            maxLength={200}
          />
          <span className={styles.rfCommentCount}>{comment.length}/200</span>
        </div>

        <button
          className={`${styles.rfSubmit} ${(!atention || !time) ? styles.rfSubmitDisabled : ''}`}
          onClick={handleSubmit}
          disabled={!atention || !time}
        >
          <span>⭐</span> Enviar valoración
        </button>
      </div>
    </div>
  );
}

// ─── DYNAMIC STATS ────────────────────────────────────────────────────────────
function DynamicStats({ filteredSedes }) {
  const stats = useMemo(() => {
    const total = SEDES.length;
    const filtered = filteredSedes.length;
    const avgRating = (SEDES.reduce((acc, s) => acc + s.rating, 0) / total).toFixed(1);
    const satLow = SEDES.filter(s => s.sat === 'low').length;
    const satMid = SEDES.filter(s => s.sat === 'medium').length;
    const satHigh = SEDES.filter(s => s.sat === 'high').length;
    return { total, filtered, avgRating, satLow, satMid, satHigh };
  }, [filteredSedes]);

  const face = getFaceLevel(parseFloat(stats.avgRating));

  return (
    <div className={styles.dynamicStats}>
      <div className={styles.statGlobe}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.filtered}</span>
          <span className={styles.statLabel}>Mostrando</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Totales</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>{face.emoji}</span>
          <span className={styles.statLabel} style={{ color: face.color }}>{stats.avgRating} avg</span>
        </div>
      </div>
      <div className={styles.statBars}>
        <div className={styles.statBar} style={{ width: `${(stats.satLow / stats.total) * 100}%`, background: '#22C55E' }} />
        <div className={styles.statBar} style={{ width: `${(stats.satMid / stats.total) * 100}%`, background: '#FBBF24' }} />
        <div className={styles.statBar} style={{ width: `${(stats.satHigh / stats.total) * 100}%`, background: '#EF4444' }} />
      </div>
    </div>
  );
}

// ─── ADVANCED SEARCH ──────────────────────────────────────────────────────────
function AdvancedSearch({ search, setSearch, deptFilter, setDeptFilter, opFilter, setOpFilter }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const departamentos = useMemo(() => {
    const depts = [...new Set(SEDES.map(s => s.dept))].sort();
    return ['todos', ...depts];
  }, []);

  return (
    <div className={`${styles.advancedSearch} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.searchMainRow}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nombre, dirección o ciudad..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
          )}
        </div>
        <button
          className={`${styles.expandBtn} ${isExpanded ? styles.active : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>⚙️</span><span>Filtros</span>
        </button>
      </div>

      <div className={styles.searchExpandedContent}>
        <div className={styles.filterGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <span>📱 Operador</span>
            </label>
            <div className={styles.opFilterGrid}>
              {['todos', 'claro', 'movistar', 'entel', 'bitel'].map(op => (
                <button
                  key={op}
                  className={`${styles.opFilterBtn} ${opFilter === op ? styles.active : ''}`}
                  onClick={() => setOpFilter(op)}
                  style={opFilter === op ? { borderColor: op !== 'todos' ? OP_COLORS[op] : 'var(--brand-blue)' } : {}}
                >
                  <span className={styles.opFilterDot} style={{ background: op !== 'todos' ? OP_COLORS[op] : 'var(--brand-blue)', opacity: opFilter === op ? 1 : 0.5 }} />
                  {op === 'todos' ? 'Todos' : op.charAt(0).toUpperCase() + op.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}><span>📍 Departamento</span></label>
            <select className={styles.deptSelect} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              {departamentos.map(d => (
                <option key={d} value={d}>{d === 'todos' ? '📍 Todos los departamentos' : `📍 ${d}`}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}><span>⚡ Acciones rápidas</span></label>
            <div className={styles.quickActions}>
              <button className={styles.quickAction} onClick={() => { setOpFilter('todos'); setDeptFilter('todos'); setSearch(''); }}>
                🔄 Limpiar
              </button>
              <button className={styles.quickAction} onClick={() => setDeptFilter('lima')}>
                🏛️ Lima
              </button>
            </div>
          </div>
        </div>

        {(opFilter !== 'todos' || deptFilter !== 'todos' || search) && (
          <div className={styles.activeFilters}>
            <span className={styles.activeFiltersLabel}>Filtros activos:</span>
            {opFilter !== 'todos' && (
              <span className={styles.activeFilterTag} style={{ background: OP_BG[opFilter], color: OP_COLORS[opFilter] }}>
                {opFilter} <button onClick={() => setOpFilter('todos')}>✕</button>
              </span>
            )}
            {deptFilter !== 'todos' && (
              <span className={styles.activeFilterTag}>{deptFilter} <button onClick={() => setDeptFilter('todos')}>✕</button></span>
            )}
            {search && (
              <span className={styles.activeFilterTag}>"{search}" <button onClick={() => setSearch('')}>✕</button></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAP VIEW ─────────────────────────────────────────────────────────────────
function EnhancedMapView({ filtered, activeSede, handleSelect }) {
  const [mapStyle, setMapStyle] = useState('voyager');

  const mapTiles = {
    voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  };

  return (
    <div className={styles.mapWrap}>
      <div className={styles.mapControlsOverlay}>
        {[['voyager', '🗺️'], ['dark', '🌙'], ['light', '☀️']].map(([k, ico]) => (
          <button key={k} className={`${styles.mapStyleBtn} ${mapStyle === k ? styles.active : ''}`} onClick={() => setMapStyle(k)}>{ico}</button>
        ))}
      </div>

      <MapContainer center={[-12.05, -77.04]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; CARTO' url={mapTiles[mapStyle]} />
        {activeSede && <ChangeView center={[activeSede.lat, activeSede.lng]} zoom={16} />}
        {filtered.map(s => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={getMarkerIcon(s, activeSede?.id === s.id)} eventHandlers={{ click: () => handleSelect(s) }}>
            <Popup closeButton={false}>
              <div style={{ minWidth: 260, padding: 6 }}>
                <div className={styles.cpHeader}>
                  <div className={styles.cpIcon} style={{ background: OP_BG[s.op], color: OP_COLORS[s.op] }}>📡</div>
                  <div>
                    <div className={styles.cpName}>{s.name}</div>
                    <div className={styles.cpOp} style={{ color: OP_COLORS[s.op] }}>{s.op.toUpperCase()}</div>
                  </div>
                  <RatingDisplay rating={s.rating} compact />
                </div>
                <div className={styles.cpInfo}>
                  <div className={styles.cpRow}><span>📍</span> {s.addr}</div>
                  <div className={styles.cpRow}><span>🕐</span> {s.hours}</div>
                </div>
                <div className={styles.cpAforo}>
                  <div className={styles.cpAforoBar}>
                    <div style={{ width: `${getAforoActual(s.id)}%`, background: getAforoColor(getAforoActual(s.id)), height: '100%', borderRadius: 4 }} />
                  </div>
                  <span style={{ color: getAforoColor(getAforoActual(s.id)), fontWeight: 700, fontSize: 12 }}>
                    {getAforoActual(s.id)}% ahora · {getAforoLabel(getAforoActual(s.id))}
                  </span>
                </div>
                <div className={styles.cpActions}>
                  <button className={styles.cpCallBtn} onClick={() => window.location.href = `tel:${s.phone.replace(/\s/g, '')}`}>📞 Llamar</button>
                  <button className={styles.cpRouteBtn} onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`, '_blank')}>🗺️ Ruta</button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

// ─── SEDE CARD ────────────────────────────────────────────────────────────────
function SedeCard({ s, isSelected, onSelect, onRate }) {
  const aforo = getAforoActual(s.id);

  return (
    <div
      id={`sc-${s.id}`}
      className={`${styles.sedeCard} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(s)}
    >
      <div className={styles.scTop}>
        <div className={styles.scIcon} style={{ background: OP_BG[s.op] }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={OP_COLORS[s.op]} strokeWidth="2.2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <div className={styles.scInfo}>
          <div className={styles.scName}>{s.name}</div>
          <div className={styles.scAddr}>{s.addr}</div>
        </div>
        <div className={styles.scOpBadge} style={{ color: OP_COLORS[s.op], background: OP_BG[s.op] }}>{s.op.toUpperCase()}</div>
      </div>

      {/* Rating prominente */}
      <div className={styles.scRatingRow}>
        <RatingDisplay rating={s.rating} totalVotes={s.votes || 48} />
      </div>

      {/* Aforo barra */}
      <div className={styles.scAforoRow}>
        <div className={styles.scAforoHeader}>
          <span className={styles.scAforoLabel}>📊 Aforo ahora</span>
          <span className={styles.scAforoPct} style={{ color: getAforoColor(aforo) }}>{aforo}% · {getAforoLabel(aforo)}</span>
        </div>
        <div className={styles.scAforoTrack}>
          <div
            className={styles.scAforoFill}
            style={{ width: `${aforo}%`, background: getAforoColor(aforo) }}
          />
        </div>
      </div>

      <div className={styles.scTags}>
        <span className={`${styles.scTag} ${SAT_CLASS[s.sat]}`}>{SAT_LABEL[s.sat]}</span>
        <span className={`${styles.scTag} ${styles.scTagWait}`}>⏱ {s.wait}</span>
      </div>

      <div className={styles.scActions}>
        <button className={`${styles.scBtn} ${styles.scbCall}`} onClick={e => { e.stopPropagation(); window.location.href = `tel:${s.phone.replace(/\s/g, '')}`; }}>
          📞 Llamar
        </button>
        <button className={`${styles.scBtn} ${styles.scbRoute}`} onClick={e => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`, '_blank'); }}>
          🗺️ Ruta
        </button>
        <button className={`${styles.scBtn} ${styles.scbRate}`} onClick={e => { e.stopPropagation(); onRate(s); }}>
          ⭐ Calificar
        </button>
      </div>
    </div>
  );
}

// ─── SEDE DETAIL PANEL ────────────────────────────────────────────────────────
function SedeDetailPanel({ sede, onRate, onClose }) {
  const aforo = getAforoActual(sede.id);
  const face = getFaceLevel(sede.rating);

  return (
    <div className={styles.sedeDetail}>
      <button className={styles.sdBackBtn} onClick={onClose}>
        <span>←</span> Volver a la lista
      </button>
      <div className={styles.sdHeader}>
        <div className={styles.sdIcon}>📡</div>
        <div>
          <div className={styles.sdName}>{sede.name}</div>
          <div className={styles.sdOp}>{sede.op.toUpperCase()} · {sede.dept.toUpperCase()}</div>
        </div>
      </div>

      {/* Calificación grande y visible */}
      <div className={styles.sdRatingBlock} style={{ background: face.bg, borderColor: face.color + '66' }}>
        <div className={styles.sdRatingFace}>{face.emoji}</div>
        <div className={styles.sdRatingDetails}>
          <div className={styles.sdRatingScore} style={{ color: face.color }}>{sede.rating.toFixed(1)}</div>
          <div className={styles.sdRatingStars}>
            {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ color: i <= Math.round(sede.rating) ? '#FBBF24' : '#D1D5DB' }}>★</span>)}
          </div>
          <div className={styles.sdRatingLabel} style={{ color: face.color }}>{face.label}</div>
        </div>
        <button className={styles.sdRateBtn} onClick={() => onRate(sede)}>
          <span>✏️</span> Calificar
        </button>
      </div>

      {/* Aforo actual */}
      <div className={styles.sdAforoBlock}>
        <div className={styles.sdAforoHeader}>
          <span>🟢 Aforo actual</span>
          <span className={styles.sdAforoPct} style={{ color: getAforoColor(aforo) }}>{aforo}%</span>
        </div>
        <div className={styles.sdAforoTrack}>
          <div style={{ width: `${aforo}%`, background: getAforoColor(aforo), height: '100%', borderRadius: 6, transition: 'width .5s' }} />
        </div>
        <div className={styles.sdAforoStatus} style={{ color: getAforoColor(aforo) }}>{getAforoLabel(aforo)}</div>
      </div>

      {/* Gráfica aforo por hora */}
      <AforoChart sedeId={sede.id} />

      <div className={styles.sdPhoneBig}>
        <span>📞</span>{sede.phone}
      </div>

      <div className={styles.sdInfoRows}>
        <div className={styles.sdRow}><span className={styles.sdRowIcon}>📍</span><span><strong>Dirección:</strong> {sede.addr}</span></div>
        <div className={styles.sdRow}><span className={styles.sdRowIcon}>🕐</span><span><strong>Horario:</strong> {sede.hours}</span></div>
        <div className={styles.sdRow}><span className={styles.sdRowIcon}>⏱</span><span><strong>Espera:</strong> {sede.wait} · <span style={{ color: SAT_COLOR[sede.sat], fontWeight: 600 }}>{SAT_LABEL[sede.sat]}</span></span></div>
      </div>

      <div className={styles.sdActionRow}>
        <button className={`${styles.sdAct} ${styles.sdActCall}`} onClick={() => window.location.href = `tel:${sede.phone.replace(/\s/g, '')}`}>
          Llamar ahora
        </button>
        <button className={`${styles.sdAct} ${styles.sdActRoute}`} onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${sede.lat},${sede.lng}`, '_blank')}>
          Cómo llegar
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function MapSection({ onReserve }) {
  const [opFilter, setOpFilter] = useState('todos');
  const [deptFilter, setDeptFilter] = useState('todos');
  const [search, setSearch] = useState('');
  const [activeSede, setActiveSede] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null);
  const [localRatings, setLocalRatings] = useState({});

  const filtered = useMemo(() => {
    return SEDES.filter(s => {
      const matchOp = opFilter === 'todos' || s.op === opFilter;
      const matchDept = deptFilter === 'todos' || s.dept.toLowerCase() === deptFilter.toLowerCase();
      const matchSearch = !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.addr.toLowerCase().includes(search.toLowerCase()) ||
        s.dept.toLowerCase().includes(search.toLowerCase());
      return matchOp && matchDept && matchSearch;
    });
  }, [opFilter, deptFilter, search]);

  // Merge local ratings into sedes
  const enrichedFiltered = useMemo(() =>
    filtered.map(s => localRatings[s.id] ? { ...s, rating: localRatings[s.id].avg, votes: (s.votes || 48) + 1 } : s),
    [filtered, localRatings]
  );

  const handleSelect = (s) => {
    setActiveSede(s);
    setTimeout(() => {
      document.getElementById(`sc-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
  };

  const handleRatingSubmit = (sedeId, data) => {
    setLocalRatings(prev => ({ ...prev, [sedeId]: data }));
    // Update active sede if it's the rated one
    if (activeSede?.id === sedeId) {
      setActiveSede(prev => ({ ...prev, rating: data.avg }));
    }
    setRatingTarget(null);
  };

  const goMyLocation = () => {
    if (!navigator.geolocation) { alert('Tu navegador no soporta geolocalización.'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => handleSelect({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert('No se pudo obtener tu ubicación.')
    );
  };

  const enrichedActive = activeSede
    ? enrichedFiltered.find(s => s.id === activeSede.id) || activeSede
    : null;

  return (
    <div className={styles.mapSection}>
      {/* Rating Modal */}
      {ratingTarget && (
        <div className={styles.ratingOverlay} onClick={e => e.target === e.currentTarget && setRatingTarget(null)}>
          <RatingForm
            sede={ratingTarget}
            onSubmit={(data) => handleRatingSubmit(ratingTarget.id, data)}
            onClose={() => setRatingTarget(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className={styles.mapHdr}>
        <div className={styles.mapHdrContent}>
          <div className={styles.mapHdrLeft}>
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              Locales de Atención · Todo el Perú
            </h3>
            <p>Encuentra el centro de atención más cercano, verifica aforo en tiempo real y califica tu experiencia</p>
          </div>
          <DynamicStats filteredSedes={filtered} />
        </div>
      </div>

      <AdvancedSearch
        search={search} setSearch={setSearch}
        deptFilter={deptFilter} setDeptFilter={setDeptFilter}
        opFilter={opFilter} setOpFilter={setOpFilter}
      />

      {/* Locator Button Only */}
      <div className={styles.viewModeToggle} style={{ justifyContent: 'flex-end', padding: '8px 24px' }}>
        <button className={styles.btnMyloc} onClick={goMyLocation}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
            <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
          Mi ubicación
        </button>
      </div>

      <div className={styles.mapBody}>
        {/* Sidebar */}
        <div className={styles.mapSidebar}>
          {enrichedActive ? (
            <SedeDetailPanel
              sede={enrichedActive}
              onRate={setRatingTarget}
              onClose={() => setActiveSede(null)}
            />
          ) : (
            <>
              <div className={styles.sidebarHdr}>
                <span className={styles.sidebarHdrTitle}>📋 Centros disponibles</span>
                <span className={styles.resultCount}>
                  {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
                </span>
              </div>

              <div className={styles.sedeScroll}>
                {filtered.length === 0 ? (
                  <div className={styles.noResults}>
                    <span className={styles.noResultsIcon}>😕</span>
                    <span className={styles.noResultsText}>No se encontraron sedes</span>
                    <span className={styles.noResultsHint}>Intenta con otros filtros</span>
                  </div>
                ) : (
                  enrichedFiltered.map(s => (
                    <SedeCard
                      key={s.id}
                      s={s}
                      isSelected={activeSede?.id === s.id}
                      onSelect={handleSelect}
                      onRate={setRatingTarget}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Full Map View */}
        <EnhancedMapView
          filtered={enrichedFiltered}
          activeSede={enrichedActive}
          handleSelect={handleSelect}
        />
      </div>

      {/* Legend */}
      <div className={styles.satLegend}>
        <span className={styles.satLegendLabel}>SATURACIÓN:</span>
        <div className={styles.satItem}><div className={styles.satDot} style={{ background: '#22C55E' }} /> Baja espera (&lt;20 min)</div>
        <div className={styles.satItem}><div className={styles.satDot} style={{ background: '#FBBF24' }} /> Espera media (20–60 min)</div>
        <div className={styles.satItem}><div className={styles.satDot} style={{ background: '#EF4444' }} /> Muy lleno (&gt;60 min)</div>
        <div className={styles.satLegendFaces}>
          {FACE_LEVELS.map(f => (
            <span key={f.label} title={`${f.label}: ${f.min}–${f.max}`}>{f.emoji}</span>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--gray-text)' }}>
          ⟳ Actualizado {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
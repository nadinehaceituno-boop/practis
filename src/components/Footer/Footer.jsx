// Footer.jsx — HazMeCasoPE (Rediseño 2026)
import { useState } from "react";

const CATALOG = {
  osiptel: {
    fonoayuda: "1844",
    correo: "usuarios@osiptel.gob.pe",
    links: {
      turoReclamos: "https://www.osiptel.gob.pe/media/t2adonsc/resol99-2022-cd-tuo-reglamento-reclamos.pdf",
      resolucionTuo: "https://www.osiptel.gob.pe/n-099-2022-cd-osiptel/",
      guiaReclamos: "https://www.osiptel.gob.pe/guiareclamos/",
      guiaPasos: "https://www.osiptel.gob.pe/guiapasosreclamos/",
      formularios: "https://formulariodereclamo.osiptel.gob.pe/",
      guiaFormulario: "https://www.osiptel.gob.pe/guiaformularioreclamos/",
      teAyudamos: "https://teayudamos.osiptel.gob.pe/",
      quienesPueden: "https://www.osiptel.gob.pe/portal-del-usuario/lo-que-debes-saber/guia-de-informacion-y-orientacion/quienes-pueden-reclamar/",
      requisitos: "https://www.osiptel.gob.pe/portal-del-usuario/lo-que-debes-saber/guia-de-informacion-y-orientacion/requisitos/",
      formasPresentacion: "https://www.osiptel.gob.pe/portal-del-usuario/lo-que-debes-saber/guia-de-informacion-y-orientacion/formas-de-presentacion/",
      motivosPlazos: "https://www.osiptel.gob.pe/portal-del-usuario/lo-que-debes-saber/guia-de-informacion-y-orientacion/motivos-plazos-y-proc-para-reclamar/",
      silencioAdmin: "https://www.osiptel.gob.pe/portal-del-usuario/lo-que-debes-saber/guia-de-informacion-y-orientacion/silencio-administrativo-positivo/",
      quejas: "https://www.osiptel.gob.pe/portal-del-usuario/lo-que-debes-saber/guia-de-informacion-y-orientacion/cuando-presentar-una-queja/",
      denuncias: "https://www.osiptel.gob.pe/portal-del-usuario/lo-que-debes-saber/guia-de-informacion-y-orientacion/denuncias/",
      expediente: "https://www.osiptel.gob.pe/portal-del-usuario/lo-que-debes-saber/guia-de-informacion-y-orientacion/expediente-de-reclamo/",
      faqQueja: "https://www.osiptel.gob.pe/portal-del-usuario/preguntas-frecuentes/en-que-casos-el-usuario-puede-presentar-una-queja",
      faqDenuncia: "https://www.osiptel.gob.pe/portal-del-usuario/preguntas-frecuentes/en-que-casos-el-usuario-puede-presentar-una-denuncia",
      // Checas OSIPTEL
      checaMovil: "https://checa.osiptel.gob.pe/",
      checaCalidad: "https://www.osiptel.gob.pe/portal-del-usuario/herramientas/checa-la-calidad-de-tu-servicio/",
      checaCobertura: "https://www.osiptel.gob.pe/portal-del-usuario/herramientas/checa-la-cobertura/",
      checaNumero: "https://www.osiptel.gob.pe/portal-del-usuario/herramientas/checa-el-numero/",
      checaTarifas: "https://tarifas.osiptel.gob.pe/",
      checaVelocidad: "https://www.osiptel.gob.pe/portal-del-usuario/herramientas/checa-la-velocidad-de-tu-internet/",
      checaIMEI: "https://www.osiptel.gob.pe/portal-del-usuario/herramientas/checa-el-imei-de-tu-equipo/",
    },
  },
  operadores: {
    claro: {
      nombre: "Claro Perú",
      tipo: ["Móvil", "Fijo", "Internet"],
      color: "#e53935",
      reclamo: "https://www.claro.com.pe/atencion-de-reclamos/haz-tu-reclamo/",
      libro: "https://libroreclamaciones.claro.com.pe/WReclamaciones/",
      consulta: "https://www.claro.com.pe/consulta-de-reclamos/",
      info: "https://www.claro.com.pe/atencion-de-reclamos/",
    },
    movistar: {
      nombre: "Movistar Perú",
      tipo: ["Móvil", "Fijo", "Internet", "TV"],
      color: "#009ae0",
      reclamo: "https://www.movistar.com.pe/soporte-reclamos-disconformidad/registro-de-reclamos",
      portal: "https://www.movistar.com.pe/soporte-reclamos-disconformidad",
      libro: "https://www.movistar.com.pe/libro-de-reclamaciones",
      info: "https://www.movistar.com.pe/atencion-al-cliente/reclamos/averias",
    },
    entel: {
      nombre: "Entel Perú",
      tipo: ["Móvil", "Internet"],
      color: "#00a6a0",
      reclamo: "https://miperfil.entel.pe/PE_Web_Reclamaciones_EU/Reclamo?tipo=natural",
      formularios: "https://www.entel.pe/ayuda/reclamos/formularios-de-reclamos",
      libro: "https://www.entel.pe/ayuda/flujo-libro-de-reclamaciones",
    },
    bitel: {
      nombre: "Bitel Perú",
      tipo: ["Móvil", "Internet"],
      color: "#6ab04c",
      reclamo: "https://bitel.com.pe/page/Project/MyBitel/Home/Claim/list",
      libro: "https://bitel.com.pe/libro-reclamaciones?categoryId=101866943",
      info: "https://bitel.com.pe/informacion-a-abonados-y-usuarios/-deseas-reclamar-o-hacer-seguimiento-a-tu-reclamo-/-como-reclamar-requisitos-y-procedimiento-de-reclamo.?categoryId=1820185",
    },
    win: {
      nombre: "WIN Internet",
      tipo: ["Internet", "TV", "Telefonía"],
      color: "#f5a623",
      libro: "https://win.pe/libro-de-reclamaciones",
      contacto: "https://win.pe/contacto",
    },
    mifibra: {
      nombre: "MiFibra",
      tipo: ["Internet"],
      color: "#7b4fff",
      reclamo: "https://www.mifibra.pe/solicitud-de-reclamos/",
      consulta: "https://www.mifibra.pe/consulta-de-reclamos/",
      libro: "https://www.mifibra.pe/libro-de-reclamaciones/",
    },
    wow: {
      nombre: "WOW Perú",
      tipo: ["Internet", "Móvil"],
      color: "#ff4081",
      reclamo: "https://wowperu.pe/reclamos-queja-apelacion/",
      libro: "https://wowperu.pe/libro-reclamaciones/",
      formularios: "https://wowperu.pe/descarga-formularios-reclamos/",
      seguimiento: "https://wowperu.pe/seguimiento-de-reclamos/consulta/",
    },
    fiberlux: {
      nombre: "Fiberlux",
      tipo: ["Internet", "Empresas"],
      color: "#ff6b00",
      reclamo: "https://fiberlux.pe/reclamos/",
      libro: "https://fiberlux.pe/libro-de-reclamaciones/",
      libroNegocios: "https://negocios.fiberlux.pe/libro-de-reclamaciones/",
    },
  },
};

// ─── Estilos globales inyectados ────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    .footer-link {
      display: block;
      color: #8896a8;
      font-size: 13px;
      line-height: 1.85;
      text-decoration: none;
      transition: color 0.18s, transform 0.18s;
      font-family: 'DM Sans', sans-serif;
    }
    .footer-link:hover {
      color: #FF7A00;
      transform: translateX(3px);
    }
    .col-title {
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      margin-bottom: 16px;
      margin-top: 0;
      font-family: 'Barlow Condensed', sans-serif;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .col-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, rgba(255,122,0,0.4), transparent);
    }
    .op-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      text-align: left;
      border-radius: 6px;
      transition: background 0.15s;
    }
    .op-button:hover {
      background: rgba(255,255,255,0.04);
    }
    .badge {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 4px;
      font-size: 10px;
      color: #8896a8;
      padding: 3px 10px;
      letter-spacing: 0.06em;
      font-weight: 600;
      font-family: 'Barlow Condensed', sans-serif;
      transition: border-color 0.18s, color 0.18s;
    }
    .badge:hover {
      border-color: rgba(255,122,0,0.4);
      color: #FF7A00;
    }
    .checa-link {
      display: flex;
      align-items: center;
      gap: 7px;
      color: #8896a8;
      font-size: 12.5px;
      line-height: 1.7;
      text-decoration: none;
      font-family: 'DM Sans', sans-serif;
      padding: 3px 6px;
      border-radius: 5px;
      transition: background 0.15s, color 0.15s;
    }
    .checa-link:hover {
      background: rgba(27,168,201,0.1);
      color: #1BA8C9;
    }
    .checa-icon {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      flex-shrink: 0;
    }
    .footer-section-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 10px;
      padding: 20px;
    }
    .legal-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: #6b7a8d;
      font-size: 12px;
      text-decoration: none;
      font-family: 'DM Sans', sans-serif;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    .legal-link:hover {
      color: #FF7A00;
      border-color: rgba(255,122,0,0.3);
      background: rgba(255,122,0,0.05);
    }
  `}</style>
);

// ─── Logo ────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <svg viewBox="0 0 100 100" style={{ width: 38, height: 38, flexShrink: 0 }}>
        <circle cx="50" cy="18" r="7" fill="#FF7A00" />
        <path d="M20 30 Q50 5 80 30" stroke="#F2993A" strokeWidth="10" fill="none" strokeLinecap="round" />
        <circle cx="22" cy="58" r="7" fill="#1BA8C9" />
        <path d="M10 40 Q5 60 30 85" stroke="#1BA8C9" strokeWidth="10" fill="none" strokeLinecap="round" />
        <circle cx="78" cy="58" r="7" fill="#0B6FB8" />
        <path d="M70 85 Q95 60 90 40" stroke="#0B6FB8" strokeWidth="10" fill="none" strokeLinecap="round" />
      </svg>
      <div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 23, letterSpacing: 1, lineHeight: 1 }}>
          <span style={{ color: "#FF7A00", fontWeight: 800 }}>HAZME</span>
          <span style={{ color: "#1BA8C9", fontWeight: 800 }}>CASO</span>
          <span style={{ color: "#6b7a8d", fontWeight: 600 }}>PE</span>
        </div>
        <div style={{ color: "#4b5a6b", fontSize: 10, letterSpacing: "0.12em", fontFamily: "'Barlow Condensed', sans-serif", marginTop: 1 }}>
          SISTEMA INTELIGENTE · OSIPTEL
        </div>
      </div>
    </div>
  );
}

// ─── Operador Panel ──────────────────────────────────────────────────────────
function OperadorPanel({ op }) {
  const [open, setOpen] = useState(false);
  const links = [
    op.reclamo && { label: "Hacer reclamo formal", href: op.reclamo, icon: "📝" },
    op.portal && { label: "Portal de reclamos", href: op.portal, icon: "🔗" },
    op.libro && { label: "Libro de reclamaciones", href: op.libro, icon: "📖" },
    op.libroNegocios && { label: "Libro Negocios", href: op.libroNegocios, icon: "🏢" },
    op.consulta && { label: "Consultar reclamo", href: op.consulta, icon: "🔍" },
    op.formularios && { label: "Formularios", href: op.formularios, icon: "📋" },
    op.seguimiento && { label: "Seguimiento", href: op.seguimiento, icon: "📡" },
    op.info && { label: "Info reclamos", href: op.info, icon: "ℹ️" },
    op.contacto && { label: "Contacto", href: op.contacto, icon: "💬" },
  ].filter(Boolean);

  return (
    <div style={{ marginBottom: 3 }}>
      <button className="op-button" onClick={() => setOpen(!open)}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: op.color, flexShrink: 0, boxShadow: `0 0 6px ${op.color}88` }} />
        <span style={{ color: "#c8d3de", fontSize: 13, fontWeight: 500, flex: 1, fontFamily: "'DM Sans', sans-serif" }}>
          {op.nombre}
        </span>
        <span style={{ color: "#3d4f61", fontSize: 9, transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </button>

      {open && (
        <div style={{
          marginLeft: 8,
          paddingLeft: 12,
          borderLeft: `2px solid ${op.color}55`,
          marginBottom: 6,
          paddingTop: 4,
          paddingBottom: 4,
        }}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
            {op.tipo.map(t => (
              <span key={t} style={{
                background: op.color + "18",
                color: op.color,
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 3,
                letterSpacing: "0.07em",
                border: `1px solid ${op.color}33`,
              }}>{t}</span>
            ))}
          </div>
          {links.map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="footer-link" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
              <span style={{ fontSize: 11 }}>{l.icon}</span>{l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Checas OSIPTEL ─────────────────────────────────────────────────────────
const CHECAS = [
  { label: "Checa tu Señal Móvil", href: "https://checa.osiptel.gob.pe/", icon: "📶", color: "#1BA8C9", desc: "Calidad en tiempo real" },
  { label: "Checa la Cobertura", href: "https://www.osiptel.gob.pe/portal-del-usuario/herramientas/checa-la-cobertura/", icon: "🗺️", color: "#0B6FB8", desc: "Mapa de cobertura" },
  { label: "Checa la Velocidad", href: "https://www.osiptel.gob.pe/portal-del-usuario/herramientas/checa-la-velocidad-de-tu-internet/", icon: "⚡", color: "#FF7A00", desc: "Test de velocidad" },
  { label: "Checa las Tarifas", href: "https://tarifas.osiptel.gob.pe/", icon: "💰", color: "#6ab04c", desc: "Comparador de planes" },
  { label: "Checa tu Número", href: "https://www.osiptel.gob.pe/portal-del-usuario/herramientas/checa-el-numero/", icon: "📱", color: "#7b4fff", desc: "Estado de portabilidad" },
  { label: "Checa el IMEI", href: "https://www.osiptel.gob.pe/portal-del-usuario/herramientas/checa-el-imei-de-tu-equipo/", icon: "🔒", color: "#e53935", desc: "Verifica tu equipo" },
];

// ─── Footer Principal ────────────────────────────────────────────────────────
export default function Footer() {
  const { osiptel, operadores } = CATALOG;

  return (
    <>
      <GlobalStyles />
      <footer style={{
        background: "#080d14",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Fondo sutil con ruido */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(27,168,201,0.04) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 90% 80%, rgba(255,122,0,0.03) 0%, transparent 50%)",
        }} />

        {/* Barra superior */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #FF7A00 0%, #F2993A 25%, #1BA8C9 60%, #0B6FB8 100%)" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "52px 28px 0", position: "relative" }}>

          {/* ── FILA 1: Marca + Checas + Servicios ── */}
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 1fr", gap: "40px 48px", marginBottom: 44, alignItems: "start" }}>

            {/* Marca */}
            <div>
              <Logo />
              <p style={{ color: "#5a6a7e", fontSize: 13, lineHeight: "1.7", marginTop: 4, marginBottom: 18, fontWeight: 300 }}>
                Sistema de atención inteligente para usuarios de telecomunicaciones en el Perú. Respaldado por OSIPTEL.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { icon: "📞", text: `Fono Ayuda: ${osiptel.fonoayuda}`, href: `tel:${osiptel.fonoayuda}` },
                  { icon: "✉️", text: osiptel.correo, href: `mailto:${osiptel.correo}` },
                  { icon: "🌐", text: "www.osiptel.gob.pe", href: "https://www.osiptel.gob.pe" },
                  { icon: "📍", text: "Gonzáles Larraín 214, Miraflores", href: "#" },
                ].map(({ icon, text, href }) => (
                  <a key={text} href={href} className="footer-link" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5 }}>
                    <span style={{ fontSize: 13, flexShrink: 0 }}>{icon}</span>{text}
                  </a>
                ))}
              </div>
            </div>

            {/* Checas OSIPTEL — destacado */}
            <div className="footer-section-card">
              <h4 className="col-title">🔍 Herramientas OSIPTEL</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {CHECAS.map(c => (
                  <a key={c.href} href={c.href} target="_blank" rel="noreferrer" className="checa-link">
                    <span className="checa-icon" style={{ background: c.color + "20", color: c.color }}>
                      {c.icon}
                    </span>
                    <span>
                      <span style={{ display: "block", fontWeight: 500, fontSize: 12.5, color: "#c8d3de" }}>{c.label}</span>
                      <span style={{ fontSize: 11, color: "#4b5a6b" }}>{c.desc}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Servicios */}
            <div>
              <h4 className="col-title">Servicios</h4>
              {[
                { label: "Reclamos en línea", href: "#", icon: "📝" },
                { label: "Consulta de expediente", href: "#", icon: "🔍" },
                { label: "Citas presenciales", href: "#", icon: "📅" },
                { label: "Chat IA", href: "#", icon: "🤖" },
              ].map(({ label, href, icon }) => (
                <a key={label} href={href} className="footer-link" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 12 }}>{icon}</span>{label}
                </a>
              ))}

              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "16px 0" }} />

              <h4 className="col-title" style={{ marginTop: 0 }}>Guías OSIPTEL</h4>
              {[
                { label: "Guía de reclamos", href: osiptel.links.guiaReclamos },
                { label: "Pasos para reclamar", href: osiptel.links.guiaPasos },
                { label: "Guía del formulario", href: osiptel.links.guiaFormulario },
                { label: "Te Ayudamos", href: osiptel.links.teAyudamos },
                { label: "Formularios en línea", href: osiptel.links.formularios },
                { label: "¿Quiénes pueden reclamar?", href: osiptel.links.quienesPueden },
                { label: "Requisitos del reclamo", href: osiptel.links.requisitos },
                { label: "Formas de presentación", href: osiptel.links.formasPresentacion },
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="footer-link">{label}</a>
              ))}
            </div>
          </div>

          {/* ── FILA 2: Procedimientos + Normativa + Operadores ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "40px 48px", marginBottom: 44 }}>

            {/* Procedimientos */}
            <div>
              <h4 className="col-title">Procedimientos</h4>
              {[
                { label: "Motivos, plazos y proc.", href: osiptel.links.motivosPlazos },
                { label: "Silencio administrativo positivo", href: osiptel.links.silencioAdmin },
                { label: "Quejas", href: osiptel.links.quejas },
                { label: "Denuncias", href: osiptel.links.denuncias },
                { label: "Expediente de reclamo", href: osiptel.links.expediente },
                { label: "FAQ: ¿Cuándo presentar una queja?", href: osiptel.links.faqQueja },
                { label: "FAQ: ¿Cuándo presentar una denuncia?", href: osiptel.links.faqDenuncia },
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="footer-link">{label}</a>
              ))}
            </div>

            {/* Normativa */}
            <div>
              <h4 className="col-title">Normativa Legal</h4>
              {[
                { label: "TUO Reglamento de Reclamos (PDF)", href: osiptel.links.turoReclamos },
                { label: "Resolución N° 099-2022", href: osiptel.links.resolucionTuo },
                { label: "TUO Telecomunicaciones", href: "#" },
                { label: "Resoluciones OSIPTEL", href: "#" },
                { label: "Reglamento de usuarios", href: "#" },
              ].map(({ label, href }) => (
                <a key={label} href={href} target={href !== "#" ? "_blank" : undefined} rel="noreferrer" className="footer-link">{label}</a>
              ))}

              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "16px 0" }} />

              {/* Términos y Privacidad — nuevo apartado */}
              <h4 className="col-title">Legal & Privacidad</h4>
              {[
                { label: "Términos y Condiciones de Uso", href: "/terminos-y-condiciones", icon: "📄" },
                { label: "Política de Privacidad", href: "/politica-de-privacidad", icon: "🔐" },
                { label: "Política de Cookies", href: "/politica-de-cookies", icon: "🍪" },
                { label: "Aviso Legal", href: "/aviso-legal", icon: "⚖️" },
                { label: "Protección de Datos Personales", href: "/proteccion-datos", icon: "🛡️" },
                { label: "Ley N° 29733 — Datos personales", href: "https://www.minjus.gob.pe/wp-content/uploads/2013/04/LEY-29733-LEY-DE-PROTECCION-DE-DATOS-PERSONALES.pdf", icon: "📑" },
              ].map(({ label, href, icon }) => (
                <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="footer-link" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5 }}>
                  <span style={{ fontSize: 11 }}>{icon}</span>{label}
                </a>
              ))}
            </div>

            {/* Operadores */}
            <div>
              <h4 className="col-title">Operadores — Reclamos</h4>
              {Object.values(operadores).map(op => (
                <OperadorPanel key={op.nombre} op={op} />
              ))}
            </div>

          </div>

          {/* ── DIVISOR ── */}
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)" }} />

          {/* ── FOOTER BOTTOM ── */}
          <div style={{ padding: "20px 0 24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <p style={{ color: "#384555", fontSize: 12, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                © 2026 HazMeCasoPE · PEU-OSIPTEL · Perú
              </p>
              <span style={{ color: "#2a3441", fontSize: 12 }}>·</span>
              <a href="/terminos-y-condiciones" className="legal-link">Términos</a>
              <a href="/politica-de-privacidad" className="legal-link">Privacidad</a>
              <a href="/politica-de-cookies" className="legal-link">Cookies</a>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["ISO 27001", "WCAG 2.1 AA", "OSIPTEL Oficial", "Ley 29733"].map(b => (
                <span key={b} className="badge">{b}</span>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
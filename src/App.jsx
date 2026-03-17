import { useState, useRef, useEffect } from 'react'
import Header from './components/Header/Header'
import HeroBanner from './components/HeroBanner/HeroBanner'
import Dashboard from './components/Dashboard/Dashboard'
import AtencionCards from './components/AtencionCards/AtencionCards'
import MapSection from './components/MapSection/MapSection'
import Footer from './components/Footer/Footer'
import { ChatModal, TicketModal, NormModal } from './components/Modals/Modals'
import './index.css'
import './norma-fab.css'

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isNormOpen, setIsNormOpen] = useState(false)
  const [normClaim, setNormClaim] = useState('')
  const [isTicketOpen, setIsTicketOpen] = useState(false)
  const [selectedSede, setSelectedSede] = useState(null)
  const [showBubble, setShowBubble] = useState(false)
  const [bubbleDismissed, setBubbleDismissed] = useState(false)

  const mapRef = useRef(null)

  // Mostrar burbuja de presentación después de 1.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!bubbleDismissed) setShowBubble(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [bubbleDismissed])

  // Auto-ocultar burbuja después de 8s
  useEffect(() => {
    if (!showBubble) return
    const timer = setTimeout(() => setShowBubble(false), 8000)
    return () => clearTimeout(timer)
  }, [showBubble])

  const handleScrollToMap = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleOpenNorm = (claim) => {
    setNormClaim(claim)
    setIsNormOpen(true)
  }

  const handleReserve = (sede) => {
    setSelectedSede(sede)
    setIsTicketOpen(true)
  }

  const handleFabClick = () => {
    setShowBubble(false)
    setBubbleDismissed(true)
    setIsChatOpen(true)
  }

  const handleDismissBubble = (e) => {
    e.stopPropagation()
    setShowBubble(false)
    setBubbleDismissed(true)
  }

  return (
    <>
      <Header
        onChatOpen={() => setIsChatOpen(true)}
        onScrollToMap={handleScrollToMap}
      />

      <HeroBanner />

      <main className="main-wrap">
        <div className="content-grid">
          <Dashboard />
          <AtencionCards
            onChatOpen={() => setIsChatOpen(true)}
            onNormOpen={handleOpenNorm}
          />
        </div>

        <div ref={mapRef}>
          <MapSection onReserve={handleReserve} />
        </div>
      </main>

      <Footer />

      {/* ── NORMA FAB ── */}
      <div className="norma-fab-wrapper">

        {/* Burbuja de presentación */}
        <div className={`norma-bubble${showBubble ? ' norma-bubble--visible' : ''}${bubbleDismissed ? ' norma-bubble--dismissed' : ''}`}>
          <button
            className="norma-bubble__close"
            onClick={handleDismissBubble}
            aria-label="Cerrar"
          >
            ×
          </button>

          <div className="norma-bubble__lang">
            <span>ES</span><span>QU</span><span>AY</span>
          </div>

          <p className="norma-bubble__greeting">¡Hola! Soy <strong>NORMA</strong> 👋</p>
          <p className="norma-bubble__desc">
            Tu asistente de inteligencia artificial para orientarte, educarte y
            empoderarte en el ejercicio de tus derechos frente a los servicios
            de telecomunicaciones.
          </p>
          <p className="norma-bubble__langs">
            Te atiendo en <em>español</em>, <em>quechua</em> y <em>aymara</em>.
          </p>

          <button className="norma-bubble__cta" onClick={handleFabClick}>
            Hablar con NORMA →
          </button>

          {/* Flecha que apunta al FAB */}
          <div className="norma-bubble__arrow" />
        </div>

        {/* Botón principal con imagen de NORMA */}
        <button
          className={`norma-fab ${showBubble ? 'norma-fab--active' : ''}`}
          onClick={handleFabClick}
          title="Hablar con NORMA – Asistente IA OSIPTEL"
          aria-label="Abrir chat con NORMA"
        >
          {/* Anillo de pulso */}
          <span className="norma-fab__pulse" />
          <span className="norma-fab__pulse norma-fab__pulse--delay" />

          {/* Imagen del asistente */}
          <img
            src="/images/norma.png"
            alt="NORMA – Asistente virtual OSIPTEL"
            className="norma-fab__img"
          />

          {/* Badge de disponibilidad */}
          <span className="norma-fab__badge" aria-hidden="true">IA</span>
        </button>
      </div>

      {/* Modals */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <TicketModal isOpen={isTicketOpen} onClose={() => setIsTicketOpen(false)} sede={selectedSede} />
      <NormModal isOpen={isNormOpen} onClose={() => setIsNormOpen(false)} initialClaim={normClaim} />
    </>
  )
}

export default App
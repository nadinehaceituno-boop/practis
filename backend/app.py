import os, base64, json, math, re, time
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ─── Claves ───────────────────────────────────────────────────────────────────
GEMINI_KEY   = os.getenv("GOOGLE_API_KEY",   "TU_GEMINI_KEY_AQUI")
DEEPSEEK_KEY = os.getenv("DEEPSEEK_API_KEY", "TU_DEEPSEEK_KEY_AQUI")

BASE_DIR          = os.path.dirname(os.path.abspath(__file__))
CARPETA_PDFS      = os.path.join(BASE_DIR, "pdfs_normativa")
VECTOR_STORE_FILE = os.path.join(BASE_DIR, "chroma_db", "store.json")

# ─── Clientes ─────────────────────────────────────────────────────────────────
gemini = genai.Client(
    api_key=GEMINI_KEY,
    http_options=types.HttpOptions(api_version="v1beta")
)

deepseek = OpenAI(
    api_key=DEEPSEEK_KEY,
    base_url="https://api.deepseek.com"
)

# ─── Helpers SDK ──────────────────────────────────────────────────────────────
def T(text):
    return types.Part(text=text)

def B(data, mime):
    return types.Part(inline_data=types.Blob(data=data, mime_type=mime))

# ─── RAG sin embeddings ───────────────────────────────────────────────────────
def extract_chunks(pdf_path, size=1000, overlap=150):
    try:
        try:
            import PyPDF2
            with open(pdf_path, 'rb') as f:
                text = "".join(p.extract_text() or "" for p in PyPDF2.PdfReader(f).pages)
        except Exception:
            import pypdf
            text = "".join(p.extract_text() or "" for p in pypdf.PdfReader(pdf_path).pages)
        chunks, i = [], 0
        while i < len(text):
            c = text[i:i+size].strip()
            if len(c) > 100:
                chunks.append(c)
            i += size - overlap
        return chunks
    except Exception as e:
        print(f"  ❌ PDF error en {os.path.basename(pdf_path)}: {e}")
        return []

def inicializar_rag():
    os.makedirs(os.path.dirname(VECTOR_STORE_FILE), exist_ok=True)
    if os.path.exists(VECTOR_STORE_FILE):
        with open(VECTOR_STORE_FILE, 'r', encoding='utf-8') as f:
            store = json.load(f)
        print(f"✅ RAG listo: {len(store)} chunks (desde disco)")
        return store

    if not os.path.exists(CARPETA_PDFS):
        os.makedirs(CARPETA_PDFS, exist_ok=True)
        print(f"⚠️  Coloca PDFs en '{CARPETA_PDFS}' y reinicia.")
        return []

    pdfs = [f for f in os.listdir(CARPETA_PDFS) if f.lower().endswith('.pdf')]
    if not pdfs:
        return []

    print(f"📄 Procesando {len(pdfs)} PDFs...")
    store = []
    for pdf in pdfs:
        chunks = extract_chunks(os.path.join(CARPETA_PDFS, pdf))
        for c in chunks:
            store.append({"doc": pdf.replace(".pdf",""), "text": c})
        print(f"  ✅ {pdf}: {len(chunks)} chunks")

    with open(VECTOR_STORE_FILE, 'w', encoding='utf-8') as f:
        json.dump(store, f, ensure_ascii=False)
    print(f"✅ {len(store)} chunks guardados.")
    return store

def keyword_search(store, query, k=8):
    if not store or not query:
        return ""
    words = set(re.findall(r'\w{4,}', query.lower()))
    scored = []
    for chunk in store:
        t = chunk["text"].lower()
        score = sum(1 for w in words if w in t)
        if score > 0:
            scored.append((score, chunk))
    scored.sort(key=lambda x: -x[0])
    top = scored[:k]
    if not top:
        return ""
    return "\n\n---\n\n".join(
        f"[{c['doc']}]\n{c['text']}" for _, c in top
    )

rag_store = inicializar_rag()

# ─── Prompts ──────────────────────────────────────────────────────────────────
GEMINI_PROMPT = """
Eres NORMA, una IA defensora de usuarios de telecomunicaciones en Perú — HazMeCasoPE.

════════════════════════════════
IDIOMAS — REGLA ABSOLUTA NÚMERO UNO
════════════════════════════════
Cada mensaje del sistema incluirá una etiqueta [IDIOMA_USUARIO: X].
DEBES responder SIEMPRE en ese idioma. Sin excepción. Sin mezclar idiomas.

• [IDIOMA_USUARIO: español]  → responde en ESPAÑOL
• [IDIOMA_USUARIO: quechua]  → responde en QUECHUA (Runasimi) en todo momento
• [IDIOMA_USUARIO: aymara]   → responde en AYMARA en todo momento

Si el usuario escribe en quechua aunque la etiqueta diga español → usa quechua.
Si el usuario escribe en aymara aunque la etiqueta diga español → usa aymara.
JAMÁS respondas en español si el usuario habló o escribió en quechua o aymara.

Saludos de ejemplo por idioma:
- Español: "¡Hola! ¿Cómo te puedo ayudar hoy? 😊"
- Quechua: "¡Napaykullayki! ¿Imatam yanapasqayki? 😊"
- Aymara:  "¡Kamisaraki! ¿Kunasa yanapt'añäni? 😊"

Frases útiles en quechua: Allinchu (bien), Manam (no), Arí (sí),
Imapitam (¿en qué?), Yanapasqayki (te ayudaré), Sutiyki (tu nombre).

Frases útiles en aymara: Waliki (bien), Janiwa (no), Jisa (sí),
Kunasa (qué cosa), Yanapt'añäni (te ayudaré), Sutimax (tu nombre).

════════════════════════════════
AUDIO — MUY IMPORTANTE
════════════════════════════════
Cuando recibas una nota de voz:
• ESCUCHA el audio completo antes de responder.
• TRANSCRIBE mentalmente lo que el usuario dijo.
• Responde en el MISMO idioma que usó el usuario en el audio.
• Trata el contenido del audio exactamente como si fuera texto escrito.
• NUNCA digas "no puedo procesar audio" — siempre puedes hacerlo.
• Si el audio es poco claro, pide amablemente que repita o escriba.

════════════════════════════════
ARCHIVOS Y FOTOS
════════════════════════════════
• Imagen de recibo/factura → extrae operador, monto, fechas, servicios.
  Detecta cargos no autorizados, servicios no contratados, irregularidades.
• PDF → identifica cláusulas problemáticas y derechos vulnerados.

════════════════════════════════
PERSONALIDAD
════════════════════════════════
• SIEMPRE valida la emoción PRIMERO antes de dar información legal.
• Emojis contextualmente: 📱💸⚖️🚨😊💡✅
• Respuestas CORTAS: máx 2 párrafos o lista breve. NUNCA muros de texto.
• Lenguaje humano. Traduce cualquier término legal a palabras simples.
• Eres el abogado amigo del usuario, no un manual burocrático.

════════════════════════════════
FLUJO DE CONVERSACIÓN
════════════════════════════════
PASO 1 — Sin nombre: valida emoción + pide SOLO el nombre. Una frase cálida.
PASO 2 — Con nombre: usa PRIMER nombre únicamente. Haz UNA pregunta de diagnóstico.
PASO 3 — Diagnóstico: identifica operador + servicio + problema + etapa.
          PROHIBIDO preguntar datos que el usuario ya dio.
PASO 4 — Orientación: si recibes un ANÁLISIS LEGAL de tu asistente especializado,
          tómalo y preséntalo de forma empática y simple al usuario.
          Ruta siempre: reclamo operadora → apelación → TRASU/OSIPTEL.

════════════════════════════════
CUÁNDO MARCAR ANÁLISIS LEGAL
════════════════════════════════
Si el usuario describe un problema concreto con su operador (cobro incorrecto,
corte de servicio, velocidad prometida vs real, portabilidad, multas, etc.),
INCLUYE AL FINAL DE TU RESPUESTA esta marca exacta (invisible para el usuario):
[NECESITA_ANALISIS_LEGAL: <resumen del caso en 1 línea>]

Solo agrégala cuando ya tengas suficiente información del caso (operador, tipo de problema).
NO la pongas en el primer mensaje ni cuando pides el nombre.

════════════════════════════════
LÍMITES
════════════════════════════════
• Solo telecomunicaciones en Perú. Fuera de tema: declina con amabilidad.
• NUNCA inventes leyes, plazos o normativas.
• NUNCA garantices que el usuario ganará.
• OSIPTEL: 0800-44-040 (gratuito) | www.osiptel.gob.pe | TRASU: 2da instancia.
"""

DEEPSEEK_PROMPT = """
Eres un experto legal en telecomunicaciones peruanas. Tu función es analizar casos
de usuarios y proporcionar orientación normativa precisa.

INSTRUCCIONES:
1. Lee el caso del usuario y los fragmentos de normativa proporcionados.
2. Identifica los artículos y reglamentos EXACTAMENTE aplicables al caso.
3. Explica cada norma en DOS versiones:
   a) Versión técnica (para el expediente)
   b) Versión simple (para que el usuario entienda)
4. Proporciona pasos concretos y ordenados que el usuario debe seguir.
5. Indica plazos exactos si los encuentras en la normativa.
6. Señala qué pruebas o documentos debe reunir el usuario.

FORMATO DE RESPUESTA:
📋 NORMAS APLICABLES
[Lista de artículos con cita exacta y explicación simple]

⚡ PASOS A SEGUIR
[Lista numerada y ordenada]

📁 DOCUMENTOS NECESARIOS
[Lista de evidencias a reunir]

⏰ PLAZOS IMPORTANTES
[Plazos del proceso si los hay en la normativa]

IMPORTANTE:
- Solo cita normas que aparezcan en los fragmentos proporcionados.
- Si no encuentras la norma exacta, indícalo claramente.
- Sé preciso y accionable. El usuario necesita saber QUÉ HACER HOY.
"""

# ─── Sesiones Gemini ──────────────────────────────────────────────────────────
GEMINI_MODELS = [
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-pro-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]

gemini_config = types.GenerateContentConfig(
    system_instruction=GEMINI_PROMPT,
    temperature=0.3,
)

sesiones = {}  # {session_id: chat_obj}

def get_gemini_chat(user_id):
    if user_id in sesiones:
        return sesiones[user_id], None
    for model in GEMINI_MODELS:
        try:
            chat = gemini.chats.create(model=model, config=gemini_config)
            sesiones[user_id] = chat
            print(f"✅ Gemini [{model}] → {user_id}")
            return chat, None
        except Exception as e:
            err = str(e)
            if "429" in err or "404" in err:
                continue
            print(f"❌ Gemini {model}: {err[:100]}")
    return None, "🚨 Sin modelos disponibles. Intenta en 1 minuto. 🙏"

# ─── Agente 2: Análisis legal ─────────────────────────────────────────────────
def analisis_legal_agente2(caso_resumen: str) -> str:
    contexto = keyword_search(rag_store, caso_resumen, k=10)
    if not contexto:
        contexto = "No se encontraron fragmentos normativos específicos para este caso."

    prompt_usuario = f"""CASO DEL USUARIO:
{caso_resumen}

FRAGMENTOS NORMATIVOS RELEVANTES:
{contexto}

Analiza este caso y proporciona orientación legal según las instrucciones."""

    # Intentar DeepSeek
    try:
        response = deepseek.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system",  "content": DEEPSEEK_PROMPT},
                {"role": "user",    "content": prompt_usuario},
            ],
            max_tokens=1500,
            temperature=0.1,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"⚠️ DeepSeek error ({e}). Intentando fallback Gemini...")

    # Fallback a Gemini
    for model in GEMINI_MODELS:
        try:
            res = gemini.models.generate_content(
                model=model,
                config=types.GenerateContentConfig(
                    system_instruction=DEEPSEEK_PROMPT,
                    temperature=0.1,
                ),
                contents=[prompt_usuario]
            )
            print(f"✅ Fallback legal exitoso con {model}")
            return res.text
        except Exception as ge:
            print(f"⚠️ Fallback Gemini {model} falló: {ge}")
            continue

    return None

# ─── Detección de formato de audio ───────────────────────────────────────────
def detect_audio_mime(audio_bytes: bytes) -> str:
    """Detecta el MIME type real del audio por sus magic bytes."""
    if len(audio_bytes) < 12:
        return "audio/webm"
    # WAV: RIFF....WAVE
    if audio_bytes[:4] == b'RIFF' and audio_bytes[8:12] == b'WAVE':
        return "audio/wav"
    # OGG / Opus
    if audio_bytes[:4] == b'OggS':
        return "audio/ogg"
    # MP4 / M4A / WebM (Matroska-based) — ftyp box
    if audio_bytes[4:8] in (b'ftyp', b'\x1aE\xdf\xa3'):
        return "audio/mp4"
    # FLAC
    if audio_bytes[:4] == b'fLaC':
        return "audio/flac"
    # MP3 — ID3 tag o frame sync
    if audio_bytes[:3] == b'ID3' or (audio_bytes[0] == 0xFF and audio_bytes[1] & 0xE0 == 0xE0):
        return "audio/mpeg"
    # Default: webm (lo que produce MediaRecorder en Chrome/Firefox)
    return "audio/webm"

# ─── Builder de partes Gemini ─────────────────────────────────────────────────
# Mapeo de código de idioma a nombre completo
LANG_NAMES = {"es": "español", "qu": "quechua", "ay": "aymara"}

def build_parts(mensaje, files, audio_b64, lang, analisis_legal=None):
    parts = []

    # ── ETIQUETA DE IDIOMA — va PRIMERO siempre, antes de cualquier otra cosa ──
    # Esto fuerza a Gemini a responder en el idioma correcto en cada turno
    idioma_nombre = LANG_NAMES.get(lang, "español")
    parts.append(T(
        f"[IDIOMA_USUARIO: {idioma_nombre}] "
        f"RESPONDE OBLIGATORIAMENTE EN {idioma_nombre.upper()}. "
        f"NO uses español si el idioma es quechua o aymara."
    ))

    # ── Análisis legal de DeepSeek (siempre va primero como contexto) ─────────
    if analisis_legal:
        parts.append(T(
            f"[ANÁLISIS DE TU ASISTENTE LEGAL ESPECIALIZADO]\n"
            f"{analisis_legal}\n\n"
            f"[FIN DEL ANÁLISIS]\n\n"
            f"Presenta este análisis al usuario de forma empática, simple y motivadora. "
            f"Usa su nombre si lo sabes. Adapta el tono al idioma del usuario."
        ))

    # ── AUDIO — blob ANTES del texto explicativo ──────────────────────────────
    if audio_b64:
        try:
            # Limpiar prefijo data URI si el frontend lo mandó con él
            if ',' in audio_b64:
                audio_b64 = audio_b64.split(',', 1)[1]

            audio_bytes = base64.b64decode(audio_b64)

            if len(audio_bytes) < 100:
                raise ValueError(f"Audio demasiado corto ({len(audio_bytes)} bytes)")

            mime = detect_audio_mime(audio_bytes)
            print(f"🎙️ Audio recibido: {len(audio_bytes)} bytes, MIME detectado: {mime}")

            # El blob va PRIMERO
            parts.append(B(audio_bytes, mime))

            # Instrucción inmediatamente después del blob
            hints = {"es": "español peruano", "qu": "quechua", "ay": "aymara"}
            idioma = hints.get(lang, "español")
            parts.append(T(
                f"INSTRUCCIÓN DE AUDIO: El usuario envió una nota de voz en {idioma}. "
                f"(1) Escucha TODO el audio. "
                f"(2) Entiende su problema. "
                f"(3) RESPONDE ÚNICAMENTE EN {idioma.upper()} — aunque el audio no sea claro, "
                f"responde en {idioma}. "
                f"(4) Aplica el flujo de conversación normal."
            ))

        except Exception as e:
            print(f"❌ Audio decode error: {e}")
            parts.append(T(
                "[El usuario intentó enviar una nota de voz pero ocurrió un error al procesarla. "
                "Dile amablemente: 'Tuve un pequeño problema con tu nota de voz 😅 "
                "¿Puedes intentar grabar de nuevo o escribirme tu consulta?']"
            ))

    # ── ARCHIVOS ──────────────────────────────────────────────────────────────
    for f in (files or []):
        try:
            raw_data = f.get("data", "")
            # Limpiar prefijo data URI si viene incluido
            if ',' in raw_data:
                raw_data = raw_data.split(',', 1)[1]

            fb = base64.b64decode(raw_data)
            if len(fb) < 50:
                raise ValueError("Archivo vacío")

            ft = f.get("type", "")
            fn = f.get("name", "archivo")

            if ft.startswith("image/"):
                parts.append(B(fb, ft))
                parts.append(T(
                    f"[Imagen adjunta '{fn}']: Extrae operador, montos, fechas, servicios. "
                    "Detecta cargos no autorizados, servicios no contratados o irregularidades. "
                    "Explica al usuario qué ves en la imagen de forma empática."
                ))
            elif ft == "application/pdf":
                parts.append(B(fb, "application/pdf"))
                parts.append(T(
                    f"[PDF adjunto '{fn}']: Identifica cláusulas problemáticas, "
                    "derechos vulnerados y explica al usuario qué encontraste."
                ))
            else:
                parts.append(T(
                    f"[Archivo adjunto '{fn}' de tipo '{ft}' — no puedo procesarlo directamente. "
                    "Informa al usuario que solo acepto imágenes y PDFs.]"
                ))
        except Exception as e:
            print(f"❌ File error '{f.get('name','?')}': {e}")
            parts.append(T(
                f"[Error procesando el archivo '{f.get('name', 'adjunto')}'. "
                "Pide al usuario que lo reenvíe.]"
            ))

    # ── TEXTO DEL USUARIO ─────────────────────────────────────────────────────
    # Filtramos solo marcadores internos del frontend, nunca texto real
    MARCADORES_INTERNOS = {"[AUDIO_MSG]", "[VER ADJUNTOS]", "[AUDIO]"}
    texto_limpio = mensaje.strip() if mensaje else ""

    if texto_limpio and texto_limpio not in MARCADORES_INTERNOS:
        parts.append(T(f"MENSAJE DEL USUARIO: {texto_limpio}"))

    # Si no hay nada, fallback seguro
    if not parts:
        parts.append(T("El usuario se conectó. Salúdale con el mensaje de bienvenida."))

    return parts

# ─── Rutas ────────────────────────────────────────────────────────────────────
@app.route('/')
def home():
    return jsonify({
        "status": "NORMA ✅",
        "version": "3.1 — Audio Fix",
        "agente1": "Gemini (conversación + audio)",
        "agente2": "DeepSeek (análisis legal)",
        "rag_chunks": len(rag_store),
        "rag_method": "keyword search (sin embeddings)"
    })

@app.route('/health')
def health():
    return jsonify({"rag": len(rag_store), "sessions": len(sesiones)})

@app.route('/reset', methods=['POST'])
def reset():
    uid = (request.json or {}).get("session_id", "")
    sesiones.pop(uid, None)
    return jsonify({"status": "ok"})

@app.route('/rag/rebuild', methods=['POST'])
def rag_rebuild():
    global rag_store
    if os.path.exists(VECTOR_STORE_FILE):
        os.remove(VECTOR_STORE_FILE)
    rag_store = inicializar_rag()
    return jsonify({"chunks": len(rag_store)})

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    data      = request.json or {}
    user_id   = data.get("session_id", "default")
    mensaje   = (data.get("mensaje") or "").strip()
    lang      = data.get("lang", "es")
    files     = data.get("files") or []
    audio_b64 = data.get("audio_b64") or None

    # ── Validar que haya contenido real ──────────────────────────────────────
    MARCADORES = {"[AUDIO_MSG]", "[VER ADJUNTOS]", "[AUDIO]"}
    tiene_audio = bool(audio_b64 and len(audio_b64) > 100)
    tiene_texto = bool(mensaje and mensaje not in MARCADORES)
    tiene_files = bool(files)

    print(f"📨 [{user_id}] texto:'{mensaje[:40] if mensaje else '-'}' | "
          f"audio:{'✅ '+str(len(audio_b64))+'ch' if tiene_audio else '❌'} | "
          f"files:{len(files)}")

    if not tiene_audio and not tiene_texto and not tiene_files:
        return jsonify({"respuesta": "No se recibió contenido. Por favor escribe o graba un mensaje. 🎤"})

    # ── Paso 1: obtener sesión Gemini ─────────────────────────────────────────
    chat, err = get_gemini_chat(user_id)
    if err:
        return jsonify({"respuesta": err})

    # ── Paso 2: primera respuesta de Gemini ───────────────────────────────────
    parts_iniciales = build_parts(mensaje, files, audio_b64, lang)

    try:
        r1 = chat.send_message(parts_iniciales)
        respuesta_gemini = r1.text
    except Exception as e:
        err_str = str(e)
        print(f"❌ Gemini send_message error: {err_str[:300]}")

        if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "404" in err_str:
            # Intentar modelos alternativos de Gemini primero
            sesiones.pop(user_id, None)
            fallback_ok = False
            for model in GEMINI_MODELS[1:]:  # saltar el que acabó de fallar
                try:
                    chat_fb = gemini.chats.create(model=model, config=gemini_config)
                    r1 = chat_fb.send_message(parts_iniciales)
                    respuesta_gemini = r1.text
                    sesiones[user_id] = chat_fb
                    print(f"✅ Fallback conversación con {model}")
                    fallback_ok = True
                    break
                except Exception as fe:
                    print(f"⚠️ Fallback {model}: {str(fe)[:80]}")
                    continue

            if not fallback_ok:
                # Todos los modelos Gemini agotados — usar DeepSeek como agente 1
                print("🔄 Todos Gemini agotados / error 404. DeepSeek toma el rol de agente 1.")
                texto_usuario = mensaje if mensaje and mensaje not in {"[AUDIO_MSG]","[VER ADJUNTOS]","[AUDIO]"} else \
                    ("[El usuario envió una consulta multimedia]" if (audio_b64 or files) else "[El usuario se conectó]")
                try:
                    idioma_fb = LANG_NAMES.get(lang, "español")
                    ds_r = deepseek.chat.completions.create(
                        model="deepseek-chat",
                        messages=[
                            {"role": "system", "content": (
                                GEMINI_PROMPT +
                                f"\n\nREGLA CRÍTICA: El usuario habla {idioma_fb}. "
                                f"TODA tu respuesta debe estar en {idioma_fb.upper()}."
                            )},
                            {"role": "user", "content": f"[IDIOMA: {idioma_fb}] {texto_usuario}"},
                        ],
                        max_tokens=600,
                        temperature=0.4,
                    )
                    return jsonify({"respuesta": ds_r.choices[0].message.content, "fallback": "deepseek"})
                except Exception as ds_e:
                    print(f"❌ DeepSeek fallback también falló: {ds_e}")
                    return jsonify({"respuesta": "¡Hola! Norma está recibiendo muchas consultas ahora mismo. 😅 ¿Podrías intentar escribirme de nuevo en un minuto? Estaré encantada de ayudarte con tu caso de telecomunicaciones. 🙏"})

        else:
            # Error no relacionado con quota/404 — limpiar sesión y reintentar una vez
            sesiones.pop(user_id, None)
            chat, err = get_gemini_chat(user_id)
            if err:
                return jsonify({"respuesta": "Estoy teniendo un pequeño inconveniente técnico, pero ya estoy trabajando en ello. 🛠️ Por favor, prueba enviando tu mensaje una vez más."})
            try:
                r1 = chat.send_message(parts_iniciales)
                respuesta_gemini = r1.text
            except Exception as e2:
                print(f"❌ Gemini reintento fallido: {e2}")
                return jsonify({"respuesta": "Lo siento, mi conexión está un poco inestable. 😅 Por favor, intenta de nuevo en unos segundos. ¡No me iré a ningún lado!"})

    # ── Paso 3: detectar si Gemini marcó análisis legal ───────────────────────
    marca = re.search(r'\[NECESITA_ANALISIS_LEGAL:\s*(.+?)\]', respuesta_gemini, re.IGNORECASE)

    if marca:
        caso_resumen = marca.group(1).strip()
        respuesta_visible = re.sub(
            r'\[NECESITA_ANALISIS_LEGAL:.*?\]', '', respuesta_gemini,
            flags=re.IGNORECASE
        ).strip()

        print(f"🔍 Caso detectado para análisis legal: {caso_resumen}")

        # ── Paso 4: Análisis legal con fallback automático ────────────────────
        analisis = analisis_legal_agente2(caso_resumen)

        if analisis:
            # ── Paso 5: Gemini reformatea el análisis empáticamente ───────────
            parts_analisis = build_parts("", [], None, lang, analisis_legal=analisis)
            try:
                r2 = chat.send_message(parts_analisis)
                return jsonify({"respuesta": r2.text, "analisis_realizado": True})
            except Exception as e:
                print(f"⚠️ Gemini r2 error: {e}")
                # Fallback: devolver respuesta visible + análisis crudo
                return jsonify({
                    "respuesta": respuesta_visible + "\n\n" + analisis,
                    "analisis_realizado": True
                })
        else:
            # DeepSeek y fallbacks fallaron — devolver respuesta de Gemini aclarando que el análisis legal detallado tardará
            return jsonify({
                "respuesta": respuesta_visible + "\n\n(Aviso: Mi sistema de análisis legal profundo está un poco lento, pero puedo seguir conversando contigo sobre los detalles básicos de tu caso. 😊)"
            })

    # Sin marca: devolver respuesta de Gemini directamente
    return jsonify({"respuesta": respuesta_gemini})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
import { useState, useRef, useEffect } from 'react';
import { chatbotMensaje } from '../services/chatbotService';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import 'katex/dist/katex.min.css';

export default function ChatSection({ tema = 'limites', unidadTitulo = '', lateral = false }) {
  const [messages, setMessages] = useState(() => [
    {
      from: 'bot',
      text: getMensajeBienvenida(tema, unidadTitulo),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const mathRef = useRef(null);
  const primeraVez = useRef(true);

  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    const caja = mathRef.current;
    if (!caja) return;
    caja.scrollTo({ top: caja.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (mathRef.current) {
      renderMathInElement(mathRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false },
          { left: '$', right: '$', display: false },
        ],
        throwOnError: false,
        errorColor: '#FCA5A5',
      });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { from: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    const res = await chatbotMensaje(tema, userMsg);

    if (!res.ok) {
      if (res.error === 'NO_API_KEY') {
        setMessages((prev) => [
          ...prev,
          {
            from: 'bot',
            text: '⚠️ Para usar el chatbot, configura tu API key de OpenAI. Crea un archivo `.env` en la raíz con:\n\n`VITE_OPENAI_API_KEY=sk-tu-clave-aqui`\n\nLuego reinicia el servidor.',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            from: 'bot',
            text: `❌ Error: ${res.error}\n\nPor favor intenta de nuevo en un momento.`,
          },
        ]);
      }
    } else {
      setMessages((prev) => [...prev, { from: 'bot', text: res.respuesta }]);
    }

    setLoading(false);
  };

  const getNombreTema = () => {
    if (tema === 'limites') return 'Límites';
    if (tema === 'derivadas') return 'Derivadas';
    if (tema === 'aplicaciones') return 'Aplicaciones';
    return 'Cálculo';
  };

  return (
    <div style={{ ...styles.container, ...(lateral ? styles.containerLateral : {}) }} className="chat-card">
      <div style={styles.headerSection}>
        <div style={styles.headerGlow} />
        <div style={styles.headerIcon}>🎓</div>
        <div style={styles.headerTextWrap}>
          <div style={styles.headerTitleRow}>
            <h2 style={styles.title}>Asistente de {getNombreTema()}</h2>
            <span style={styles.liveDot}>
              <span style={styles.pulse} />
              <span style={styles.liveText}>En línea</span>
            </span>
          </div>
          <p style={styles.subtitle}>
            Pregunta cualquier ejercicio de este tema. Te lo resuelvo paso a paso.
          </p>
        </div>
      </div>

      <div style={{ ...styles.chatWrap, ...(lateral ? styles.chatWrapLateral : {}) }}>
        <div ref={mathRef} style={{ ...styles.messages, ...(lateral ? styles.messagesLateral : {}) }}>
          {messages.map((m, i) => (
            <div
              key={i}
              className="chat-row-anim"
              style={{
                ...styles.row,
                ...(m.from === 'user' ? styles.rowUser : {}),
              }}
            >
              <div style={styles.avatarWrap}>
                <div style={m.from === 'user' ? styles.avatarUser : styles.avatarBot}>
                  {m.from === 'user' ? '👤' : '🎓'}
                </div>
              </div>
              <div
                style={{
                  ...styles.bubble,
                  ...(m.from === 'user' ? styles.bubbleUser : styles.bubbleBot),
                }}
              >
                {m.text.split('\n').map((line, idx) => (
                  <p key={idx} style={styles.line}>{line}</p>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div style={styles.row} className="chat-row-anim">
              <div style={styles.avatarWrap}>
                <div style={styles.avatarBot}>🎓</div>
              </div>
              <div style={{ ...styles.bubble, ...styles.bubbleBot, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={styles.dot}>●</span>
                <span style={{ ...styles.dot, animationDelay: '0.2s' }}>●</span>
                <span style={{ ...styles.dot, animationDelay: '0.4s' }}>●</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} style={styles.form}>
          <input
            style={styles.input}
            className="chat-input"
            placeholder="Escribe tu ejercicio o pregunta... Ej: 'Calcula el límite de x² cuando x→3'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" style={styles.sendBtn} className="chat-send-btn" disabled={loading}>
            {loading ? '···' : 'Enviar ➤'}
          </button>
        </form>
      </div>

      <div style={styles.tips}>
        <strong style={styles.tipsStrong}>💡 Tips:</strong> Puedes preguntar ejercicios específicos, pedir explicaciones de conceptos, o solicitar ejemplos adicionales. ¡Sé específico para mejores respuestas!
      </div>
    </div>
  );
}

function getMensajeBienvenida(tema, unidadTitulo) {
  const titulo = unidadTitulo || (tema === 'limites' ? 'Límites' : tema === 'derivadas' ? 'Derivadas' : 'Aplicaciones');
  return `¡Hola! Soy tu asistente de **${titulo}**.\n\nEstoy aquí para ayudarte con cualquier ejercicio de este tema. Puedes escribir algo como:\n\n• "Calcula el límite de x² - 4 / x - 2 cuando x→2"\n• "Deriva f(x) = sin(x) + x³ paso a paso"\n• "¿Cómo encuentro los máximos de una función?"\n\n¡Adelante, pregunta lo que necesites!`;
}

const styles = {
  container: {
    background: 'linear-gradient(145deg, rgba(15,26,53,0.9) 0%, rgba(11,16,32,0.95) 100%)',
    borderRadius: '22px',
    border: '1px solid rgba(244,180,0,0.1)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(244,180,0,0.05)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    marginTop: '24px',
    minHeight: 0,
  },
  headerSection: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '20px 22px',
    background: 'linear-gradient(135deg, #0b1020 0%, #16213e 55%, #1a2f6b 130%)',
    color: '#fff',
    overflow: 'hidden',
    borderBottom: '1px solid rgba(244,180,0,0.12)',
    flexShrink: 0,
  },
  headerGlow: {
    position: 'absolute',
    top: '-40%',
    right: '-10%',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(244,180,0,0.35) 0%, rgba(244,180,0,0) 70%)',
    pointerEvents: 'none',
  },
  headerIcon: {
    fontSize: '28px',
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'rgba(244,180,0,0.12)',
    border: '1px solid rgba(244,180,0,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    zIndex: 1,
  },
  headerTextWrap: {
    position: 'relative',
    zIndex: 1,
    minWidth: 0,
    flex: 1,
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: '6px',
    columnGap: '10px',
  },
  title: {
    fontSize: '19px',
    fontWeight: 800,
    color: '#fff',
    margin: 0,
    fontFamily: "'Poppins', sans-serif",
    wordBreak: 'break-word',
  },
  subtitle: {
    fontSize: '13.5px',
    color: 'rgba(255,255,255,0.65)',
    margin: '4px 0 0',
  },
  liveDot: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
    padding: '3px 10px',
    borderRadius: '999px',
    background: 'rgba(52,211,153,0.12)',
  },
  pulse: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#34D399',
    animation: 'chatPulse 1.8s infinite',
  },
  liveText: {
    fontSize: '11.5px',
    fontWeight: 600,
    color: '#6EE7B7',
    whiteSpace: 'nowrap',
  },
  chatWrap: {
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(8,12,26,0.5)',
    borderBottom: '1px solid rgba(244,180,0,0.08)',
  },
  chatWrapLateral: {
    flex: 1,
    minHeight: 0,
  },
  containerLateral: {
    marginTop: 0,
    // 90px del top sticky + un margen de seguridad abajo para que no toque el borde
    maxHeight: 'calc(100vh - 130px)',
  },
  messagesLateral: {
    flex: 1,
    minHeight: 0,
    maxHeight: 'none',
  },
  messages: {
    padding: '20px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: '520px',
    overflowY: 'auto',
    minHeight: '200px',
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  rowUser: {
    flexDirection: 'row-reverse',
  },
  avatarWrap: {
    flexShrink: 0,
  },
  avatarBot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #16213e, #1a2f6b)',
    border: '1px solid rgba(244,180,0,0.2)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
  },
  avatarUser: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #F4B400, #F59E0B)',
    color: '#0b1020',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    boxShadow: '0 4px 10px rgba(244,180,0,0.3)',
  },
  bubble: {
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '14.5px',
    lineHeight: 1.6,
    maxWidth: '85%',
    wordBreak: 'break-word',
  },
  bubbleBot: {
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(244,180,0,0.1)',
    borderTopLeftRadius: '4px',
  },
  bubbleUser: {
    background: 'linear-gradient(135deg, #F4B400, #F59E0B)',
    color: '#0b1020',
    fontWeight: 500,
    borderTopRightRadius: '4px',
    boxShadow: '0 4px 14px rgba(244,180,0,0.25)',
  },
  line: {
    margin: '0 0 6px',
    padding: 0,
  },
  dot: {
    fontSize: '10px',
    color: '#F4B400',
    animation: 'blink 1.4s infinite both',
  },
  form: {
    display: 'flex',
    gap: '10px',
    padding: '14px 22px',
    background: 'rgba(11,16,32,0.6)',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1.5px solid rgba(244,180,0,0.15)',
    fontSize: '14.5px',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    background: 'rgba(255,255,255,0.04)',
    color: '#fff',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
  },
  sendBtn: {
    padding: '12px 20px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #F4B400, #F59E0B)',
    color: '#0b1020',
    fontSize: '14.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 14px rgba(244,180,0,0.35)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    flexShrink: 0,
  },
  tips: {
    padding: '14px 22px',
    background: 'rgba(244,180,0,0.05)',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12.5px',
    lineHeight: 1.5,
    flexShrink: 0,
  },
  tipsStrong: {
    color: '#F4B400',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('chat-section-styles')) {
  const style = document.createElement('style');
  style.id = 'chat-section-styles';
  style.textContent = `
    @keyframes blink {
      0%, 80%, 100% { opacity: 0.2; }
      40% { opacity: 1; }
    }
    @keyframes chatPulse {
      0% { box-shadow: 0 0 0 0 rgba(52,211,153,0.6); }
      70% { box-shadow: 0 0 0 8px rgba(52,211,153,0); }
      100% { box-shadow: 0 0 0 0 rgba(52,211,153,0); }
    }
    @keyframes chatRowIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .chat-row-anim {
      animation: chatRowIn 0.25s ease-out;
    }
    .chat-card {
      transition: box-shadow 0.25s ease;
    }
    .chat-card:hover {
      box-shadow: 0 14px 46px rgba(0,0,0,0.45), inset 0 1px 0 rgba(244,180,0,0.08);
    }
    .chat-input::placeholder {
      color: rgba(255,255,255,0.35);
    }
    .chat-input:focus {
      border-color: #F4B400 !important;
      background: rgba(255,255,255,0.07) !important;
      box-shadow: 0 0 0 3px rgba(244,180,0,0.15);
    }
    .chat-send-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(244,180,0,0.5);
    }
    .chat-send-btn:active:not(:disabled) {
      transform: translateY(0);
    }
    .chat-send-btn:disabled {
      opacity: 0.6;
      cursor: default;
    }
    .chat-card *::-webkit-scrollbar {
      width: 8px;
    }
    .chat-card *::-webkit-scrollbar-thumb {
      background: rgba(244,180,0,0.3);
      border-radius: 999px;
    }

    @media (max-width: 1024px) {
      .calculo-chat-lateral .chat-card,
      .tema-layout .chat-card {
        max-height: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}
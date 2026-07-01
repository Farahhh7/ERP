import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function Register() {
  const { accentColor } = useTheme();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const glassRef = useRef(null);
  const shineRef = useRef(null);
  const [form, setForm] = useState({ nom: '', email: '', password: '', role: 'Magasinier' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W, H, mx, my, t = 0, raf;
    const pts = [], aurora = [];

    function init() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      mx = W / 2; my = H / 2;
      pts.length = 0;
      for (let i = 0; i < 100; i++) pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
        r: Math.random() * 1.6 + .3,
        a: Math.random() * .5 + .1,
        hue: 200 + Math.random() * 120
      });
      aurora.length = 0;
      for (let i = 0; i < 5; i++) aurora.push({
        x: Math.random() * W, y: Math.random() * H * .6,
        w: 200 + Math.random() * 300, h: 60 + Math.random() * 80,
        hue: 250 + Math.random() * 80,
        speed: .003 + Math.random() * .004,
        phase: Math.random() * Math.PI * 2
      });
    }
    init();

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.012;
      aurora.forEach(a => {
        const y = a.y + Math.sin(t * a.speed * 10 + a.phase) * 20;
        const grd = ctx.createRadialGradient(a.x, y, 0, a.x, y, a.w * .6);
        grd.addColorStop(0, `hsla(${a.hue},80%,60%,0.07)`);
        grd.addColorStop(.5, `hsla(${a.hue + 30},70%,50%,0.04)`);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.ellipse(a.x + Math.sin(t * a.speed + a.phase) * 40, y, a.w, a.h, 0, 0, Math.PI * 2);
        ctx.fill();
        a.x += Math.sin(t * .3 + a.phase) * .3;
      });
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const dx = p.x - mx, dy = p.y - my;
        const d = Math.sqrt(dx * dx + dy * dy);
        const b = d < 120 ? 1 + (1 - d / 120) * 2.5 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * b, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,72%,${p.a * Math.min(b, 2)})`;
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 70) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(139,92,246,${.18 * (1 - d / 70)})`;
          ctx.lineWidth = .5; ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    const handleMove = e => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      const gr = glassRef.current?.getBoundingClientRect();
      if (!gr) return;
      const gx = e.clientX - gr.left, gy = e.clientY - gr.top;
      const ry = (gx / gr.width - .5) * 18;
      const rx = -(gy / gr.height - .5) * 14;
      if (cardRef.current) {
        cardRef.current.style.transform = `rotateY(${ry}deg) rotateX(${rx}deg)`;
        cardRef.current.style.transition = 'transform 0.08s ease-out';
      }
      if (shineRef.current) {
        const sx = (gx / gr.width) * 100, sy = (gy / gr.height) * 100;
        shineRef.current.style.background = `radial-gradient(circle at ${sx}% ${sy}%,rgba(139,92,246,0.13) 0%,transparent 55%)`;
      }
    };

    const handleLeave = () => {
      if (cardRef.current) {
        cardRef.current.style.transform = 'rotateY(0) rotateX(0)';
        cardRef.current.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
      }
      if (shineRef.current) shineRef.current.style.background = 'none';
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseleave', handleLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Erreur lors de l'inscription");
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/');
      }
    } catch {
      setError('Impossible de contacter le serveur');
    }
    setLoading(false);
  };

  const handleRipple = e => {
    const btn = e.currentTarget;
    const rip = document.createElement('span');
    const br = btn.getBoundingClientRect();
    const sz = Math.max(br.width, br.height) * 1.5;
    rip.style.cssText = `
      position:absolute;border-radius:50%;
      background:rgba(255,255,255,0.2);
      width:${sz}px;height:${sz}px;
      left:${e.clientX - br.left - sz / 2}px;
      top:${e.clientY - br.top - sz / 2}px;
      transform:scale(0);animation:rip 0.5s linear;pointer-events:none;
    `;
    btn.appendChild(rip);
    setTimeout(() => rip.remove(), 550);
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px', padding: '10px 14px',
    color: '#fff', fontSize: '12px', marginBottom: '12px',
    outline: 'none', transition: 'all 0.25s'
  };
  const labelStyle = {
    fontSize: '11px', color: 'rgba(196,181,253,0.5)',
    display: 'block', marginBottom: '5px', letterSpacing: '0.5px'
  };
  const floatingTags = [
    { text: '⚡ AI Powered', style: { top: '10%', left: '3%' }, delay: '0s' },
    { text: '🔒 JWT Secure', style: { top: '18%', right: '3%' }, delay: '1s' },
    { text: '📊 Real-time', style: { bottom: '18%', left: '3%' }, delay: '1.8s' },
    { text: '🚀 v2.0', style: { bottom: '12%', right: '4%' }, delay: '0.6s' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#04030d',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      <style>{`
        @keyframes rip { to { transform: scale(5); opacity: 0; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.5; } }
        .psm-input:focus { border-color: rgba(139,92,246,0.6) !important; background: rgba(139,92,246,0.07) !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.08); }
        .psm-btn:hover { background: rgba(124,58,237,0.95) !important; transform: translateY(-1px); }
        .psm-btn:active { transform: scale(0.99) !important; }
      `}</style>

      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%' }} />

      {floatingTags.map((tag, i) => (
        <div key={i} style={{
          position: 'fixed', ...tag.style,
          background: 'rgba(109,40,217,0.2)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: '8px', padding: '6px 12px',
          fontSize: '11px', color: 'rgba(196,181,253,0.7)',
          zIndex: 5, animation: `float 3s ease-in-out infinite`,
          animationDelay: tag.delay
        }}>{tag.text}</div>
      ))}

      <div ref={cardRef} style={{ position: 'relative', zIndex: 10, perspective: '1000px' }}>
        <div ref={glassRef} style={{
          width: '320px',
          background: 'rgba(10,6,28,0.85)',
          borderRadius: '22px', padding: '28px 26px',
          border: '1px solid rgba(139,92,246,0.25)',
          backdropFilter: 'blur(30px)',
          position: 'relative', overflow: 'hidden',
          transformStyle: 'preserve-3d'
        }}>
          <div ref={shineRef} style={{
            position: 'absolute', inset: 0,
            borderRadius: '22px', pointerEvents: 'none', zIndex: 1
          }} />

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: '-6px', borderRadius: '18px',
                border: '1px solid rgba(139,92,246,0.4)',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
              <div style={{
                position: 'absolute', inset: '-13px', borderRadius: '22px',
                border: '1px solid rgba(139,92,246,0.15)',
                animation: 'pulse 2s ease-in-out infinite 0.5s'
              }} />
              <div style={{
                width: '52px', height: '52px',
                background: 'rgba(109,40,217,0.75)',
                borderRadius: '14px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 0 28px rgba(124,58,237,0.4)'
              }}>📦</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>PSM</div>
            <div style={{ fontSize: '10px', color: 'rgba(196,181,253,0.4)', letterSpacing: '2px', textTransform: 'uppercase' }}>Predictive Stock Manager</div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', borderRadius: '10px', padding: '10px 12px',
              fontSize: '12px', marginTop: '10px'
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ marginTop: '14px' }}>
            <label style={labelStyle}>Nom complet</label>
            <input type="text" name="nom" value={form.nom} onChange={handleChange}
              required placeholder="Votre nom" className="psm-input" style={inputStyle} />

            <label style={labelStyle}>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              required placeholder="exemple@email.com" className="psm-input" style={inputStyle} />

            <label style={labelStyle}>Mot de passe</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              required placeholder="••••••••" className="psm-input" style={inputStyle} />

            <label style={labelStyle}>Rôle</label>
            <select name="role" value={form.role} onChange={handleChange}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="Magasinier">Magasinier</option>
              <option value="Acheteur">Acheteur</option>
              <option value="Admin">Admin</option>
            </select>

            <button type="submit" disabled={loading} onClick={handleRipple}
              className="psm-btn"
              style={{
                width: '100%', padding: '12px',
                background: 'rgba(109,40,217,0.85)',
                color: '#fff', border: 'none', borderRadius: '12px',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.2s', letterSpacing: '0.3px',
                opacity: loading ? 0.6 : 1
              }}>
              {loading ? "Inscription..." : "S'inscrire"}
            </button>
          </form>

          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', textAlign: 'center', marginTop: '12px' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none' }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
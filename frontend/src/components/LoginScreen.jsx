import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService } from '../services/api';
import { 
  Lock, 
  BarChart3, 
  Palette, 
  Plus, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  X, 
  Briefcase 
} from 'lucide-react';

const LoginScreen = ({ onLoginSuccess }) => {
  const [view, setView] = useState('initial'); // initial, login, register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const users = await userService.getUsers();
      setRegisteredUsers(users);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return alert("Ingresá tu contraseña");
    try {
      const res = await userService.login(selectedUser, password);
      if (res.success) {
        onLoginSuccess(selectedUser);
      }
    } catch (error) {
      alert("❌ Contraseña incorrecta");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password) return alert("Campos incompletos");
    if (password.length < 8) return alert("Mínimo 8 caracteres.");
    if (password !== confirmPassword) return alert("Las contraseñas no coinciden");

    try {
      const res = await userService.register(username, password);
      if (res.success) {
        alert("✅ Cuenta creada");
        onLoginSuccess(username);
      }
    } catch (error) {
      alert("Ese usuario ya existe");
    }
  };

  const handleDeleteUser = async (userToDelete, event) => {
    event.stopPropagation();
    if (!window.confirm(`¿Eliminar usuario ${userToDelete}?`)) return;
    try {
      await userService.deleteUser(userToDelete);
      loadUsers();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const renderInitial = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <div className="login-logo"><Briefcase size={80} className="mx-auto text-primary" /></div>
      <h2 className="text-2xl font-bold text-primary mb-2">Billetera Virtual</h2>
      <p className="login-subtitle">Tu gestor de finanzas personales</p>

      {registeredUsers.length > 0 && (
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-3">Seleccioná tu usuario</p>
          <div className="flex flex-wrap justify-center gap-2">
            {registeredUsers.map(u => (
              <div key={u} className="chip-usuario flex items-center bg-primary-light rounded-full pl-3 pr-2 py-1 cursor-pointer">
                <span onClick={() => { setSelectedUser(u); setView('login'); }}>{u}</span>
                <button className="ml-2 hover:bg-danger hover:text-white rounded-full p-1 transition-colors" onClick={(e) => handleDeleteUser(u, e)}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="login-divisor my-6 flex items-center justify-center gap-4 text-xs font-bold uppercase text-muted-foreground">
            <span className="w-full h-px bg-slate-200"></span>
            <span>o</span>
            <span className="w-full h-px bg-slate-200"></span>
          </div>
        </div>
      )}

      <button className="btn-login btn-register-outline flex items-center justify-center gap-2" onClick={() => setView('register')}>
        <Plus size={18} /> Crear cuenta nueva
      </button>
    </motion.div>
  );

  const renderLogin = () => (
    <motion.form 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleLogin}
      className="w-full"
    >
      <button type="button" className="text-muted text-sm flex items-center gap-1 mb-4" onClick={() => setView('initial')}>
        <ArrowLeft size={16} /> Volver
      </button>
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">👤</div>
        <h2 className="text-2xl font-bold text-primary">{selectedUser}</h2>
        <p className="text-muted text-sm">Ingresá tu contraseña para continuar</p>
      </div>

      <div className="login-form-group">
        <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Contraseña</label>
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} 
            className="w-full p-3 bg-white/60 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <button type="submit" className="btn-login w-full bg-primary text-white p-4 rounded-xl font-bold mt-6 hover:translate-y--0.5 shadow-lg shadow-primary/20 transition-all">
        Ingresar →
      </button>
    </motion.form>
  );

  const renderRegister = () => (
    <motion.form 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleRegister}
      className="w-full"
    >
      <button type="button" className="text-muted text-sm flex items-center gap-1 mb-4" onClick={() => setView('initial')}>
        <ArrowLeft size={16} /> Volver
      </button>
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">✨</div>
        <h2 className="text-2xl font-bold text-primary">Nueva cuenta</h2>
        <p className="text-muted text-sm">Crea tu usuario y elegí un PIN</p>
      </div>

      <div className="login-form-group mb-4">
        <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Nombre de usuario</label>
        <input 
          type="text" 
          className="w-full p-3 bg-white/60 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all"
          placeholder="Ej: Jonathan"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="login-form-group mb-4">
        <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Contraseña (mín. 8 char)</label>
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} 
            className="w-full p-3 bg-white/60 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all"
            placeholder="Mín. 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="login-form-group">
        <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Confirmar Contraseña</label>
        <input 
          type="password" 
          className="w-full p-3 bg-white/60 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all"
          placeholder="Repetí la contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-login w-full bg-primary text-white p-4 rounded-xl font-bold mt-6 shadow-lg shadow-primary/20 hover:translate-y--0.5 transition-all">
        Crear cuenta →
      </button>
    </motion.form>
  );

  return (
    <div id="login-screen" className="flex">
      {/* Left Panel */}
      <div className="login-presentation flex-1.3 flex flex-col items-center justify-center p-12 text-white relative">
        <div className="presentation-advice max-w-md w-full bg-white/10 backdrop-blur-xl border-l-4 border-success p-6 rounded-r-2xl mb-12 shadow-2xl">
          <div className="text-3xl">💡</div>
          <div className="advice-content">
            <strong className="block text-white text-sm mb-1 uppercase tracking-tight">CONSEJO:</strong>
            <p className="text-white/80 text-sm leading-relaxed">
              ¿Quieres tener el control real de tu plata? Usa esta billetera para registrar lo que gastas día a día, y descubre en qué se te va el sueldo.
            </p>
          </div>
        </div>

        <h1 className="presentation-title text-7xl font-bold leading-tight tracking-tighter mb-4 text-center">
          Tus finanzas,<br />bajo control.
        </h1>
        <p className="presentation-subtitle text-lg text-white/70 mb-12 max-w-md text-center">
          Tu Billetera Virtual rápida, privada y estéticamente moderna.
        </p>

        <div className="presentation-features space-y-6 w-full max-w-sm">
          {[
            { icon: <Lock />, title: "100% Segura", desc: "Encriptación local y personal." },
            { icon: <BarChart3 />, title: "Monitoreo Preciso", desc: "Analizá tus ingresos y ahorros." },
            { icon: <Palette />, title: "Personalización", desc: "Diseño Glassmorphism único." }
          ].map((f, i) => (
            <div key={i} className="feature-item p-4 bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl flex items-center gap-4 hover:translate-x-2 transition-transform">
              <div className="feature-icon bg-white/20 p-2 rounded-lg">{f.icon}</div>
              <div>
                <strong className="block text-sm">{f.title}</strong>
                <p className="text-xs text-white/60">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-10 left-10 flex items-center gap-4 text-white/50 text-sm italic">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-bold text-white border border-white/20">Z</div>
          <span>Desarrollado por <strong>Zaviso</strong></span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-box-wrapper flex-1 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 backdrop-blur-2xl px-12 py-16 flex items-center justify-center border-l border-white/50">
        <div className="login-box max-w-sm w-full">
          <AnimatePresence mode="wait">
            {view === 'initial' && renderInitial()}
            {view === 'login' && renderLogin()}
            {view === 'register' && renderRegister()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

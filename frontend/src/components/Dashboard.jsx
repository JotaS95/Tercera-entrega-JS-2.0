import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  History, 
  Plus, 
  Trash2, 
  Download, 
  Settings, 
  Image as ImageIcon,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { dataService, userService } from '../services/api';
import { utils, writeFile } from 'xlsx';

const Dashboard = ({ user, userData, onLogout, onRefresh }) => {
  const [description, setDescription] = useState('');
  const [monto, setMonto] = useState('');
  const [tipo, setTipo] = useState('gasto');
  const [presupuestoInput, setPresupuestoInput] = useState('');

  const { transacciones, presupuesto, fondo } = userData;

  const totalIngresos = transacciones.filter(t => t.tipo === "ingreso").reduce((acc, t) => acc + t.monto, 0);
  const totalGastos = transacciones.filter(t => t.tipo === "gasto").reduce((acc, t) => acc + t.monto, 0);
  const balance = presupuesto + totalIngresos - totalGastos;

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!description || !monto) return alert("Completa los campos");
    
    const nueva = {
      id: Date.now(),
      descripcion: description,
      monto: parseFloat(monto.toString().replace(',', '.')),
      tipo: tipo
    };

    const updatedTransacciones = [...transacciones, nueva];
    await dataService.saveData(user, { transacciones: updatedTransacciones });
    setDescription('');
    setMonto('');
    onRefresh();
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("¿Eliminar este movimiento?")) return;
    const updated = transacciones.filter(t => t.id !== id);
    await dataService.saveData(user, { transacciones: updated });
    onRefresh();
  };

  const handleUpdatePresupuesto = async () => {
    const val = parseFloat(presupuestoInput.replace(',', '.'));
    if (isNaN(val) || val < 0) return alert("Monto inválido");
    await dataService.saveData(user, { presupuesto: val });
    setPresupuestoInput('');
    onRefresh();
  };

  const handleCleanData = async (type) => {
    const opts = {
      historial: { transacciones: [] },
      presupuesto: { presupuesto: 0 },
      gastos: { transacciones: transacciones.filter(t => t.tipo === "ingreso") },
      todo: { transacciones: [], presupuesto: 0 }
    };
    if (!window.confirm("¿Estás seguro de realizar esta limpieza?")) return;
    await dataService.saveData(user, opts[type] || {});
    onRefresh();
  };

  const exportToExcel = (filename, data) => {
    const worksheet = utils.json_to_sheet(data.map(t => ({
      Fecha: new Date(t.id).toLocaleDateString(),
      Descripción: t.descripcion,
      Tipo: t.tipo,
      Monto: t.monto
    })));
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Transacciones");
    writeFile(workbook, `Billetera_${filename}.xlsx`);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Navbar */}
      <nav className="navbar px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
            <Wallet size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">Billetera</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-100/50 p-1.5 pr-4 rounded-full border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              {user.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-sm">{user}</span>
          </div>
          <button className="flex items-center gap-2 p-2 px-4 rounded-full bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all text-sm font-bold" onClick={onLogout}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden app-container">
        {/* Sidebar History */}
        <aside className="sidebar-historial w-80 bg-white/40 backdrop-blur-xl border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-slate-600"><History size={18} /> HISTORIAL</h3>
              <button 
                onClick={() => exportToExcel(`Reporte_${user}`, transacciones)}
                className="p-1 px-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center gap-1 text-[10px] uppercase font-bold"
              >
                <FileSpreadsheet size={12} /> Exportar
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {transacciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 opacity-30">
                <History size={40} />
                <p className="text-xs mt-2">Sin movimientos</p>
              </div>
            ) : (
              transacciones.slice().reverse().map(t => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`mov-card p-3 rounded-xl flex items-center gap-3 border-l-4 ${t.tipo === 'gasto' ? 'border-danger bg-danger-light/50' : 'border-success bg-success-light/50'}`}
                  key={t.id}
                >
                  <div className={`p-2 rounded-lg ${t.tipo === 'gasto' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                    {t.tipo === 'gasto' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold truncate leading-tight">{t.descripcion}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(t.id).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${t.tipo === 'gasto' ? 'text-danger' : 'text-success'}`}>
                      {t.tipo === 'gasto' ? '-' : '+'}${t.monto.toLocaleString()}
                    </p>
                    <button onClick={() => handleDeleteTransaction(t.id)} className="text-muted opacity-0 hover:opacity-100 hover:text-danger p-1 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-3 bg-gradient-to-r from-primary to-blue-600 p-8 rounded-3xl text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-white/60 text-xs uppercase tracking-widest font-bold mb-1">Balance Actual</p>
                <h2 className="text-5xl font-black mb-2">${balance.toLocaleString()}</h2>
                {presupuesto > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((totalGastos/(presupuesto+totalIngresos))*100, 100)}%` }}
                        className={`h-full ${totalGastos > presupuesto + totalIngresos ? 'bg-red-400' : 'bg-emerald-400'}`}
                      />
                    </div>
                    <span className="text-xs font-bold">{Math.round((totalGastos/(presupuesto+totalIngresos))*100)}%</span>
                  </div>
                )}
              </div>
              <div className="absolute -right-20 -bottom-20 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Wallet size={300} />
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-xl flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-2xl text-amber-600"><AlertCircle size={24} /></div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Presupuesto</p>
                <p className="text-xl font-bold">${presupuesto.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-xl flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600"><TrendingUp size={24} /></div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Ingresos</p>
                <p className="text-xl font-bold text-emerald-600">+${totalIngresos.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-xl flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-2xl text-red-600"><TrendingDown size={24} /></div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Gastos</p>
                <p className="text-xl font-bold text-red-600">-${totalGastos.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* New Transaction Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/50 shadow-2xl">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Plus className="text-primary" /> Nueva Transacción</h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Descripción</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Ej: Almuerzo, Sueldo..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Monto</label>
                    <input 
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="0.00"
                      type="text"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Tipo</label>
                    <select 
                      className="bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                    >
                      <option value="gasto">💸 Gasto</option>
                      <option value="ingreso">💰 Ingreso</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-primary text-white p-4 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">
                  Registrar Movimiento
                </button>
              </form>
            </div>

            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/50 shadow-xl">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-amber-600"><AlertCircle size={18} /> Definir Presupuesto</h3>
                <div className="flex gap-3">
                  <input 
                    className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Ej: 50000"
                    value={presupuestoInput}
                    onChange={(e) => setPresupuestoInput(e.target.value)}
                  />
                  <button onClick={handleUpdatePresupuesto} className="bg-slate-800 text-white px-6 rounded-xl font-bold hover:bg-black transition-all">
                    Guardar
                  </button>
                </div>
              </div>

              <div className="bg-red-50/50 backdrop-blur-xl p-8 rounded-3xl border border-red-100 shadow-sm">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-red-600"><Trash2 size={18} /> Zona de Limpieza</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['todo', 'historial', 'presupuesto', 'gastos'].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleCleanData(opt)}
                      className="p-2 border border-red-200 text-red-600 rounded-xl text-[10px] font-bold uppercase hover:bg-red-600 hover:text-white transition-all"
                    >
                      Limpiar {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Percent, 
  Calendar,
  Loader2,
  Lock,
  Moon
} from 'lucide-react';

interface Coupon {
  id: number;
  code: string;
  discount: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  isExpired?: boolean;
  status?: 'active' | 'expired';
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [durationValue, setDurationValue] = useState('24');
  const [durationUnit, setDurationUnit] = useState('hours'); // 'hours' or 'days'
  
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Ticker to refresh remaining time displays
  const [timeTicker, setTimeTicker] = useState(0);

  useEffect(() => {
    fetchCoupons();
    
    // Setup interval to update countdown displays every 30 seconds
    const interval = setInterval(() => {
      setTimeTicker(prev => prev + 1);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupons');
      const data = await response.json();
      if (response.ok) {
        setCoupons(data);
      } else {
        console.error('Failed to fetch coupons:', data.error);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!code.trim() || !discount.trim()) {
      setErrorMessage('Por favor, preencha o nome do cupom e o desconto.');
      return;
    }

    const value = Number(durationValue);
    if (isNaN(value) || value <= 0) {
      setErrorMessage('A duração deve ser um número maior que zero.');
      return;
    }

    // Convert days to hours
    const durationHours = durationUnit === 'days' ? value * 24 : value;

    try {
      setSubmitting(true);
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
          discount: discount.trim(),
          durationHours,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCode('');
        setDiscount('');
        setDurationValue('24');
        setDurationUnit('hours');
        setSuccessMessage(`Cupom "${data.code}" criado com sucesso!`);
        fetchCoupons(); // Refresh the list
      } else {
        setErrorMessage(data.error || 'Ocorreu um erro ao criar o cupom.');
      }
    } catch (err) {
      console.error('Create coupon error:', err);
      setErrorMessage('Erro de conexão ao criar cupom.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('Tem certeza de que deseja deletar este cupom?')) return;
    
    try {
      setDeletingId(id);
      const response = await fetch(`/api/coupons?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCoupons(prev => prev.filter(c => c.id !== id));
      } else {
        alert('Falha ao deletar o cupom.');
      }
    } catch (err) {
      console.error('Delete coupon error:', err);
      alert('Erro de conexão ao deletar cupom.');
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Helper to format remaining time text
  const getRemainingTimeText = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expirado';

    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

    return `Ativo por mais ${parts.join(' ')}`;
  };

  // Calculate metrics
  const now = new Date();
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => new Date(c.expiresAt) > now).length;
  const expiredCoupons = totalCoupons - activeCoupons;

  return (
    <div className="min-h-screen bg-[#09090B] text-[#F4F4F5] relative overflow-hidden flex flex-col justify-between">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#5865F2]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#5865F2]/5 blur-[100px] pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="glassmorphism-nav py-5 shadow-lg relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-discord-purple flex items-center justify-center glow-purple">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              Danone<span className="text-discord-purple">Vendas</span> <span className="font-light text-zinc-400">| Cupons</span>
            </span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-950/80 border border-white/5 py-1.5 px-3 rounded-full text-xs text-green-400 font-mono shadow-md glassmorphism">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span>Gerenciador de Cupons Ativo</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Create Coupon Form & Analytics */}
        <div className="lg:col-span-5 space-y-6 w-full">
          
          {/* ANALYTICS BOARD */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* Total */}
            <div className="p-4 rounded-[18px] bg-zinc-900/60 border border-white/5 text-center glassmorphism">
              <span className="text-xs font-semibold text-zinc-500 block mb-1">Total</span>
              <span className="text-2xl font-black text-white">{totalCoupons}</span>
            </div>

            {/* Active */}
            <div className="p-4 rounded-[18px] bg-zinc-900/60 border border-white/5 text-center glassmorphism">
              <span className="text-xs font-semibold text-zinc-500 block mb-1">Ativos</span>
              <span className="text-2xl font-black text-green-400">{activeCoupons}</span>
            </div>

            {/* Expired */}
            <div className="p-4 rounded-[18px] bg-zinc-900/60 border border-white/5 text-center glassmorphism">
              <span className="text-xs font-semibold text-zinc-500 block mb-1">Expirados</span>
              <span className="text-2xl font-black text-red-400">{expiredCoupons}</span>
            </div>

          </div>

          {/* CREATE FORM CARD */}
          <div className="p-8 rounded-[24px] bg-zinc-900/60 border border-white/5 glassmorphism shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[30%] h-[50%] bg-discord-purple/5 blur-[50px] pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-discord-purple/10 border border-discord-purple/20 text-discord-purple">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Criar Novo Cupom</h2>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCoupon} className="space-y-5">
              
              {/* Nome do cupom */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nome do Cupom</label>
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="EX: DANONE20"
                  className="w-full bg-zinc-950/80 border border-white/5 focus:border-discord-purple/60 focus:ring-1 focus:ring-discord-purple/60 rounded-xl px-4 py-3 text-sm text-white font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Valor do desconto */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Desconto</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="EX: 20% ou R$ 10"
                    className="w-full bg-zinc-950/80 border border-white/5 focus:border-discord-purple/60 focus:ring-1 focus:ring-discord-purple/60 rounded-xl pl-11 pr-4 py-3 text-sm text-white font-bold placeholder:font-normal focus:outline-none transition-all"
                    required
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Tempo ativo */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tempo Ativo (Duração)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    min="1"
                    value={durationValue}
                    onChange={(e) => setDurationValue(e.target.value)}
                    className="w-[40%] bg-zinc-950/80 border border-white/5 focus:border-discord-purple/60 focus:ring-1 focus:ring-discord-purple/60 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none transition-all text-center"
                    required
                  />
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                    className="flex-1 bg-zinc-950/80 border border-white/5 focus:border-discord-purple/60 focus:ring-1 focus:ring-discord-purple/60 rounded-xl px-4 py-3 text-sm text-zinc-300 font-semibold focus:outline-none transition-all"
                  >
                    <option value="hours">Horas</option>
                    <option value="days">Dias</option>
                  </select>
                </div>
              </div>

              {/* Messages */}
              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium"
                  >
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-discord-purple hover:bg-discord-purple-hover disabled:bg-discord-purple/40 text-white font-bold transition-all duration-300 hover:shadow-lg hover:shadow-discord-purple/20 cursor-pointer disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Criando Cupom...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Criar Cupom de Desconto</span>
                  </>
                )}
              </button>

            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: Active Coupons List */}
        <div className="lg:col-span-7 w-full space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Cupons Cadastrados</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-400 font-semibold border border-white/5">
                {coupons.length}
              </span>
            </h2>
          </div>

          {loading ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-discord-purple animate-spin" />
              <p className="text-sm text-zinc-500">Buscando cupons salvos no banco...</p>
            </div>
          ) : coupons.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[24px] bg-zinc-900/30 border border-dashed border-white/5 text-center glassmorphism">
              <div className="p-4 rounded-full bg-zinc-900 border border-white/5 text-zinc-500 mb-4">
                <Ticket className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Nenhum cupom ativo</h3>
              <p className="text-sm text-zinc-500 max-w-sm">
                Use o formulário ao lado para cadastrar cupons de desconto. Eles estarão visíveis instantaneamente.
              </p>
            </div>
          ) : (
            /* Coupons Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map((coupon) => {
                const expired = new Date(coupon.expiresAt) < now;
                const remainingText = getRemainingTimeText(coupon.expiresAt);
                
                return (
                  <motion.div
                    key={coupon.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-5 rounded-[18px] bg-zinc-900/40 border transition-all duration-300 flex flex-col justify-between gap-4 glassmorphism ${
                      expired ? 'border-red-500/10 opacity-60' : 'border-white/5 hover:border-discord-purple/20'
                    }`}
                  >
                    {/* Header: Code & Discount */}
                    <div className="flex justify-between items-start gap-4">
                      
                      {/* Code Name */}
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black tracking-widest text-white truncate">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                            title="Copiar Código"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-xs text-zinc-500">
                          Criado em {new Date(coupon.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {/* Discount Badge */}
                      <span className="px-2.5 py-1 rounded-lg bg-discord-purple/15 border border-discord-purple/20 text-discord-purple text-xs font-black shrink-0">
                        {coupon.discount} OFF
                      </span>

                    </div>

                    {/* Expiry Details & Delete Action */}
                    <div className="flex justify-between items-center gap-4 pt-3 border-t border-white/5">
                      
                      {/* Time indicators */}
                      <div className="flex items-center gap-2 text-xs font-medium">
                        {expired ? (
                          <span className="flex items-center gap-1 text-red-400 bg-red-400/5 px-2.5 py-1 rounded-full border border-red-400/15 uppercase font-bold text-[10px] tracking-wider">
                            Expirado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-zinc-400">
                            <Clock className="w-3.5 h-3.5 text-discord-purple" />
                            <span>{remainingText}</span>
                          </span>
                        )}
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        disabled={deletingId === coupon.id}
                        className="p-2 rounded-xl bg-zinc-950 border border-white/5 hover:border-red-500/40 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                        title="Deletar Cupom"
                      >
                        {deletingId === coupon.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>

                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-zinc-950 border-t border-white/5 py-8 text-center text-xs text-zinc-600 relative z-10 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} DanoneVendas • Painel Administrativo de Cupons.</span>
          <span className="flex items-center gap-1 text-zinc-700 font-mono"><Lock className="w-3 h-3" /> Conexão Criptografada Neon DB</span>
        </div>
      </footer>

    </div>
  );
}

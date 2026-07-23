import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { adicionarSegundosDataHoraLocal } from '../lib/dateTime';

interface AddEventoFormProps {
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export function AddEventoForm({ onClose, onSaved }: AddEventoFormProps) {
  const [titulo, setTitulo] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [referente, setReferente] = useState('');
  const [projetoId, setProjetoId] = useState('nenhum');
  const [localOuLink, setLocalOuLink] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session?.user?.id) {
      alert('Sua sessão expirou. Faça login novamente para adicionar um compromisso.');
      return;
    }

    const referenteA = referente;
    const local = localOuLink;
    const dataHoraSemConversao = adicionarSegundosDataHoraLocal(dataHora);

    const payload = {
      titulo: titulo,
      data_hora: dataHoraSemConversao,
      referente_a: referenteA,
      local: local || null,
      projeto_id: projetoId === 'nenhum' ? null : projetoId,
      criado_por: session?.user?.id,
      organizador_id: session?.user?.id,
    };

    const { data, error } = await supabase
      .from('calendario_reunioes')
      .insert([payload])
      .select();

    if (error) {
      alert('Erro ao salvar compromisso: ' + error.message);
      return;
    }

    if (data) {
      setTitulo('');
      setDataHora('');
      setReferente('');
      setProjetoId('nenhum');
      setLocalOuLink('');
      onClose();
      await onSaved();
    }
  };

  const referentes = ['CLUBE', 'DISTRITO', 'ROTARACT BRASIL'];
  const projetosExemplo = [
    { id: '1', nome: 'Campanha do Agasalho' },
    { id: '2', nome: 'Mentoria Profissional' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg md:bg-black/50 md:backdrop-blur-sm md:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
        <header className="flex items-start justify-between gap-4 mb-6">
          <h2 className="font-bold text-xl text-gray-900">Novo Compromisso</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        <form id="add-evento-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">
                  Título do Evento
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Reunião Ordinária"
                  className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                  required
                />
          </div>

          <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">
                    Data e Hora
                  </label>
                  <input
                    type="datetime-local"
                    value={dataHora}
                    onChange={(e) => setDataHora(e.target.value)}
                    className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                    required
                  />
          </div>

          <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">
                    Referente a
                  </label>
                  <select
                    value={referente}
                    onChange={(e) => setReferente(e.target.value)}
                    className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all appearance-none"
                    required
                  >
                    <option value="" disabled>Selecione a referência</option>
                    {referentes.map((ref) => (
                      <option key={ref} value={ref}>{ref}</option>
                    ))}
                  </select>
          </div>

          <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">
                    Projeto Vinculado
                  </label>
                  <select
                    value={projetoId}
                    onChange={(e) => setProjetoId(e.target.value)}
                    className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all appearance-none"
                  >
                    <option value="nenhum">Nenhum projeto (Avulso)</option>
                    {projetosExemplo.map((proj) => (
                      <option key={proj.id} value={proj.id}>{proj.nome}</option>
                    ))}
                  </select>
          </div>

          <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">
                    Local ou Link
                  </label>
                  <input
                    type="text"
                    value={localOuLink}
                    onChange={(e) => setLocalOuLink(e.target.value)}
                    placeholder="Ex: Sede do Clube, Sala 302 ou https://meet.google.com/..."
                    className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                  />
          </div>

          <button
            type="submit"
            form="add-evento-form"
            className="w-full md:col-span-2 bg-[#E31C59] hover:bg-[#c41549] text-white font-medium py-3.5 rounded-xl text-sm transition-all shadow-sm active:scale-[0.99] mt-2"
          >
            Adicionar à Agenda
          </button>
        </form>
      </div>
    </div>
  );
}

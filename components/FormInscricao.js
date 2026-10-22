'use client';
import { useEffect, useState } from 'react';

export default function FormInscricao({ eventos, participantes, onInscrever, eventoInicialId }) {
  const [eventoId, setEventoId] = useState('');
  const [participanteId, setParticipanteId] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (eventoInicialId) setEventoId(String(eventoInicialId));
  }, [eventoInicialId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!eventoId || !participanteId) return;
    setEnviando(true);
    try {
      await onInscrever(eventoId, participanteId);
      setParticipanteId('');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Realizar inscrição</h2>
      <div><label htmlFor="inscricao-evento">Evento</label>
        <select id="inscricao-evento" value={eventoId} onChange={(e) => setEventoId(e.target.value)} required>
          <option value="">Selecione um evento</option>
          {eventos.map((ev) => <option key={ev.id} value={ev.id} disabled={Number(ev.vagas_restantes) <= 0}>{ev.titulo}{Number(ev.vagas_restantes) <= 0 ? ' (Lotado)' : ''}</option>)}
        </select>
      </div>
      <div><label htmlFor="inscricao-participante">Participante</label>
        <select id="inscricao-participante" value={participanteId} onChange={(e) => setParticipanteId(e.target.value)} required>
          <option value="">Selecione um participante</option>
          {participantes.map((p) => <option key={p.id} value={p.id}>{p.nome} — {p.turma}</option>)}
        </select>
      </div>
      <button type="submit" disabled={enviando || eventos.length === 0 || participantes.length === 0}>{enviando ? 'Inscrevendo…' : 'Confirmar inscrição'}</button>
      {participantes.length === 0 && <p className="form-hint">Cadastre um participante antes de realizar a inscrição.</p>}
    </form>
  );
}
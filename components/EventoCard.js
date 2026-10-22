'use client';
import { useState } from 'react';
import { getInscritos } from '@/lib/api';

export default function EventoCard({ evento, onInscrever, onMensagem }) {
  const lotado = Number(evento.vagas_restantes) <= 0;
  const [inscritos, setInscritos] = useState([]);
  const [mostrarInscritos, setMostrarInscritos] = useState(false);
  const [carregandoInscritos, setCarregandoInscritos] = useState(false);

  async function handleVerInscritos() {
    if (!mostrarInscritos) {
      setCarregandoInscritos(true);
      try {
        const dados = await getInscritos(evento.id);
        setInscritos(dados);
        onMensagem?.(null);
      } catch (err) {
        onMensagem?.({ tipo: 'erro', texto: 'Não foi possível carregar os inscritos deste evento.' });
      } finally {
        setCarregandoInscritos(false);
      }
    }
    setMostrarInscritos(!mostrarInscritos);
  }

  const dataFormatada = new Date(evento.data_evento).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <article className="card event-card">
      <div className="event-card-top"><span className="tag">{evento.categoria}</span><span className={`seat-status ${lotado ? 'seat-full' : ''}`}>{lotado ? 'Lotado' : `${evento.vagas_restantes} vagas`}</span></div>
      <h3>{evento.titulo}</h3>
      <p className="event-description">{evento.descricao}</p>
      <div className="event-meta"><span>{dataFormatada}</span><span>{evento.local}</span></div>
      <div className="event-actions">
        <button type="button" className="button-primary" onClick={() => onInscrever?.(evento.id)} disabled={lotado}>{lotado ? 'Evento lotado' : 'Inscrever-se'}</button>
        <button type="button" className="button-secondary" onClick={handleVerInscritos} disabled={carregandoInscritos}>{carregandoInscritos ? 'Carregando…' : mostrarInscritos ? 'Ocultar inscritos' : 'Ver inscritos'}</button>
      </div>
      {mostrarInscritos && (
        <ul className="event-attendees">{inscritos.length === 0 ? <li>Nenhum inscrito ainda.</li> : inscritos.map((p) => <li key={p.id}>{p.nome} <span>{p.turma}</span></li>)}</ul>
      )}
    </article>
  );
}
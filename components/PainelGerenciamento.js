'use client';
import { useState } from 'react';
import { atualizarParticipante, criarEvento, excluirEvento, excluirParticipante } from '@/lib/api';

const estadoVazio = { titulo: '', descricao: '', data_evento: '', local: '', vagas: '', categoria_id: '' };

export default function PainelGerenciamento({ eventos, participantes, categorias, onRefresh, onMensagem }) {
  const [formEvento, setFormEvento] = useState(estadoVazio);
  const [salvandoEvento, setSalvandoEvento] = useState(false);
  const [participanteEditando, setParticipanteEditando] = useState(null);
  const [formParticipante, setFormParticipante] = useState({ nome: '', email: '', turma: '' });
  const [salvandoParticipante, setSalvandoParticipante] = useState(false);

  function atualizarEvento(campo, valor) {
    setFormEvento((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleCriarEvento(evento) {
    evento.preventDefault();
    setSalvandoEvento(true);
    try {
      const payload = { ...formEvento, vagas: Number(formEvento.vagas), categoria_id: Number(formEvento.categoria_id), data_evento: formEvento.data_evento.replace('T', ' ') + ':00' };
      const resultado = await criarEvento(payload);
      if (!resultado.ok) {
        onMensagem({ tipo: 'erro', texto: resultado.data?.erro || 'Não foi possível cadastrar o evento.' });
        return;
      }
      setFormEvento(estadoVazio);
      await onRefresh();
      onMensagem({ tipo: 'sucesso', texto: 'Evento cadastrado com sucesso!' });
    } catch {
      onMensagem({ tipo: 'erro', texto: 'Não foi possível conectar à API para cadastrar o evento.' });
    } finally {
      setSalvandoEvento(false);
    }
  }

  async function handleExcluirEvento(evento) {
    if (!window.confirm(`Excluir “${evento.titulo}”? As inscrições desse evento também serão removidas.`)) return;
    try {
      const resultado = await excluirEvento(evento.id);
      if (!resultado.ok) {
        onMensagem({ tipo: 'erro', texto: resultado.data?.erro || 'Não foi possível excluir o evento.' });
        return;
      }
      await onRefresh();
      onMensagem({ tipo: 'sucesso', texto: 'Evento excluído com sucesso.' });
    } catch {
      onMensagem({ tipo: 'erro', texto: 'Não foi possível conectar à API para excluir o evento.' });
    }
  }

  function iniciarEdicao(participante) {
    setParticipanteEditando(participante.id);
    setFormParticipante({ nome: participante.nome, email: participante.email, turma: participante.turma });
    onMensagem(null);
  }

  async function handleSalvarParticipante(evento) {
    evento.preventDefault();
    setSalvandoParticipante(true);
    try {
      const resultado = await atualizarParticipante(participanteEditando, formParticipante);
      if (!resultado.ok) {
        onMensagem({ tipo: 'erro', texto: resultado.data?.erro || 'Não foi possível atualizar o participante.' });
        return;
      }
      setParticipanteEditando(null);
      await onRefresh();
      onMensagem({ tipo: 'sucesso', texto: 'Participante atualizado com sucesso.' });
    } catch {
      onMensagem({ tipo: 'erro', texto: 'Não foi possível conectar à API para atualizar o participante.' });
    } finally {
      setSalvandoParticipante(false);
    }
  }

  async function handleExcluirParticipante(participante) {
    if (!window.confirm(`Excluir ${participante.nome}? As inscrições dessa pessoa também serão removidas.`)) return;
    try {
      const resultado = await excluirParticipante(participante.id);
      if (!resultado.ok) {
        onMensagem({ tipo: 'erro', texto: resultado.data?.erro || 'Não foi possível excluir o participante.' });
        return;
      }
      await onRefresh();
      onMensagem({ tipo: 'sucesso', texto: 'Participante excluído com sucesso.' });
    } catch {
      onMensagem({ tipo: 'erro', texto: 'Não foi possível conectar à API para excluir o participante.' });
    }
  }

  return (
    <div className="manage-layout">
      <section className="manage-box">
        <div className="manage-heading"><div><p className="eyebrow">NOVO EVENTO</p><h3>Adicionar palestra ou evento</h3></div></div>
        <form className="manage-form" onSubmit={handleCriarEvento}>
          <label>Título<input value={formEvento.titulo} onChange={(e) => atualizarEvento('titulo', e.target.value)} maxLength={120} required /></label>
          <label>Descrição<textarea value={formEvento.descricao} onChange={(e) => atualizarEvento('descricao', e.target.value)} rows={3} /></label>
          <div className="manage-form-row">
            <label>Data e horário<input type="datetime-local" value={formEvento.data_evento} onChange={(e) => atualizarEvento('data_evento', e.target.value)} required /></label>
            <label>Categoria<select value={formEvento.categoria_id} onChange={(e) => atualizarEvento('categoria_id', e.target.value)} required><option value="">Selecione</option>{categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}</select></label>
          </div>
          <div className="manage-form-row">
            <label>Local<input value={formEvento.local} onChange={(e) => atualizarEvento('local', e.target.value)} maxLength={100} required /></label>
            <label>Vagas<input type="number" min="1" value={formEvento.vagas} onChange={(e) => atualizarEvento('vagas', e.target.value)} required /></label>
          </div>
          <button type="submit" disabled={salvandoEvento || categorias.length === 0}>{salvandoEvento ? 'Salvando...' : 'Adicionar evento'}</button>
          {categorias.length === 0 && <p className="form-hint">Nenhuma categoria foi encontrada no banco.</p>}
        </form>
      </section>

      <section className="manage-box">
        <div className="manage-heading"><div><p className="eyebrow">AGENDA</p><h3>Excluir eventos</h3></div><span className="result-count">{eventos.length} eventos</span></div>
        {eventos.length === 0 ? <p className="muted-copy">Não há eventos para gerenciar.</p> : <ul className="manage-list">
          {eventos.map((evento) => <li key={evento.id} className="manage-row"><div className="manage-item-copy"><strong>{evento.titulo}</strong><small>{evento.categoria} · {evento.local} · {evento.vagas_restantes} vagas restantes</small></div><button type="button" className="button-danger" onClick={() => handleExcluirEvento(evento)}>Excluir</button></li>)}
        </ul>}
      </section>

      <section className="manage-box">
        <div className="manage-heading"><div><p className="eyebrow">COMUNIDADE</p><h3>Editar ou excluir participantes</h3></div><span className="result-count">{participantes.length} pessoas</span></div>
        {participantes.length === 0 ? <p className="muted-copy">Não há participantes para gerenciar.</p> : <ul className="manage-list">
          {participantes.map((participante) => <li key={participante.id} className="manage-row manage-person-row">
            {participanteEditando === participante.id ? <form className="participant-edit-form" onSubmit={handleSalvarParticipante}>
              <label>Nome<input value={formParticipante.nome} onChange={(e) => setFormParticipante({ ...formParticipante, nome: e.target.value })} required /></label>
              <label>E-mail<input type="email" value={formParticipante.email} onChange={(e) => setFormParticipante({ ...formParticipante, email: e.target.value })} required /></label>
              <label>Turma<input value={formParticipante.turma} onChange={(e) => setFormParticipante({ ...formParticipante, turma: e.target.value })} required /></label>
              <div className="manage-actions"><button type="submit" disabled={salvandoParticipante}>{salvandoParticipante ? 'Salvando...' : 'Salvar'}</button><button type="button" className="button-secondary" onClick={() => setParticipanteEditando(null)}>Cancelar</button></div>
            </form> : <>
              <div className="manage-item-copy"><strong>{participante.nome}</strong><small>{participante.email} · {participante.turma}</small></div>
              <div className="manage-actions"><button type="button" className="button-secondary" onClick={() => iniciarEdicao(participante)}>Editar</button><button type="button" className="button-danger" onClick={() => handleExcluirParticipante(participante)}>Excluir</button></div>
            </>}
          </li>)}
        </ul>}
      </section>
    </div>
  );
}

// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { getEventos, getParticipantes, getCategorias, inscrever } from '@/lib/api';
import EventoCard from '@/components/EventoCard';
import FormParticipante from '@/components/FormParticipante';
import FormInscricao from '@/components/FormInscricao';
import PainelGerenciamento from '@/components/PainelGerenciamento';

const secoes = [
  { id: 'eventos', numero: '01', titulo: 'Eventos' },
  { id: 'inscricoes', numero: '02', titulo: 'Inscrições' },
  { id: 'participantes', numero: '03', titulo: 'Participantes' },
  { id: 'gerenciar', numero: '04', titulo: 'Gerenciar' },
];

export default function Home() {
  const [eventos, setEventos] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mensagem, setMensagem] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('eventos');
  const [eventoSelecionado, setEventoSelecionado] = useState('');
  const [carregando, setCarregando] = useState(true);

  async function carregarDados(tentativa = 0) {
    try {
      const [evs, parts, cats] = await Promise.all([getEventos(), getParticipantes(), getCategorias()]);
      setEventos(evs);
      setParticipantes(parts);
      setCategorias(cats);
      setMensagem((anterior) => anterior?.tipo === 'erro' ? null : anterior);
      setCarregando(false);
      return true;
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível carregar os dados. Confira se a API e o banco estão ligados.' });
      setCarregando(false);
      if (tentativa < 1) window.setTimeout(() => carregarDados(tentativa + 1), 1500);
      return false;
    }
  }

  useEffect(() => { carregarDados(); }, []);

  async function handleInscrever(eventoId, participanteId) {
    try {
      const { ok, dados } = await inscrever(eventoId, participanteId);
      if (!ok) {
        setMensagem({ tipo: 'erro', texto: dados.erro || 'Não foi possível concluir a inscrição.' });
        return;
      }
      setMensagem({ tipo: 'sucesso', texto: 'Inscrição realizada com sucesso!' });
      await carregarDados();
      setEventoSelecionado('');
      setAbaAtiva('eventos');
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível conectar à API para realizar a inscrição.' });
    }
  }

  async function handleParticipanteCadastrado() {
    const atualizou = await carregarDados();
    if (atualizou) setMensagem({ tipo: 'sucesso', texto: 'Participante cadastrado com sucesso!' });
  }

  function abrirInscricao(eventoId) {
    setEventoSelecionado(String(eventoId));
    setMensagem(null);
    setAbaAtiva('inscricoes');
  }

  const vagasAbertas = eventos.reduce((total, evento) => total + Math.max(0, Number(evento.vagas_restantes) || 0), 0);

  return (
    <main className="dashboard">
      <header className="page-header">
        <div className="brand-line"><span className="brand-mark">E</span><span>PORTAL DE EVENTOS <i>·</i> SENAI</span></div>
        <p className="eyebrow">CONECTE-SE. PARTICIPE. APRENDA.</p>
        <h1>EventoSENAI</h1>
        <p className="page-intro">Encontre experiências, faça sua inscrição e acompanhe a comunidade.</p>
      </header>

      <section className="overview" aria-label="Resumo">
        <div className="overview-card overview-pink"><span className="overview-icon">✦</span><div><strong>{eventos.length}</strong><span>eventos disponíveis</span></div></div>
        <div className="overview-card overview-blue"><span className="overview-icon">◎</span><div><strong>{participantes.length}</strong><span>participantes</span></div></div>
        <div className="overview-card overview-red"><span className="overview-icon">↗</span><div><strong>{vagasAbertas}</strong><span>vagas abertas</span></div></div>
      </section>

      <nav className="dashboard-nav" aria-label="Navegação principal" role="tablist">
        {secoes.map((secao) => (
          <button key={secao.id} id={`aba-${secao.id}`} type="button" role="tab"
            aria-selected={abaAtiva === secao.id} aria-controls={`painel-${secao.id}`}
            className={`nav-tab ${abaAtiva === secao.id ? 'is-active' : ''}`}
            onClick={() => setAbaAtiva(secao.id)}>
            <span className="nav-number">{secao.numero}</span>{secao.titulo}
          </button>
        ))}
      </nav>

      {mensagem && <div className={`notice notice-${mensagem.tipo}`} role="status" aria-live="polite"><span>{mensagem.texto}</span>{mensagem.tipo === 'erro' && <button type="button" onClick={() => carregarDados()} className="notice-retry">Tentar novamente</button>}</div>}

      <section id="painel-eventos" className="content-panel" role="tabpanel" aria-labelledby="aba-eventos" hidden={abaAtiva !== 'eventos'}>
        <div className="section-heading">
          <div><p className="eyebrow">DESCUBRA ALGO NOVO</p><h2>Próximos eventos</h2><p>Escolha a próxima experiência para fazer parte.</p></div>
          <span className="result-count">{eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}</span>
        </div>
        {carregando ? <div className="empty-state">Carregando eventos...</div> : eventos.length === 0 ? <div className="empty-state">Ainda não há eventos disponíveis.</div> : (
          <section className="grid" aria-label="Lista de eventos">
            {eventos.map((ev) => <EventoCard key={ev.id} evento={ev} onInscrever={abrirInscricao} onMensagem={setMensagem} />)}
          </section>
        )}
      </section>

      <section id="painel-inscricoes" className="content-panel" role="tabpanel" aria-labelledby="aba-inscricoes" hidden={abaAtiva !== 'inscricoes'}>
        <div className="section-heading"><div><p className="eyebrow">SEU PRÓXIMO PASSO</p><h2>Faça sua inscrição</h2><p>Selecione um evento e identifique o participante.</p></div></div>
        <div className="form-layout"><FormInscricao eventos={eventos} participantes={participantes} onInscrever={handleInscrever} eventoInicialId={eventoSelecionado} /></div>
      </section>

      <section id="painel-participantes" className="content-panel" role="tabpanel" aria-labelledby="aba-participantes" hidden={abaAtiva !== 'participantes'}>
        <div className="section-heading"><div><p className="eyebrow">NOSSA COMUNIDADE</p><h2>Participantes</h2><p>Cadastre-se para participar dos eventos.</p></div><span className="result-count">{participantes.length} cadastrados</span></div>
        <div className="participants-layout">
          <div className="form-layout"><FormParticipante onCadastrado={handleParticipanteCadastrado} onMensagem={setMensagem} /></div>
          <aside className="people-panel"><h3>Quem já está por aqui</h3>
            {participantes.length === 0 ? <p className="muted-copy">Os participantes cadastrados aparecerão aqui.</p> : (
              <ul className="people-list">{participantes.map((p) => <li key={p.id}><span className="avatar">{p.nome?.charAt(0)?.toUpperCase()}</span><span><strong>{p.nome}</strong><small>{p.turma}</small></span></li>)}</ul>
            )}
          </aside>
        </div>
      </section>
      <section id="painel-gerenciar" className="content-panel" role="tabpanel" aria-labelledby="aba-gerenciar" hidden={abaAtiva !== 'gerenciar'}>
        <div className="section-heading"><div><p className="eyebrow">ÁREA DE ORGANIZAÇÃO</p><h2>Gerenciar o portal</h2><p>Cadastre palestras e mantenha eventos e participantes atualizados.</p></div></div>
        <PainelGerenciamento eventos={eventos} participantes={participantes} categorias={categorias} onRefresh={carregarDados} onMensagem={setMensagem} />
      </section>
    </main>
  );
}



'use client';
import { useState } from 'react';
import { cadastrarParticipante } from '@/lib/api';

export default function FormParticipante({ onCadastrado, onMensagem }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [turma, setTurma] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    try {
      const { ok, dados } = await cadastrarParticipante(nome, email, turma);
      if (!ok) {
        onMensagem?.({ tipo: 'erro', texto: dados.erro || 'Não foi possível cadastrar o participante.' });
        return;
      }
      setNome(''); setEmail(''); setTurma('');
      await onCadastrado?.();
    } catch (err) {
      onMensagem?.({ tipo: 'erro', texto: 'Não foi possível conectar à API para cadastrar o participante.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Cadastrar participante</h2>
      <div><label htmlFor="participante-nome">Nome</label><input id="participante-nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" required /></div>
      <div><label htmlFor="participante-email">E-mail</label><input id="participante-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
      <div><label htmlFor="participante-turma">Turma</label><input id="participante-turma" type="text" value={turma} onChange={(e) => setTurma(e.target.value)} required /></div>
      <button type="submit" disabled={enviando}>{enviando ? 'Salvando…' : 'Cadastrar participante'}</button>
    </form>
  );
}
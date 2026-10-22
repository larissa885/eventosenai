const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

async function send(path, options = {}) {
  const response = await fetch(`${API}${path}`, { cache: 'no-store', ...options });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  return { ok: response.ok, data };
}

export async function getEventos() {
  const response = await fetch(`${API}/eventos`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Erro ao buscar eventos');
  return response.json();
}

export async function getCategorias() {
  const response = await fetch(`${API}/categorias`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Erro ao buscar categorias');
  return response.json();
}

export async function criarEvento(evento) {
  return send('/eventos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(evento) });
}

export async function excluirEvento(id) {
  return send(`/eventos/${id}`, { method: 'DELETE' });
}

export async function inscrever(evento_id, participante_id) {
  return send('/inscricoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ evento_id, participante_id }) });
}

export async function getParticipantes() {
  const response = await fetch(`${API}/participantes`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Erro ao buscar participantes');
  return response.json();
}

export async function cadastrarParticipante(nome, email, turma) {
  return send('/participantes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome, email, turma }) });
}

export async function atualizarParticipante(id, participante) {
  return send(`/participantes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(participante) });
}

export async function excluirParticipante(id) {
  return send(`/participantes/${id}`, { method: 'DELETE' });
}

export async function getInscritos(eventoId) {
  const response = await fetch(`${API}/eventos/${eventoId}/inscritos`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Erro ao buscar inscritos');
  return response.json();
}

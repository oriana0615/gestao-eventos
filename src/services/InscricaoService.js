import { supabase } from '../config/supabaseClient';


async function listar() {
  const { data, error } = await supabase.from('inscricoes').select('*');
  if (error) throw error;
  return data;
}

async function salvar(inscricao) {
  const { data, error } = await supabase.from('inscricoes').insert([inscricao]).select();
  if (error) throw error;
  return data;
}

async function atualizar(novaInscricao) {
  const { id, ...camposParaAtualizar } = novaInscricao; // Separa o ID

  const { data, error } = await supabase
    .from('inscricoes')
    .update(camposParaAtualizar) // Atualiza o resto
    .eq('id', id) // Usa o ID aqui
    .select();

  if (error) throw error;
  return data;
}

async function remover(id) {
  const { error } = await supabase.from('inscricoes').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export default { listar, salvar, atualizar, remover };

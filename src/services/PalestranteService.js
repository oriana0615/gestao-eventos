import { supabase } from '../config/supabaseClient';


async function listar() {
  const { data, error } = await supabase.from('palestrantes').select('*');
  if (error) throw error;
  return data;
}

async function salvar(palestrante) {
  const { data, error } = await supabase.from('palestrantes').insert([palestrante]).select();
  if (error) throw error;
  return data;
}

async function atualizar(novoPalestrante) {
  const { id, ...camposParaAtualizar } = novoPalestrante; // Separa o ID do resto dos dados

  const { data, error } = await supabase
    .from('palestrantes')
    .update(camposParaAtualizar) // Passa apenas os campos que devem ser atualizados
    .eq('id', id) // Usa o ID apenas na condição 'where' (eq)
    .select();
    
  if (error) throw error;
  return data;
}

async function remover(id) {
  const { error } = await supabase.from('palestrantes').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export default { listar, salvar, atualizar, remover };

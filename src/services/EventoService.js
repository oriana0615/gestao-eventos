import { supabase } from '../config/supabaseClient';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';


// Função para fazer upload da imagem e obter a URL pública
async function uploadImagem(uri) {
  if (!uri) return null;

  try {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    const filePath = `public/${new Date().getTime()}.jpg`; 
    const contentType = 'image/jpeg';
    
    const { data, error } = await supabase.storage
      .from('imagens-eventos')
      .upload(filePath, decode(base64), { contentType });

    if (error) {
      throw error;
    }
    
    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('imagens-eventos')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;

  } catch (error) {
    console.error('Erro no upload da imagem:', error);
    return null;
  }
}

async function listar() {
  const { data, error } = await supabase.from('eventos').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function salvar(evento, imagemUri) {
  const imageUrl = await uploadImagem(imagemUri);

  const { data, error } = await supabase
    .from('eventos')
    .insert([{ ...evento, imagem_url: imageUrl }])
    .select();

  if (error) throw error;
  return data;
}

async function atualizar(novoEvento, imagemUri) {
  const { id, ...camposParaAtualizar } = novoEvento; // Separa o ID
  
  // A lógica da imagem continua a mesma
  let imageUrl = camposParaAtualizar.imagem_url;
  if (imagemUri && imagemUri !== imageUrl) {
    imageUrl = await uploadImagem(imagemUri);
  }

  const dadosDoUpdate = {
    ...camposParaAtualizar,
    imagem_url: imageUrl
  };

  const { data, error } = await supabase
    .from('eventos')
    .update(dadosDoUpdate) // Passa o objeto sem o ID
    .eq('id', id) // Usa o ID apenas aqui
    .select();

  if (error) throw error;
  return data;
}

async function remover(id) {
  const { error } = await supabase.from('eventos').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export default { listar, salvar, atualizar, remover };

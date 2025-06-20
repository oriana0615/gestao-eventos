import axios from 'axios';

const api = axios.create({
  baseURL: 'https://viacep.com.br/ws',
});


async function getEndereco(cep) {
  try {
    const response = await api.get(`/${cep}/json/`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    throw error;
  }
}

export default { getEndereco };

import axios from 'axios';

const API_URL = 'https://qxoe8xxub9.execute-api.us-east-1.amazonaws.com/prod';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export const cadastrarUsuario = (dados) => api.post('/usuarios', dados);
export const criarServico = (dados) => api.post('/servicos', dados);
export const buscarServico = (id) => api.get(/servicos/);
export const criarPagamento = (dados) => api.post('/pagamentos', dados);
export const enviarLocalizacao = (dados) => api.post('/localizacoes', dados);

export default api;

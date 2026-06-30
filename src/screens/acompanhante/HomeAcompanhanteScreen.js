import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';
import { showAlert } from '../../services/alertHelper';

const API_URL = 'https://qxoe8xxub9.execute-api.us-east-1.amazonaws.com/prod';

export default function HomeAcompanhanteScreen({ route, navigation }) {
  const { usuario } = route.params;
  const [servicos, setServicos] = useState([]);
  const [servicosAtivos, setServicosAtivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aceitando, setAceitando] = useState(null);

  const carregar = async () => {
    try {
      const [dispRes, ativos] = await Promise.all([
        axios.get(API_URL + '/servicos/disponiveis'),
        axios.get(API_URL + '/acompanhantes/meus?acompanhante_id=' + (usuario.acompanhante_id || usuario.id)).catch(() => ({ data: { servicos: [] } })),
      ]);
      setServicos(dispRes.data.servicos || []);
      setServicosAtivos(ativos.data.servicos || []);
    } catch (err) {
      console.log('Erro ao carregar:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregar();
    const interval = setInterval(carregar, 15000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => { setRefreshing(true); carregar(); };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const aceitarServico = async (servicoId) => {
    setAceitando(servicoId);
    try {
      await axios.post(API_URL + '/servicos/' + servicoId + '/aceitar', { acompanhante_id: usuario.id });
      showAlert('Sucesso!', 'Servico aceito! Acesse em Meus Servicos Aceitos.');
      carregar();
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.erro ? err.response.data.erro : 'Nao foi possivel aceitar';
      showAlert('Erro', msg);
      carregar();
    } finally {
      setAceitando(null);
    }
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.ola}>Ola, {usuario.nome.split(' ')[0]}!</Text>
        <Text style={styles.sub}>Painel do Acompanhante</Text>
      </View>

      {!usuario.cadastro_completo && (
        <TouchableOpacity style={styles.cadastroBanner} onPress={() => navigation.navigate('CompletarCadastroAcompanhante', { usuario })}>
          <Text style={styles.cadastroBannerIcon}>??</Text>
          <View style={{flex: 1}}>
            <Text style={styles.cadastroBannerTitulo}>Complete seu cadastro</Text>
            <Text style={styles.cadastroBannerSub}>Envie seus documentos para comecar a atender</Text>
          </View>
          <Text style={styles.cadastroBannerSeta}>{'>'}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.statusCard}>
        <Text style={styles.statusIcon}>??</Text>
        <Text style={styles.statusText}>Disponivel para servicos</Text>
      </View>

      {servicosAtivos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meus Servicos Ativos ({servicosAtivos.length})</Text>
          {servicosAtivos.map((s) => (
            <TouchableOpacity key={s.id} style={styles.cardAtivo} onPress={() => navigation.navigate('ServicoAtivoAcompanhante', { usuario, servico: s })}>
              <View style={styles.cardAtivoHeader}>
                <Text style={styles.cardAtivoTitulo}>{s.idoso_nome || 'Idoso'}</Text>
                <View style={styles.badgeAtivo}><Text style={styles.badgeAtivoText}>{s.status}</Text></View>
              </View>
              <Text style={styles.cardAtivoDesc}>{s.descricao}</Text>
              <Text style={styles.cardAtivoData}>{formatarData(s.inicio)}</Text>
              <View style={styles.panicoHint}>
                <Text style={styles.panicoHintText}>?? Toque para ver detalhes e botao de panico</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servicos Disponiveis ({servicos.length})</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#27AE60" style={{marginTop: 24}} />
        ) : servicos.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioTitulo}>Nenhum servico disponivel</Text>
            <Text style={styles.vazioSub}>Novos servicos aparecerao aqui</Text>
          </View>
        ) : (
          servicos.map((s) => (
            <View key={s.id} style={styles.card}>
              <Text style={styles.cardDescricao}>{s.descricao || 'Servico'}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>Idoso: <Text style={styles.cardValue}>{s.idoso_nome || '-'}</Text></Text>
                <Text style={styles.cardLabel}>Familia: <Text style={styles.cardValue}>{s.familia_nome || '-'}</Text></Text>
                <Text style={styles.cardLabel}>Data: <Text style={styles.cardValue}>{formatarData(s.inicio)}</Text></Text>
                <Text style={styles.cardLabel}>Duracao: <Text style={styles.cardValue}>{s.horas_contratadas}h</Text></Text>
              </View>
              <TouchableOpacity style={styles.btnAceitar} onPress={() => aceitarServico(s.id)} disabled={aceitando === s.id}>
                {aceitando === s.id ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnAceitarText}>Aceitar Servico</Text>}
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  header: { padding: 24, paddingTop: 48, backgroundColor: '#27AE60' },
  ola: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  sub: { fontSize: 14, color: '#d0ffe4', marginTop: 4 },
  cadastroBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3CD', margin: 16, marginBottom: 0, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FFE69C', gap: 12 },
  cadastroBannerIcon: { fontSize: 28 },
  cadastroBannerTitulo: { fontSize: 15, fontWeight: 'bold', color: '#856404' },
  cadastroBannerSub: { fontSize: 12, color: '#856404', marginTop: 2 },
  cadastroBannerSeta: { fontSize: 24, color: '#856404' },
  statusCard: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 3 },
  statusIcon: { fontSize: 24 },
  statusText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  cardAtivo: { backgroundColor: '#d4edda', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: '#27AE60', elevation: 3 },
  cardAtivoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardAtivoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#155724' },
  badgeAtivo: { backgroundColor: '#27AE60', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeAtivoText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cardAtivoDesc: { fontSize: 13, color: '#333', marginBottom: 4 },
  cardAtivoData: { fontSize: 13, color: '#555' },
  panicoHint: { marginTop: 8, backgroundColor: '#f8d7da', borderRadius: 8, padding: 8 },
  panicoHintText: { fontSize: 12, color: '#721c24', fontWeight: 'bold', textAlign: 'center' },
  vazio: { alignItems: 'center', padding: 32, backgroundColor: '#fff', borderRadius: 16 },
  vazioTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  vazioSub: { fontSize: 13, color: '#888' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 3 },
  cardDescricao: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  cardInfo: { gap: 4, marginBottom: 12 },
  cardLabel: { fontSize: 13, color: '#888' },
  cardValue: { color: '#333', fontWeight: '500' },
  btnAceitar: { backgroundColor: '#27AE60', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnAceitarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});


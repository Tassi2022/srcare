import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Animated, Easing } from 'react-native';
import axios from 'axios';

const API_URL = 'https://qxoe8xxub9.execute-api.us-east-1.amazonaws.com/prod';

const STATUS_COR = {
  pendente: { bg: '#FFF3CD', text: '#856404' },
  aceito: { bg: '#D1ECF1', text: '#0C5460' },
  em_andamento: { bg: '#D4EDDA', text: '#155724' },
  concluido: { bg: '#E2E3E5', text: '#383D41' },
  cancelado: { bg: '#F8D7DA', text: '#721C24' },
};

const EM_ANDAMENTO_STATUS = ['pendente', 'aceito', 'em_andamento'];

function AmpulhetaAnimada() {
  const rotacao = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotacao, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(rotacao, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const giro = rotacao.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <Animated.Text style={[styles.ampulheta, { transform: [{ rotate: giro }] }]}>⏳</Animated.Text>
  );
}

export default function MeusServicosScreen({ route, navigation }) {
  const { usuario } = route.params;
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = async () => {
    try {
      const res = await axios.get(API_URL + '/servicos?familia_id=' + usuario.id);
      setServicos(res.data.servicos || []);
    } catch (err) {
      console.log('Erro ao carregar servicos:', err.message);
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

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#4A90E2" />
      <Text style={styles.loadingText}>Carregando servicos...</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeFamilia', { usuario })} style={styles.backBtn}>
          <Text style={styles.backText}>Inicio</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Meus Servicos</Text>
        <Text style={styles.headerSub}>{servicos.length} servico(s) encontrado(s)</Text>
      </View>

      {servicos.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTitulo}>Nenhum servico ainda</Text>
          <Text style={styles.vazioSub}>Solicite um servico para seu familiar!</Text>
          <TouchableOpacity style={styles.btnNovo} onPress={() => navigation.navigate('HomeFamilia', { usuario })}>
            <Text style={styles.btnNovoText}>Solicitar Servico</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.lista}>
          {servicos.map((s) => {
            const cor = STATUS_COR[s.status] || STATUS_COR.pendente;
            const emAndamento = EM_ANDAMENTO_STATUS.includes(s.status);
            return (
              <View key={s.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTituloRow}>
                    {emAndamento && <AmpulhetaAnimada />}
                    <Text style={styles.cardDescricao}>{s.descricao || 'Servico'}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: cor.bg }]}>
                    <Text style={[styles.badgeText, { color: cor.text }]}>{s.status}</Text>
                  </View>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>Idoso: <Text style={styles.cardValue}>{s.idoso_nome || '-'}</Text></Text>
                  <Text style={styles.cardLabel}>Data: <Text style={styles.cardValue}>{formatarData(s.inicio)}</Text></Text>
                  <Text style={styles.cardLabel}>Horas: <Text style={styles.cardValue}>{s.horas_contratadas}h</Text></Text>
                  {s.acompanhante_nome && <Text style={styles.cardLabel}>Acompanhante: <Text style={styles.cardValue}>{s.acompanhante_nome}</Text></Text>}
                  {s.valor_total && <Text style={styles.cardLabel}>Valor: <Text style={styles.cardValue}>R$ {parseFloat(s.valor_total).toFixed(2)}</Text></Text>}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4ff' },
  loadingText: { marginTop: 12, color: '#666', fontSize: 16 },
  header: { backgroundColor: '#4A90E2', padding: 24, paddingTop: 48 },
  backBtn: { marginBottom: 8 },
  backText: { color: '#d0e4ff', fontSize: 16 },
  headerTitulo: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 14, color: '#d0e4ff', marginTop: 4 },
  vazio: { alignItems: 'center', padding: 48 },
  vazioTitulo: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  vazioSub: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  btnNovo: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 12 },
  btnNovoText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  lista: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTituloRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8, gap: 6 },
  ampulheta: { fontSize: 16 },
  cardDescricao: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  cardInfo: { gap: 4 },
  cardLabel: { fontSize: 13, color: '#888' },
  cardValue: { color: '#333', fontWeight: '500' },
});

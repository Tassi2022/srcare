import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API_URL = 'https://qxoe8xxub9.execute-api.us-east-1.amazonaws.com/prod';

export default function HomeFamiliaScreen({ route, navigation }) {
  const { usuario } = route.params;
  const [pendentes, setPendentes] = useState(0);
  const [loading, setLoading] = useState(true);

  const servicos = [
    { icon: 'H', titulo: 'Consulta Medica', desc: 'Acompanhamento em consultas' },
    { icon: 'M', titulo: 'Mercado', desc: 'Compras e supermercado' },
    { icon: 'P', titulo: 'Passeio', desc: 'Caminhadas e lazer' },
    { icon: 'V', titulo: 'Viagem', desc: 'Viagens e deslocamentos' },
  ];

  const carregarPendentes = async () => {
    try {
      const res = await axios.get(API_URL + '/servicos?familia_id=' + usuario.id);
      const lista = res.data.servicos || [];
      const count = lista.filter(s => s.status === 'pendente' || s.status === 'confirmado' || s.status === 'em_andamento').length;
      setPendentes(count);
    } catch (err) {
      console.log('Erro ao carregar pendentes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPendentes();
    const unsubscribe = navigation.addListener('focus', carregarPendentes);
    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.ola}>Ola, {usuario.nome.split(' ')[0]}!</Text>
        <Text style={styles.sub}>O que seu familiar precisa hoje?</Text>
      </View>

      {!usuario.cep && (
        <TouchableOpacity style={styles.perfilBanner} onPress={() => navigation.navigate('CompletarPerfilFamilia', { usuario })}>
          <Text style={styles.perfilBannerIcon}>👤</Text>
          <View style={{flex: 1}}>
            <Text style={styles.perfilBannerTitulo}>Complete seu perfil</Text>
            <Text style={styles.perfilBannerSub}>Adicione seu endereco para facilitar o atendimento</Text>
          </View>
          <Text style={styles.perfilBannerSeta}>{'>'}</Text>
        </TouchableOpacity>
      )}

      {!loading && pendentes > 0 && (
        <TouchableOpacity style={styles.banner} onPress={() => navigation.navigate('MeusServicos', { usuario })}>
          <Text style={styles.bannerIcon}>⏳</Text>
          <View style={{flex: 1}}>
            <Text style={styles.bannerTitulo}>Voce tem {pendentes} servico{pendentes > 1 ? 's' : ''} pendente{pendentes > 1 ? 's' : ''}</Text>
            <Text style={styles.bannerSub}>Toque para acompanhar</Text>
          </View>
          <Text style={styles.bannerSeta}>{'>'}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.grid}>
        {servicos.map((s, i) => (
          <TouchableOpacity key={i} style={styles.card} onPress={() => navigation.navigate('SolicitarServico', { usuario, tipo: s.titulo })}>
            <Text style={styles.cardIcon}>{s.icon}</Text>
            <Text style={styles.cardTitulo}>{s.titulo}</Text>
            <Text style={styles.cardDesc}>{s.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btnServicos} onPress={() => navigation.navigate('MeusServicos', { usuario })}>
        <Text style={styles.btnServicosText}>Ver meus servicos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  header: { padding: 24, paddingTop: 48, backgroundColor: '#4A90E2' },
  ola: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  sub: { fontSize: 14, color: '#d0e4ff', marginTop: 4 },
  perfilBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F4FD', margin: 16, marginBottom: 8, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#B8D9F0', gap: 12 },
  perfilBannerIcon: { fontSize: 28 },
  perfilBannerTitulo: { fontSize: 15, fontWeight: 'bold', color: '#1A6A9A' },
  perfilBannerSub: { fontSize: 12, color: '#1A6A9A', marginTop: 2 },
  perfilBannerSeta: { fontSize: 24, color: '#1A6A9A' },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3CD', margin: 16, marginBottom: 0, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FFE69C', gap: 12 },
  bannerIcon: { fontSize: 28 },
  bannerTitulo: { fontSize: 15, fontWeight: 'bold', color: '#856404' },
  bannerSub: { fontSize: 12, color: '#856404', marginTop: 2 },
  bannerSeta: { fontSize: 24, color: '#856404' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', elevation: 3 },
  cardIcon: { fontSize: 36, marginBottom: 8, color: '#4A90E2', fontWeight: 'bold' },
  cardTitulo: { fontSize: 14, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  cardDesc: { fontSize: 12, color: '#888', textAlign: 'center', marginTop: 4 },
  btnServicos: { margin: 16, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#4A90E2' },
  btnServicosText: { color: '#4A90E2', fontWeight: 'bold', fontSize: 16 },
});

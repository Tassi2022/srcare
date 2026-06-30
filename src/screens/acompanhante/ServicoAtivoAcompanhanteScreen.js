import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Animated, Easing } from 'react-native';
import axios from 'axios';
import { showAlert } from '../../services/alertHelper';

const API_URL = 'https://qxoe8xxub9.execute-api.us-east-1.amazonaws.com/prod';

export default function ServicoAtivoAcompanhanteScreen({ route, navigation }) {
  const { usuario, servico } = route.params;
  const [enviandoPanico, setEnviandoPanico] = useState(false);
  const pulso = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 1.08, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulso, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const acionarPanico = async () => {
    if (!window.confirm('BOTAO DE PANICO\n\nA familia sera notificada imediatamente por SMS e Email!\n\nConfirma o acionamento?')) return;
    setEnviandoPanico(true);
    try {
      await axios.post(API_URL + '/panico', { acompanhante_id: usuario.id, servico_id: servico.id });
      showAlert('Alerta enviado!', 'A familia foi notificada! Se necessario ligue 192 (SAMU) ou 193 (Bombeiros)');
    } catch (err) {
      showAlert('Erro', 'Nao foi possivel enviar o alerta.\nLigue: 192 SAMU | 193 Bombeiros | 190 Policia');
    } finally {
      setEnviandoPanico(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Servico em Andamento</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{servico.status}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Detalhes do Servico</Text>
        <Text style={styles.cardDesc}>{servico.descricao}</Text>
        <View style={styles.divider} />
        <Text style={styles.infoLabel}>Idoso</Text>
        <Text style={styles.infoValue}>{servico.idoso_nome || '-'}</Text>
        {servico.observacoes_medicas ? (<><Text style={styles.infoLabel}>Obs. Medicas</Text><Text style={styles.infoValue}>{servico.observacoes_medicas}</Text></>) : null}
        <View style={styles.divider} />
        <Text style={styles.infoLabel}>Inicio</Text>
        <Text style={styles.infoValue}>{formatarData(servico.inicio)}</Text>
        <Text style={styles.infoLabel}>Duracao</Text>
        <Text style={styles.infoValue}>{servico.horas_contratadas}h</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Local do Servico</Text>
        {servico.logradouro ? (
          <>
            <Text style={styles.infoValue}>{servico.logradouro}, {servico.numero} {servico.complemento || ''}</Text>
            <Text style={styles.infoValue}>{servico.bairro} - {servico.cidade}/{servico.estado}</Text>
            <Text style={styles.infoValue}>CEP: {servico.cep}</Text>
          </>
        ) : (<Text style={styles.infoValueGray}>Endereco nao informado</Text>)}
        <View style={styles.divider} />
        <Text style={styles.cardTitulo}>Contato da Familia</Text>
        <Text style={styles.infoLabel}>Nome</Text><Text style={styles.infoValue}>{servico.familia_nome || '-'}</Text>
        <Text style={styles.infoLabel}>Telefone</Text><Text style={styles.infoValue}>{servico.familia_telefone || '-'}</Text>
        {servico.contato_emergencia ? (<><Text style={styles.infoLabel}>Contato Emergencia</Text><Text style={styles.infoValue}>{servico.contato_emergencia}</Text></>) : null}
      </View>

      <View style={styles.panicoSection}>
        <Text style={styles.panicoTitulo}>Em caso de emergencia</Text>
        <Animated.View style={{ transform: [{ scale: pulso }] }}>
          <TouchableOpacity style={[styles.btnPanico, enviandoPanico && styles.btnPanicoLoading]} onPress={acionarPanico} disabled={enviandoPanico}>
            {enviandoPanico ? <ActivityIndicator color="#fff" size="large" /> : (
              <>
                <Text style={styles.btnPanicoIcon}>SOS</Text>
                <Text style={styles.btnPanicoText}>BOTAO DE PANICO</Text>
                <Text style={styles.btnPanicoSub}>Pressione em emergencia</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.panicoAviso}>Notifica a familia por SMS e Email imediatamente</Text>
        <View style={styles.emergenciaRow}>
          <Text style={styles.emergenciaItem}>192 SAMU</Text>
          <Text style={styles.emergenciaItem}>193 Bombeiros</Text>
          <Text style={styles.emergenciaItem}>190 Policia</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  header: { backgroundColor: '#27AE60', padding: 24, paddingTop: 48 },
  backBtn: { marginBottom: 8 },
  backText: { color: '#d0ffe4', fontSize: 16 },
  headerTitulo: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  statusBadge: { marginTop: 8, backgroundColor: '#d4edda', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  statusText: { color: '#155724', fontWeight: 'bold', fontSize: 13 },
  card: { margin: 16, marginBottom: 0, backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 3 },
  cardTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  infoLabel: { fontSize: 12, color: '#888', marginTop: 6 },
  infoValue: { fontSize: 15, color: '#333', fontWeight: '500' },
  infoValueGray: { fontSize: 14, color: '#aaa', fontStyle: 'italic' },
  panicoSection: { margin: 16, alignItems: 'center', backgroundColor: '#fff5f5', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#ffcccc' },
  panicoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#c0392b', marginBottom: 16 },
  btnPanico: { backgroundColor: '#e74c3c', borderRadius: 100, width: 180, height: 180, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  btnPanicoLoading: { backgroundColor: '#c0392b' },
  btnPanicoIcon: { fontSize: 28, color: '#fff', fontWeight: 'bold', marginBottom: 8 },
  btnPanicoText: { color: '#fff', fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  btnPanicoSub: { color: '#ffcccc', fontSize: 11, textAlign: 'center', marginTop: 4 },
  panicoAviso: { marginTop: 16, fontSize: 12, color: '#888', textAlign: 'center' },
  emergenciaRow: { flexDirection: 'row', gap: 12, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  emergenciaItem: { fontSize: 13, color: '#e74c3c', fontWeight: 'bold' },
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { criarServico } from '../../services/api';
import { showAlert } from '../../services/alertHelper';
import EnderecoForm from '../../components/EnderecoForm';

const NECESSIDADES = [
  { id: 'cadeirante', label: 'Cadeirante' },
  { id: 'demencia', label: 'Demencia' },
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'hipertensao', label: 'Hipertensao' },
  { id: 'alzheimer', label: 'Alzheimer' },
  { id: 'deficiencia_visual', label: 'Def. Visual' },
  { id: 'deficiencia_auditiva', label: 'Def. Auditiva' },
  { id: 'oxigenio', label: 'Oxigenio' },
  { id: 'cardiaco', label: 'Cardiaco' },
];

export default function SolicitarServicoScreen({ route, navigation }) {
  const { usuario, tipo } = route.params;
  const [idosoNome, setIdosoNome] = useState('');
  const [idosoNascimento, setIdosoNascimento] = useState('');
  const [descricao, setDescricao] = useState('');
  const [horas, setHoras] = useState('');
  const [loading, setLoading] = useState(false);
  const [necessidades, setNecessidades] = useState([]);
  const [obsNecessidades, setObsNecessidades] = useState('');
  const [semNecessidades, setSemNecessidades] = useState(false);
  const [dataTexto, setDataTexto] = useState('');
  const [horaTexto, setHoraTexto] = useState('');
  const [enderecoIdoso, setEnderecoIdoso] = useState({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' });

  const toggleNecessidade = (id) => {
    if (semNecessidades) return;
    setNecessidades(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);
  };

  const toggleSemNecessidades = () => {
    if (!semNecessidades) { setNecessidades([]); setObsNecessidades(''); }
    setSemNecessidades(!semNecessidades);
  };

  const formatarDataInput = (texto) => {
    const n = texto.replace(/\D/g, '');
    if (n.length <= 2) return n;
    if (n.length <= 4) return n.slice(0,2) + '/' + n.slice(2);
    return n.slice(0,2) + '/' + n.slice(2,4) + '/' + n.slice(4,8);
  };

  const formatarHoraInput = (texto) => {
    const n = texto.replace(/\D/g, '');
    if (n.length <= 2) return n;
    return n.slice(0,2) + ':' + n.slice(2,4);
  };

  const handleSolicitar = async () => {
    if (!idosoNome.trim()) return showAlert('Campo obrigatorio', 'Preencha o nome do idoso');
    if (!idosoNascimento || idosoNascimento.length < 10) return showAlert('Campo obrigatorio', 'Preencha a data de nascimento do idoso');
    if (!dataTexto || dataTexto.length < 10) return showAlert('Campo obrigatorio', 'Preencha a data no formato DD/MM/AAAA');
    if (!horaTexto || horaTexto.length < 5) return showAlert('Campo obrigatorio', 'Preencha a hora no formato HH:MM');
    if (!horas) return showAlert('Campo obrigatorio', 'Selecione a duracao em horas');
    if (!descricao.trim()) return showAlert('Campo obrigatorio', 'Preencha as observacoes');
    if (!semNecessidades && necessidades.length === 0) return showAlert('Campo obrigatorio', 'Selecione as necessidades ou marque sem necessidades');
    if (!enderecoIdoso.cep || !enderecoIdoso.logradouro || !enderecoIdoso.numero || !enderecoIdoso.bairro || !enderecoIdoso.cidade || !enderecoIdoso.estado) return showAlert('Campo obrigatorio', 'Preencha o endereco completo do idoso');

    setLoading(true);
    try {
      const partes = dataTexto.split('/');
      const inicioISO = partes[2] + '-' + partes[1] + '-' + partes[0] + 'T' + horaTexto + ':00';
      const nascPartes = idosoNascimento.split('/');
      const nascISO = nascPartes[2] + '-' + nascPartes[1] + '-' + nascPartes[0];
      const necessidadesTexto = semNecessidades
        ? ' | Sem necessidades especiais'
        : ' | Necessidades: ' + necessidades.join(', ') + (obsNecessidades ? ' - ' + obsNecessidades : '');
      const enderecoTexto = enderecoIdoso.logradouro + ', ' + enderecoIdoso.numero + ' - ' + enderecoIdoso.bairro + ', ' + enderecoIdoso.cidade + '/' + enderecoIdoso.estado + ' - CEP: ' + enderecoIdoso.cep;

      await criarServico({
        familia_id: usuario.id,
        idoso_id: usuario.id,
        idoso_nome: idosoNome,
        inicio: inicioISO,
        horas_contratadas: parseInt(horas),
        descricao: tipo + ': ' + descricao + necessidadesTexto + ' | Endereco: ' + enderecoTexto + ' | Nasc: ' + nascISO,
      });
      showAlert('Sucesso!', 'Servico solicitado com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('MeusServicos', { usuario }) }
      ]);
    } catch (err) {
      showAlert('Erro', 'Nao foi possivel solicitar o servico.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Solicitar Servico</Text>
      </View>
      <View style={styles.tipoCard}>
        <Text style={styles.tipoTitulo}>{tipo}</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Nome do idoso <Text style={styles.obrig}>*</Text></Text>
        <TextInput style={styles.input} placeholder="Ex: Jose Silva" value={idosoNome} onChangeText={setIdosoNome} />

        <Text style={styles.label}>Data de nascimento do idoso <Text style={styles.obrig}>*</Text></Text>
        <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={idosoNascimento} onChangeText={(t) => setIdosoNascimento(formatarDataInput(t))} keyboardType="numeric" maxLength={10} />

        <Text style={styles.label}>Data e hora <Text style={styles.obrig}>*</Text></Text>
        <View style={styles.dataRow}>
          <View style={{flex: 1, marginRight: 8}}>
            <Text style={styles.labelSmall}>Data</Text>
            <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={dataTexto} onChangeText={(t) => setDataTexto(formatarDataInput(t))} keyboardType="numeric" maxLength={10} />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.labelSmall}>Hora</Text>
            <TextInput style={styles.input} placeholder="HH:MM" value={horaTexto} onChangeText={(t) => setHoraTexto(formatarHoraInput(t))} keyboardType="numeric" maxLength={5} />
          </View>
        </View>

        <Text style={styles.label}>Duracao (horas) <Text style={styles.obrig}>*</Text></Text>
        <View style={styles.horasRow}>
          {['1', '2', '3', '4', '6', '8'].map(h => (
            <TouchableOpacity key={h} style={[styles.horaBtn, horas === h && styles.horaBtnAtivo]} onPress={() => setHoras(h)}>
              <Text style={[styles.horaBtnText, horas === h && styles.horaBtnTextAtivo]}>{h}h</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Observacoes <Text style={styles.obrig}>*</Text></Text>
        <TextInput style={[styles.input, styles.inputMulti]} placeholder="Ex: Consulta com Dr. Silva" value={descricao} onChangeText={setDescricao} multiline numberOfLines={3} />

        <View style={styles.necessidadesSection}>
          <Text style={styles.necessidadesTitulo}>Necessidades Especiais <Text style={styles.obrig}>*</Text></Text>
          <Text style={styles.necessidadesSub}>Selecione todas que se aplicam</Text>
          <TouchableOpacity style={[styles.semNecBtn, semNecessidades && styles.semNecBtnAtivo]} onPress={toggleSemNecessidades}>
            <Text style={styles.checkboxIcon}>{semNecessidades ? 'V' : ' '}</Text>
            <Text style={[styles.semNecLabel, semNecessidades && styles.semNecLabelAtivo]}>Sem necessidades especiais</Text>
          </TouchableOpacity>
          <View style={[styles.checkboxGrid, semNecessidades && styles.desabilitado]}>
            {NECESSIDADES.map(n => (
              <TouchableOpacity key={n.id} style={[styles.checkbox, necessidades.includes(n.id) && styles.checkboxAtivo, semNecessidades && styles.checkboxDisabled]} onPress={() => toggleNecessidade(n.id)}>
                <Text style={styles.checkboxIcon}>{necessidades.includes(n.id) ? 'V' : ' '}</Text>
                <Text style={[styles.checkboxLabel, necessidades.includes(n.id) && styles.checkboxLabelAtivo, semNecessidades && styles.checkboxLabelDisabled]}>{n.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {!semNecessidades && (
            <>
              <Text style={styles.label}>Detalhes adicionais</Text>
              <TextInput style={[styles.input, styles.inputMulti]} placeholder="Outras informacoes..." value={obsNecessidades} onChangeText={setObsNecessidades} multiline numberOfLines={3} />
            </>
          )}
        </View>

        <EnderecoForm endereco={enderecoIdoso} onChange={setEnderecoIdoso} />

        <TouchableOpacity style={styles.btn} onPress={handleSolicitar} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Confirmar Solicitacao</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  header: { backgroundColor: '#4A90E2', padding: 24, paddingTop: 48 },
  backBtn: { marginBottom: 8 },
  backText: { color: '#d0e4ff', fontSize: 16 },
  headerTitulo: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  tipoCard: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', elevation: 3 },
  tipoTitulo: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 6, marginTop: 12 },
  labelSmall: { fontSize: 12, color: '#666', marginBottom: 4 },
  obrig: { color: '#e74c3c' },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  inputMulti: { height: 90, textAlignVertical: 'top' },
  dataRow: { flexDirection: 'row', marginTop: 4 },
  horasRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  horaBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 2, borderColor: '#ddd', backgroundColor: '#fff' },
  horaBtnAtivo: { borderColor: '#4A90E2', backgroundColor: '#e8f0fe' },
  horaBtnText: { fontSize: 14, color: '#666' },
  horaBtnTextAtivo: { color: '#4A90E2', fontWeight: 'bold' },
  necessidadesSection: { marginTop: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e8f0fe' },
  necessidadesTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  necessidadesSub: { fontSize: 12, color: '#888', marginBottom: 12 },
  semNecBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#27AE60', backgroundColor: '#f0fff4', marginBottom: 12, gap: 8 },
  semNecBtnAtivo: { backgroundColor: '#d4edda', borderColor: '#27AE60' },
  semNecLabel: { fontSize: 14, color: '#27AE60', fontWeight: 'bold' },
  semNecLabelAtivo: { color: '#155724' },
  checkboxGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  desabilitado: { opacity: 0.3 },
  checkbox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: '#ddd', backgroundColor: '#f8f8f8', gap: 6 },
  checkboxAtivo: { borderColor: '#4A90E2', backgroundColor: '#e8f0fe' },
  checkboxDisabled: { borderColor: '#ddd', backgroundColor: '#f0f0f0' },
  checkboxIcon: { fontSize: 12, fontWeight: 'bold', color: '#4A90E2', width: 14 },
  checkboxLabel: { fontSize: 13, color: '#666' },
  checkboxLabelAtivo: { color: '#4A90E2', fontWeight: 'bold' },
  checkboxLabelDisabled: { color: '#aaa' },
  btn: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

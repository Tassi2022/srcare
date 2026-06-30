import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { showAlert } from '../../services/alertHelper';
import EnderecoForm from '../../components/EnderecoForm';

const API_URL = 'https://qxoe8xxub9.execute-api.us-east-1.amazonaws.com/prod';

export default function CompletarPerfilFamiliaScreen({ route, navigation }) {
  const { usuario } = route.params;
  const [nomeCompleto, setNomeCompleto] = useState(usuario.nome || '');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [endereco, setEndereco] = useState({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' });

  const formatarDataInput = (texto) => {
    const n = texto.replace(/\D/g, '');
    if (n.length <= 2) return n;
    if (n.length <= 4) return n.slice(0,2) + '/' + n.slice(2);
    return n.slice(0,2) + '/' + n.slice(2,4) + '/' + n.slice(4,8);
  };

  const handleSalvar = async () => {
    if (!nomeCompleto.trim()) return showAlert('Campo obrigatorio', 'Preencha o nome completo');
    if (!dataNascimento || dataNascimento.length < 10) return showAlert('Campo obrigatorio', 'Preencha sua data de nascimento');
    if (!telefone.trim()) return showAlert('Campo obrigatorio', 'Preencha seu telefone');
    if (!endereco.cep || !endereco.logradouro || !endereco.numero || !endereco.bairro || !endereco.cidade || !endereco.estado) return showAlert('Campo obrigatorio', 'Preencha o endereco completo');

    setLoading(true);
    try {
      const partes = dataNascimento.split('/');
      const dataISO = partes[2] + '-' + partes[1] + '-' + partes[0];
      await axios.put(API_URL + '/usuarios/perfil', {
        user_id: usuario.id,
        nome: nomeCompleto,
        telefone,
        data_nascimento: dataISO,
        cep: endereco.cep,
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        complemento: endereco.complemento,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        estado: endereco.estado,
      });
      showAlert('Sucesso!', 'Perfil atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('HomeFamilia', { usuario: { ...usuario, nome: nomeCompleto, cep: endereco.cep, logradouro: endereco.logradouro, bairro: endereco.bairro, cidade: endereco.cidade, estado: endereco.estado } }) }
      ]);
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.erro ? err.response.data.erro : 'Nao foi possivel salvar';
      showAlert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeFamilia', { usuario })} style={styles.backBtn}>
          <Text style={styles.backText}>Pular por agora</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Completar Perfil</Text>
        <Text style={styles.headerSub}>Nos ajude a encontrar o melhor acompanhante</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nome completo <Text style={styles.obrig}>*</Text></Text>
        <TextInput style={styles.input} placeholder="Seu nome completo" value={nomeCompleto} onChangeText={setNomeCompleto} />

        <Text style={styles.label}>Data de nascimento <Text style={styles.obrig}>*</Text></Text>
        <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={dataNascimento} onChangeText={(t) => setDataNascimento(formatarDataInput(t))} keyboardType="numeric" maxLength={10} />

        <Text style={styles.label}>Telefone <Text style={styles.obrig}>*</Text></Text>
        <TextInput style={styles.input} placeholder="(11) 99999-9999" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />

        <EnderecoForm endereco={endereco} onChange={setEndereco} />

        <TouchableOpacity style={styles.btn} onPress={handleSalvar} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Salvar Perfil</Text>}
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
  headerSub: { fontSize: 13, color: '#d0e4ff', marginTop: 4 },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 6, marginTop: 12 },
  obrig: { color: '#e74c3c' },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  btn: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});


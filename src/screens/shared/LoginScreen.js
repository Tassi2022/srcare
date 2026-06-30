import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { cadastrarUsuario } from '../../services/api';
import { showAlert } from '../../services/alertHelper';

const USUARIOS_TESTE = [
  { nome: 'Familia Teste', email: 'familia@teste.com', telefone: '11999990001', perfil: 'familia' },
  { nome: 'Acompanhante Teste', email: 'acompanhante@teste.com', telefone: '11999990002', perfil: 'acompanhante' },
];

export default function LoginScreen({ navigation }) {
  const [modo, setModo] = useState('cadastro');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [perfil, setPerfil] = useState('familia');
  const [loading, setLoading] = useState(false);

  const handleEntrar = async (dadosOverride) => {
    const dados = dadosOverride || { nome, email, telefone, perfil };
    if (!dados.nome.trim()) return showAlert('Campo obrigatorio', 'Preencha seu nome');
    if (!dados.email.trim()) return showAlert('Campo obrigatorio', 'Preencha seu email');
    if (modo === 'cadastro' && !dadosOverride && !dados.telefone.trim()) return showAlert('Campo obrigatorio', 'Preencha seu telefone');
    setLoading(true);
    try {
      const res = await cadastrarUsuario(dados);
      const usuario = res.data.usuario;
      if (dados.perfil === 'familia') {
        if (!usuario.cadastro_completo) {
          navigation.replace('CompletarPerfilFamilia', { usuario });
        } else {
          navigation.replace('HomeFamilia', { usuario });
        }
      } else {
        if (!usuario.cadastro_completo) {
          navigation.replace('CompletarCadastroAcompanhante', { usuario });
        } else {
          navigation.replace('HomeAcompanhante', { usuario });
        }
      }
    } catch (err) {
      showAlert('Erro', 'Nao foi possivel entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>Sr. Care</Text>
      <Text style={styles.subtitle}>Cuidado com carinho</Text>

      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.toggleBtn, modo === 'login' && styles.toggleBtnAtivo]} onPress={() => setModo('login')}>
          <Text style={[styles.toggleText, modo === 'login' && styles.toggleTextAtivo]}>Ja tenho cadastro</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, modo === 'cadastro' && styles.toggleBtnAtivo]} onPress={() => setModo('cadastro')}>
          <Text style={[styles.toggleText, modo === 'cadastro' && styles.toggleTextAtivo]}>Criar conta</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.aviso}>
        {modo === 'login' ? 'Entre com seu nome e email cadastrados' : 'Preencha seus dados para criar sua conta'}
      </Text>

      <TextInput style={styles.input} placeholder="Seu nome" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Seu email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      {modo === 'cadastro' && (
        <TextInput style={styles.input} placeholder="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
      )}

      <Text style={styles.label}>Voce e:</Text>
      <View style={styles.perfilRow}>
        <TouchableOpacity style={[styles.perfilBtn, perfil === 'familia' && styles.perfilAtivo]} onPress={() => setPerfil('familia')}>
          <Text style={[styles.perfilText, perfil === 'familia' && styles.perfilTextAtivo]}>Familia</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.perfilBtn, perfil === 'acompanhante' && styles.perfilAtivo]} onPress={() => setPerfil('acompanhante')}>
          <Text style={[styles.perfilText, perfil === 'acompanhante' && styles.perfilTextAtivo]}>Acompanhante</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btn} onPress={() => handleEntrar()} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{modo === 'login' ? 'Entrar' : 'Criar conta e entrar'}</Text>}
      </TouchableOpacity>

      <View style={styles.testeSection}>
        <Text style={styles.testeTitulo}>Acesso rapido para testes</Text>
        {USUARIOS_TESTE.map((u, i) => (
          <TouchableOpacity key={i} style={styles.testeBtn} onPress={() => handleEntrar(u)} disabled={loading}>
            <Text style={styles.testeBtnIcon}>{u.perfil === 'familia' ? '????????' : '?????'}</Text>
            <View>
              <Text style={styles.testeBtnNome}>{u.nome}</Text>
              <Text style={styles.testeBtnEmail}>{u.email}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f0f4ff', alignItems: 'center', justifyContent: 'center', padding: 24, paddingTop: 60 },
  logo: { fontSize: 40, fontWeight: 'bold', color: '#4A90E2', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  toggleRow: { flexDirection: 'row', backgroundColor: '#e8f0fe', borderRadius: 12, padding: 4, width: '100%', marginBottom: 8 },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  toggleBtnAtivo: { backgroundColor: '#4A90E2' },
  toggleText: { fontSize: 14, color: '#4A90E2', fontWeight: 'bold' },
  toggleTextAtivo: { color: '#fff' },
  aviso: { fontSize: 13, color: '#888', marginBottom: 16, textAlign: 'center' },
  input: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  label: { alignSelf: 'flex-start', fontWeight: 'bold', marginBottom: 8, color: '#333' },
  perfilRow: { flexDirection: 'row', gap: 12, marginBottom: 24, width: '100%' },
  perfilBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 2, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#fff' },
  perfilAtivo: { borderColor: '#4A90E2', backgroundColor: '#e8f0fe' },
  perfilText: { fontSize: 14, color: '#666' },
  perfilTextAtivo: { color: '#4A90E2', fontWeight: 'bold' },
  btn: { width: '100%', backgroundColor: '#4A90E2', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  testeSection: { width: '100%', marginTop: 24, padding: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  testeTitulo: { fontSize: 13, color: '#999', fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  testeBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: '#f8f8f8', marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  testeBtnIcon: { fontSize: 28 },
  testeBtnNome: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  testeBtnEmail: { fontSize: 12, color: '#888' },
});


import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { showAlert } from '../../services/alertHelper';
import EnderecoForm from '../../components/EnderecoForm';

const API_URL = 'https://qxoe8xxub9.execute-api.us-east-1.amazonaws.com/prod';

const PROFISSOES = [
  { id: 'estudante_enfermagem', label: 'Estudante de Enfermagem' },
  { id: 'tecnico_enfermagem', label: 'Tecnico em Enfermagem' },
  { id: 'enfermeiro', label: 'Enfermeiro(a)' },
  { id: 'bombeiro_civil', label: 'Bombeiro Civil' },
  { id: 'cuidador_idosos', label: 'Cuidador de Idosos' },
  { id: 'auxiliar_enfermagem', label: 'Auxiliar de Enfermagem' },
  { id: 'fisioterapeuta', label: 'Fisioterapeuta' },
  { id: 'outro', label: 'Outro' },
];

export default function CompletarCadastroAcompanhanteScreen({ route, navigation }) {
  const { usuario } = route.params;
  const [nomeCompleto, setNomeCompleto] = useState(usuario.nome || '');
  const [cpf, setCpf] = useState('');
  const [rgCnh, setRgCnh] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [profissao, setProfissao] = useState('');
  const [bio, setBio] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [fotoDocumento, setFotoDocumento] = useState(null);
  const [fotoCertificado, setFotoCertificado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadando, setUploadando] = useState(null);
  const [endereco, setEndereco] = useState({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' });

  const formatarCpf = (texto) => {
    const n = texto.replace(/\D/g, '');
    if (n.length <= 3) return n;
    if (n.length <= 6) return n.slice(0,3) + '.' + n.slice(3);
    if (n.length <= 9) return n.slice(0,3) + '.' + n.slice(3,6) + '.' + n.slice(6);
    return n.slice(0,3) + '.' + n.slice(3,6) + '.' + n.slice(6,9) + '-' + n.slice(9,11);
  };

  const formatarDataInput = (texto) => {
    const n = texto.replace(/\D/g, '');
    if (n.length <= 2) return n;
    if (n.length <= 4) return n.slice(0,2) + '/' + n.slice(2);
    return n.slice(0,2) + '/' + n.slice(2,4) + '/' + n.slice(4,8);
  };

  const escolherImagem = async (tipo) => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) { showAlert('Permissao necessaria', 'Precisamos de acesso as fotos'); return; }
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
    if (resultado.canceled) return;
    const uri = resultado.assets[0].uri;
    setUploadando(tipo);
    try {
      const extensao = uri.split('.').pop().toLowerCase().replace('jpeg', 'jpg');
      const urlRes = await axios.post(API_URL + '/upload-url', { tipo, extensao: extensao || 'jpg', acompanhante_id: usuario.id });
      const { uploadUrl, publicUrl } = urlRes.data;
      const response = await fetch(uri);
      const blob = await response.blob();
      await fetch(uploadUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': blob.type || 'image/jpeg' } });
      if (tipo === 'perfil') setFotoPerfil(publicUrl);
      if (tipo === 'documento') setFotoDocumento(publicUrl);
      if (tipo === 'certificado') setFotoCertificado(publicUrl);
      showAlert('Sucesso', 'Foto enviada!');
    } catch (err) {
      showAlert('Erro', 'Nao foi possivel enviar a foto: ' + err.message);
    } finally {
      setUploadando(null);
    }
  };

  const handleSalvar = async () => {
    if (!nomeCompleto.trim()) return showAlert('Campo obrigatorio', 'Preencha o nome completo');
    if (!dataNascimento || dataNascimento.length < 10) return showAlert('Campo obrigatorio', 'Preencha sua data de nascimento');
    if (!endereco.cep || !endereco.logradouro || !endereco.numero || !endereco.bairro || !endereco.cidade || !endereco.estado) return showAlert('Campo obrigatorio', 'Preencha o endereco completo');
    if (!cpf || cpf.length < 14) return showAlert('Campo obrigatorio', 'Preencha o CPF completo');
    if (!rgCnh.trim()) return showAlert('Campo obrigatorio', 'Preencha o RG ou CNH');
    if (!profissao) return showAlert('Campo obrigatorio', 'Selecione sua profissao');
    if (!bio.trim()) return showAlert('Campo obrigatorio', 'Preencha sobre voce');
    if (!fotoDocumento) return showAlert('Campo obrigatorio', 'Envie a foto do seu documento');
    if (!fotoPerfil) return showAlert('Campo obrigatorio', 'Envie sua foto de perfil');

    setLoading(true);
    try {
      const partes = dataNascimento.split('/');
      const dataISO = partes[2] + '-' + partes[1] + '-' + partes[0];
      await axios.put(API_URL + '/acompanhantes', {
        user_id: usuario.id,
        nome_completo: nomeCompleto,
        cpf, rg_cnh: rgCnh,
        data_nascimento: dataISO,
        profissao, bio,
        foto_perfil_url: fotoPerfil,
        foto_documento_url: fotoDocumento,
        foto_certificado_url: fotoCertificado,
        cep: endereco.cep,
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        complemento: endereco.complemento,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        estado: endereco.estado,
      });
      showAlert('Sucesso!', 'Cadastro completo! Aguardando verificacao da equipe.', [
        { text: 'OK', onPress: () => navigation.navigate('HomeAcompanhante', { usuario }) }
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Completar Cadastro</Text>
        <Text style={styles.headerSub}>Precisamos verificar sua identidade</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Nome completo <Text style={styles.obrig}>*</Text></Text>
        <TextInput style={styles.input} placeholder="Seu nome completo" value={nomeCompleto} onChangeText={setNomeCompleto} />

        <Text style={styles.label}>Data de nascimento <Text style={styles.obrig}>*</Text></Text>
        <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={dataNascimento} onChangeText={(t) => setDataNascimento(formatarDataInput(t))} keyboardType="numeric" maxLength={10} />

        <EnderecoForm endereco={endereco} onChange={setEndereco} />

        <Text style={styles.label}>CPF <Text style={styles.obrig}>*</Text></Text>
        <TextInput style={styles.input} placeholder="000.000.000-00" value={cpf} onChangeText={(t) => setCpf(formatarCpf(t))} keyboardType="numeric" maxLength={14} />

        <Text style={styles.label}>RG ou CNH <Text style={styles.obrig}>*</Text></Text>
        <TextInput style={styles.input} placeholder="Numero do documento" value={rgCnh} onChangeText={setRgCnh} />

        <Text style={styles.label}>Profissao / Qualificacao <Text style={styles.obrig}>*</Text></Text>
        <View style={styles.profissaoGrid}>
          {PROFISSOES.map(p => (
            <TouchableOpacity key={p.id} style={[styles.profissaoBtn, profissao === p.id && styles.profissaoBtnAtivo]} onPress={() => setProfissao(p.id)}>
              <Text style={[styles.profissaoText, profissao === p.id && styles.profissaoTextAtivo]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Sobre voce <Text style={styles.obrig}>*</Text></Text>
        <TextInput style={[styles.input, styles.inputMulti]} placeholder="Conte um pouco sobre sua experiencia..." value={bio} onChangeText={setBio} multiline numberOfLines={4} />

        <View style={styles.fotoSection}>
          <Text style={styles.label}>Foto de perfil <Text style={styles.obrig}>*</Text></Text>
          <TouchableOpacity style={styles.fotoBtn} onPress={() => escolherImagem('perfil')} disabled={uploadando === 'perfil'}>
            {fotoPerfil ? <Image source={{ uri: fotoPerfil }} style={styles.fotoPreview} /> : uploadando === 'perfil' ? <ActivityIndicator color="#27AE60" /> : <Text style={styles.fotoBtnText}>Toque para enviar foto</Text>}
          </TouchableOpacity>
          <Text style={styles.label}>Foto do documento (RG/CNH) <Text style={styles.obrig}>*</Text></Text>
          <TouchableOpacity style={styles.fotoBtn} onPress={() => escolherImagem('documento')} disabled={uploadando === 'documento'}>
            {fotoDocumento ? <Image source={{ uri: fotoDocumento }} style={styles.fotoPreview} /> : uploadando === 'documento' ? <ActivityIndicator color="#27AE60" /> : <Text style={styles.fotoBtnText}>Toque para enviar foto</Text>}
          </TouchableOpacity>
          <Text style={styles.label}>Certificado / Diploma (opcional)</Text>
          <TouchableOpacity style={styles.fotoBtn} onPress={() => escolherImagem('certificado')} disabled={uploadando === 'certificado'}>
            {fotoCertificado ? <Image source={{ uri: fotoCertificado }} style={styles.fotoPreview} /> : uploadando === 'certificado' ? <ActivityIndicator color="#27AE60" /> : <Text style={styles.fotoBtnText}>Toque para enviar foto</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSalvar} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Salvar Cadastro</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fff4' },
  header: { backgroundColor: '#27AE60', padding: 24, paddingTop: 48 },
  backBtn: { marginBottom: 8 },
  backText: { color: '#d0ffe4', fontSize: 16 },
  headerTitulo: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: '#d0ffe4', marginTop: 4 },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 6, marginTop: 12 },
  obrig: { color: '#e74c3c' },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  inputMulti: { height: 90, textAlignVertical: 'top' },
  profissaoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  profissaoBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 2, borderColor: '#ddd', backgroundColor: '#fff' },
  profissaoBtnAtivo: { borderColor: '#27AE60', backgroundColor: '#d4edda' },
  profissaoText: { fontSize: 13, color: '#666' },
  profissaoTextAtivo: { color: '#155724', fontWeight: 'bold' },
  fotoSection: { marginTop: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#d4edda' },
  fotoBtn: { backgroundColor: '#f8f8f8', borderRadius: 12, borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed', height: 100, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fotoBtnText: { color: '#888', fontSize: 14 },
  fotoPreview: { width: '100%', height: '100%' },
  btn: { backgroundColor: '#27AE60', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';

export default function EnderecoForm({ endereco, onChange }) {
  const [buscando, setBuscando] = useState(false);

  const formatarCep = (texto) => {
    const n = texto.replace(/\D/g, '');
    if (n.length <= 5) return n;
    return n.slice(0,5) + '-' + n.slice(5,8);
  };

  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    setBuscando(true);
    try {
      const res = await fetch('https://viacep.com.br/ws/' + cepLimpo + '/json/');
      const data = await res.json();
      if (!data.erro) {
        onChange({ ...endereco, cep, logradouro: data.logradouro || '', bairro: data.bairro || '', cidade: data.localidade || '', estado: data.uf || '' });
      }
    } catch (err) {
      console.log('Erro CEP:', err.message);
    } finally {
      setBuscando(false);
    }
  };

  const atualizar = (campo, valor) => onChange({ ...endereco, [campo]: valor });

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Endereco</Text>
      <Text style={styles.label}>CEP <Text style={styles.obrig}>*</Text></Text>
      <View style={styles.cepRow}>
        <TextInput style={[styles.input, {flex: 1}]} placeholder="00000-000" value={endereco.cep || ''} onChangeText={(t) => { const f = formatarCep(t); atualizar('cep', f); if (f.length === 9) buscarCep(f); }} keyboardType="numeric" maxLength={9} />
        {buscando && <ActivityIndicator color="#4A90E2" style={{marginLeft: 8}} />}
      </View>
      <Text style={styles.label}>Logradouro <Text style={styles.obrig}>*</Text></Text>
      <TextInput style={styles.input} placeholder="Rua, Avenida..." value={endereco.logradouro || ''} onChangeText={(t) => atualizar('logradouro', t)} />
      <View style={styles.row}>
        <View style={{flex: 1, marginRight: 8}}>
          <Text style={styles.label}>Numero <Text style={styles.obrig}>*</Text></Text>
          <TextInput style={styles.input} placeholder="123" value={endereco.numero || ''} onChangeText={(t) => atualizar('numero', t)} keyboardType="numeric" />
        </View>
        <View style={{flex: 2}}>
          <Text style={styles.label}>Complemento</Text>
          <TextInput style={styles.input} placeholder="Apto, Bloco..." value={endereco.complemento || ''} onChangeText={(t) => atualizar('complemento', t)} />
        </View>
      </View>
      <Text style={styles.label}>Bairro <Text style={styles.obrig}>*</Text></Text>
      <TextInput style={styles.input} placeholder="Bairro" value={endereco.bairro || ''} onChangeText={(t) => atualizar('bairro', t)} />
      <View style={styles.row}>
        <View style={{flex: 2, marginRight: 8}}>
          <Text style={styles.label}>Cidade <Text style={styles.obrig}>*</Text></Text>
          <TextInput style={styles.input} placeholder="Cidade" value={endereco.cidade || ''} onChangeText={(t) => atualizar('cidade', t)} />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.label}>Estado <Text style={styles.obrig}>*</Text></Text>
          <TextInput style={styles.input} placeholder="SP" value={endereco.estado || ''} onChangeText={(t) => atualizar('estado', t.toUpperCase())} maxLength={2} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#ddd' },
  titulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4, marginTop: 8 },
  obrig: { color: '#e74c3c' },
  input: { backgroundColor: '#f8f8f8', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  cepRow: { flexDirection: 'row', alignItems: 'center' },
  row: { flexDirection: 'row' },
});

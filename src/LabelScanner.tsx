import React, { useRef, useState } from 'react';
import { ActivityIndicator, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requireOptionalNativeModule } from 'expo';
import * as ImagePicker from 'expo-image-picker';
import { parseLabel } from './label';
import { money, parsePrice } from './prices';

type Reader = { recognize(uri: string): Promise<string> };
export function LabelScanner({ onConfirm }: { onConfirm: (name: string, price: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState('');
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [prices, setPrices] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [denied, setDenied] = useState(false);
  const lock = useRef(false);
  async function capture() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true); setError(''); setDenied(false);
    try {
      const reader = requireOptionalNativeModule<Reader>('LabelReader');
      if (!reader) { setError('Esta versão ainda não tem o leitor de etiquetas. Instale o APK atualizado. No Expo Go, continue digitando os produtos.'); return; }
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) { setDenied(!permission.canAskAgain); setError('A câmera precisa da sua permissão. Você também pode fechar e digitar o produto.'); return; }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 1, exif: false });
      if (result.canceled || !result.assets?.[0]) return;
      const uri = result.assets[0].uri;
      setPhoto(uri); setText(''); setName(''); setPrice(''); setPrices([]);
      const recognized = await reader.recognize(uri);
      const suggestion = parseLabel(recognized);
      setText(recognized); setName(suggestion.name); setPrices(suggestion.prices);
      if (suggestion.prices.length === 1) setPrice((suggestion.prices[0] / 100).toFixed(2).replace('.', ','));
      if (!recognized.trim()) setError('Não consegui ler o texto. Tente outra foto com boa luz ou preencha os campos abaixo.');
      else if (!suggestion.prices.length) setError('Não identifiquei um preço completo. Confira a foto e digite o valor abaixo.');
    } catch {
      setError('Não foi possível ler a foto. Tente novamente, aproxime a etiqueta e evite reflexos. Você pode continuar digitando.');
    } finally { setBusy(false); lock.current = false; }
  }
  function confirm() {
    const cents = parsePrice(price);
    if (!name.trim() || cents === null || cents <= 0) { setError('Confira o nome e informe um preço maior que zero.'); return; }
    onConfirm(name.trim(), (cents / 100).toFixed(2).replace('.', ',')); setVisible(false);
  }
  return <>
    <Pressable accessibilityRole="button" style={styles.button} onPress={() => { setVisible(true); setPhoto(''); setText(''); setName(''); setPrice(''); setPrices([]); setError(''); setDenied(false); }}><Text style={styles.buttonText}>Fotografar etiqueta</Text></Pressable>
    <Text style={styles.note}>Leia o nome e o preço pela câmera e confira antes de adicionar.</Text>
    <Modal visible={visible} animationType="slide" onRequestClose={() => { if (!busy) setVisible(false); }}>
      <SafeAreaView style={styles.safe}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
        <Text style={styles.title}>Ler etiqueta</Text>
        <Text style={styles.note}>Fotografe uma etiqueta de cada vez, de frente e com boa luz. Recorte a foto para deixar apenas o produto desejado.</Text>
        <Text style={styles.note}>A leitura acontece neste aparelho. A foto não é enviada a um servidor.</Text>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy }} disabled={busy} style={styles.button} onPress={capture}><Text style={styles.buttonText}>{photo ? 'Tirar outra foto' : 'Abrir câmera'}</Text></Pressable>
        {busy && <View accessibilityLiveRegion="polite"><ActivityIndicator color="#176149"/><Text style={styles.note}>Lendo a etiqueta…</Text></View>}
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {denied && <Pressable accessibilityRole="button" style={styles.button} onPress={() => { Linking.openSettings().catch(() => setError('Abra as configurações do celular e permita o uso da câmera para o Valor Certo.')); }}><Text style={styles.buttonText}>Abrir configurações</Text></Pressable>}
        {!!photo && !busy && <>
          <Image source={{ uri: photo }} style={styles.photo} accessibilityLabel="Foto da etiqueta para conferência" resizeMode="contain"/>
          <Text style={styles.title}>Confira os dados</Text>
          <Text style={styles.note}>A leitura pode errar. Confira o produto, a unidade e as condições de promoção ou clube.</Text>
          {prices.length > 1 && <Text style={styles.error}>Há vários preços na etiqueta. Escolha o que se aplica à sua compra.</Text>}
          <View style={styles.options}>{prices.map(cents => <Pressable accessibilityRole="button" accessibilityLabel={`Usar ${money(cents)}`} style={styles.option} key={cents} onPress={() => setPrice((cents / 100).toFixed(2).replace('.', ','))}><Text style={styles.buttonText}>{money(cents)}</Text></Pressable>)}</View>
          <Text style={styles.label}>Nome do produto</Text><TextInput accessibilityLabel="Nome reconhecido do produto" value={name} onChangeText={setName} maxLength={100} style={styles.input}/>
          <Text style={styles.label}>Preço unitário (R$)</Text><TextInput accessibilityLabel="Preço reconhecido da etiqueta" value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={styles.input}/>
          {!!text && <View><Text style={styles.label}>Texto lido na etiqueta</Text><Text selectable style={styles.note}>{text}</Text></View>}
          <Pressable accessibilityRole="button" style={styles.button} onPress={confirm}><Text style={styles.buttonText}>Confirmar e preencher produto</Text></Pressable>
          <Text style={styles.note}>Depois, informe a quantidade e toque em “Adicionar à compra”.</Text>
        </>}
        <Pressable accessibilityRole="button" disabled={busy} style={styles.close} onPress={() => setVisible(false)}><Text style={styles.buttonText}>Voltar sem preencher</Text></Pressable>
      </ScrollView></SafeAreaView>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F7F2' }, page: { padding: 22, gap: 16, paddingBottom: 40, width: '100%', maxWidth: 640, alignSelf: 'center' },
  title: { fontSize: 23, fontWeight: '700', color: '#193D30' }, note: { color: '#637269', fontSize: 14, lineHeight: 21 },
  button: { backgroundColor: '#CDE996', borderRadius: 12, padding: 17, alignItems: 'center' }, buttonText: { color: '#193D30', fontWeight: '700', fontSize: 16 },
  error: { color: '#A33128', lineHeight: 21 }, photo: { width: '100%', height: 240, borderRadius: 12, backgroundColor: '#E3E8DF' },
  label: { color: '#4F6256', fontSize: 14, fontWeight: '600' }, input: { padding: 14, minHeight: 50, backgroundColor: '#fff', borderWidth: 1, borderColor: '#DCE3D8', borderRadius: 12, color: '#193D30', fontSize: 16 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, option: { padding: 14, borderWidth: 1, borderColor: '#176149', borderRadius: 12 }, close: { padding: 16, alignItems: 'center' },
});

import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { money, parsePrice, Product, totals } from './src/prices';
import { LabelScanner } from './src/LabelScanner';
const KEY = 'valor-certo:shopping:v1';
export default function App() {
  const [items, setItems] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState('');
  useEffect(() => { AsyncStorage.getItem(KEY).then(raw => {
    if (raw) {
      const data = JSON.parse(raw);
      if (!Array.isArray(data) || !data.every(p => typeof p.id === 'string' && typeof p.name === 'string' && Number.isSafeInteger(p.quantity) && p.quantity > 0 && Number.isSafeInteger(p.shelf) && p.shelf >= 0 && (p.checkout === null || (Number.isSafeInteger(p.checkout) && p.checkout >= 0)))) throw new Error('Invalid data');
      setItems(data);
    }
    setReady(true);
  }).catch(() => setStorageError('Não foi possível recuperar sua compra. Feche e abra o app para tentar novamente.')); }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem(KEY, JSON.stringify(items)).then(() => setStorageError('')).catch(() => setStorageError('Não foi possível salvar. Mantenha o app aberto para não perder a compra.')); }, [items, ready]);
  const summary = totals(items);
  const difference = summary.charged - summary.expected;
  function add() {
    const cents = parsePrice(price); const count = Number(quantity);
    if (!name.trim() || cents === null || cents <= 0 || !/^\d+$/.test(quantity) || !Number.isSafeInteger(count) || count < 1 || count > 999) { setError('Informe o produto, um preço maior que zero e uma quantidade entre 1 e 999.'); return; }
    setItems(old => [...old, { id: Date.now().toString() + Math.random().toString(36).slice(2), name: name.trim(), shelf: cents, quantity: count, checkout: null }]);
    setName(''); setPrice(''); setQuantity('1'); setError('');
  }
  return <SafeAreaProvider><SafeAreaView style={s.safe}><StatusBar style="dark" /><KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
    <View style={s.header}><Text style={s.brand}>✓ Valor Certo</Text><Text style={s.badge}>SUA COMPRA, SEM SURPRESAS</Text></View>
    <Text style={s.title}>No carrinho.{'\n'}Tudo sob controle.</Text><Text style={s.subtitle}>Anote na prateleira. Confira no caixa.</Text>
    <View style={s.summary}><Text style={s.summaryLabel}>TOTAL DA PRATELEIRA</Text><Text style={s.total}>{money(summary.expected)}</Text><Text style={s.summaryNote}>{items.length} produtos · {items.reduce((n, p) => n + p.quantity, 0)} unidades</Text><View style={s.divider}/><Text style={s.summaryNote}>Total com preços conferidos: {money(summary.charged)}</Text><Text style={s.summaryNote}>{summary.checked} de {items.length} produtos conferidos</Text></View>
    {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
    {!ready ? <Text>Carregando sua compra…</Text> : <>
    <View style={s.card}><Text style={s.section}>Adicionar produto</Text><LabelScanner onConfirm={(labelName, labelPrice) => { setName(labelName); setPrice(labelPrice); setQuantity('1'); setError(''); }}/><Text style={s.label}>Nome do produto</Text><TextInput accessibilityLabel="Nome do produto" placeholder="Ex.: Arroz 5 kg" value={name} onChangeText={setName} style={s.input} maxLength={100}/><View style={s.row}><View style={s.flex}><Text style={s.label}>Preço unitário (R$)</Text><TextInput accessibilityLabel="Preço da prateleira" placeholder="0,00" keyboardType="decimal-pad" value={price} onChangeText={setPrice} style={s.input}/></View><View style={s.qty}><Text style={s.label}>Quantidade</Text><TextInput accessibilityLabel="Quantidade" keyboardType="number-pad" value={quantity} onChangeText={setQuantity} style={s.input} maxLength={3}/></View></View>{!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}<Pressable accessibilityRole="button" onPress={add} style={s.button}><Text style={s.buttonText}>＋ Adicionar à compra</Text></Pressable></View>
    <Text style={s.section}>Minha compra</Text><Text style={s.subtitle}>Digite o preço unitário do caixa para conferir.</Text>
    {!items.length && <View style={s.empty}><Text style={s.emptyIcon}>＋</Text><Text style={s.section}>Seu carrinho começa aqui</Text><Text style={s.subtitle}>Adicione o primeiro produto acima.</Text></View>}
    {items.map(item => <ProductRow key={item.id} item={item} onPrice={checkout => setItems(old => old.map(p => p.id === item.id ? { ...p, checkout } : p))} onRemove={() => setItems(old => old.filter(p => p.id !== item.id))}/>)}
    {!!items.length && <View style={s.card}><Text style={s.section}>{summary.checked < items.length ? 'Conferência em andamento' : difference > 0 ? 'Atenção à diferença' : 'Conferência concluída'}</Text><Text style={[s.result, difference > 0 && s.error]}>{difference === 0 ? 'Sem diferença nos itens conferidos' : `${money(Math.abs(difference))} ${difference > 0 ? 'a mais' : 'a menos'}`}</Text><Text style={s.subtitle}>Itens ainda não conferidos usam o preço da prateleira no total.</Text><Pressable accessibilityRole="button" style={s.clear} onPress={() => Alert.alert('Iniciar nova compra?', 'A lista atual será apagada deste aparelho.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Apagar compra', style: 'destructive', onPress: () => setItems([]) }])}><Text style={s.remove}>Iniciar nova compra</Text></Pressable></View>}
    </>}
    <Text style={s.footer}>Salvo neste aparelho · Valores em reais</Text>
  </ScrollView></KeyboardAvoidingView></SafeAreaView></SafeAreaProvider>;
}
function ProductRow({ item, onPrice, onRemove }: { item: Product; onPrice: (price: number | null) => void; onRemove: () => void }) {
  const [value, setValue] = useState(item.checkout === null ? '' : (item.checkout / 100).toFixed(2).replace('.', ','));
  const [invalid, setInvalid] = useState(false);
  const delta = item.checkout === null ? null : (item.checkout - item.shelf) * item.quantity;
  return <View style={s.card}><View style={s.row}><View style={s.flex}><Text style={s.product}>{item.name}</Text><Text style={s.subtitle}>{item.quantity} × {money(item.shelf)} · {money(item.quantity * item.shelf)}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Remover ${item.name}`} onPress={onRemove} style={s.delete}><Text style={s.remove}>Remover</Text></Pressable></View><Text style={s.label}>Preço unitário no caixa (R$)</Text><TextInput accessibilityLabel={`Preço no caixa de ${item.name}`} style={s.input} keyboardType="decimal-pad" placeholder="Ainda não conferido" value={value} onChangeText={text => { setValue(text); const parsed = parsePrice(text); setInvalid(text.trim() !== '' && parsed === null); onPrice(parsed); }}/>{invalid && <Text style={s.error}>Use um preço válido, como 12,99.</Text>}<Text style={delta !== null && delta > 0 ? s.error : s.status}>{delta === null ? 'Aguardando conferência' : delta === 0 ? '✓ Preço certo' : `${money(Math.abs(delta))} ${delta > 0 ? 'a mais no caixa' : 'a menos no caixa'}`}</Text></View>;
}
const s = StyleSheet.create({
  flex: { flex: 1 }, safe: { flex: 1, backgroundColor: '#F6F7F2' }, page: { padding: 22, gap: 16, maxWidth: 640, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  header: { gap: 8, marginTop: 10 }, brand: { fontSize: 24, fontWeight: '800', color: '#176149' }, badge: { fontSize: 10, letterSpacing: 2, color: '#697970', fontWeight: '700' },
  title: { fontSize: 36, lineHeight: 42, fontWeight: '800', color: '#193D30', marginTop: 12 }, subtitle: { fontSize: 14, color: '#637269', lineHeight: 21 },
  summary: { backgroundColor: '#164E3D', padding: 24, borderRadius: 24, gap: 10 }, summaryLabel: { fontSize: 11, letterSpacing: 2, color: '#D2E5BA' }, total: { fontSize: 42, fontWeight: '800', color: '#fff' }, summaryNote: { color: '#DAE8E0', fontSize: 13 }, divider: { height: 1, backgroundColor: '#427360', marginVertical: 6 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, gap: 12, borderWidth: 1, borderColor: '#E3E8DF' }, section: { fontSize: 19, fontWeight: '700', color: '#193D30' }, label: { fontSize: 12, fontWeight: '600', color: '#4F6256', marginBottom: 5 }, input: { backgroundColor: '#F7F8F4', borderWidth: 1, borderColor: '#DCE3D8', borderRadius: 12, padding: 14, fontSize: 16, color: '#193D30', minHeight: 50 }, row: { flexDirection: 'row', gap: 12, alignItems: 'center' }, qty: { width: 105 }, button: { backgroundColor: '#CDE996', borderRadius: 12, padding: 17, alignItems: 'center' }, buttonText: { fontWeight: '800', fontSize: 16, color: '#193D30' }, error: { color: '#A33128', lineHeight: 21 }, status: { color: '#176149', fontSize: 13 }, product: { fontWeight: '700', fontSize: 17, color: '#193D30' }, delete: { paddingVertical: 12, paddingLeft: 8 }, remove: { color: '#8B3930', fontSize: 13, fontWeight: '600' }, empty: { alignItems: 'center', paddingVertical: 28, gap: 12 }, emptyIcon: { fontSize: 36, color: '#176149' }, result: { fontSize: 18, fontWeight: '700', color: '#176149' }, clear: { paddingVertical: 14, alignItems: 'center' }, footer: { textAlign: 'center', color: '#748075', fontSize: 12, marginTop: 10 },
});

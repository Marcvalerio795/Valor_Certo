# Valor Certo

Aplicativo Android e iPhone para registrar preços da prateleira e conferir o valor cobrado no caixa. Desenvolvido com React Native, Expo SDK 57 e TypeScript.

## Desenvolvimento

Use Node.js 24 e npm. Na pasta do projeto:

```sh
npm ci
npm start
```

Abra no Expo Go compatível com SDK 57 em um aparelho que consiga acessar o servidor de desenvolvimento. `npm run android` requer Android SDK/emulador; `npm run ios` requer macOS com Xcode. Este ambiente Linux gera os bundles de ambas as plataformas, mas não executa o simulador iOS. Builds instaláveis e publicação nas lojas ainda precisam de configuração e contas próprias.

## Primeira versão

- Cadastro de nome, preço unitário e quantidade inteira (1 a 999).
- Total previsto, conferência por produto e diferenças considerando a quantidade.
- Preços calculados em centavos; entrada com vírgula ou ponto.
- Lista salva localmente no aparelho, sem login ou sincronização.
- Exclusão de produtos e confirmação antes de apagar a compra.

Informe preços unitários no caixa. Produtos não conferidos usam o preço da prateleira no total provisório. A lista não tem dados de demonstração.

## Validação

```sh
npm run typecheck
npm test
CI=1 EXPO_NO_TELEMETRY=1 npx expo export --platform all
```

Teste em aparelho: adicione duas unidades de um produto a R$ 12,99, confira a R$ 13,99 e verifique R$ 2,00 a mais. Reinicie o app e confira a persistência. Testes de interface e armazenamento em aparelho ainda precisam ser realizados.

Neste ambiente de nuvem, inicie com caches em pastas graváveis:

```sh
__UNSAFE_EXPO_HOME_DIRECTORY=/tmp/valor-expo XDG_CACHE_HOME=/tmp/valor-cache EXPO_NO_TELEMETRY=1 npm start -- --offline --port 8082
```

O modo offline evita consultas externas do Expo; conectar um aparelho ainda exige acesso de rede ao servidor.

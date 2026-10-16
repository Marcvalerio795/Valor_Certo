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

## Leitura de etiquetas (1.1)

O botão **Fotografar etiqueta** abre a revisão. Toque em **Abrir câmera**, fotografe e recorte uma única etiqueta. O leitor sugere o nome e os preços reconhecidos. Confira a foto, escolha o valor aplicável (normal, promoção, clube, unidade ou quilo) e corrija os campos quando necessário. **Confirmar e preencher produto** apenas preenche o formulário: a inclusão na compra exige informar a quantidade e tocar em **Adicionar à compra**.

O OCR roda no aparelho: ML Kit com modelo latino incluído no APK Android e Apple Vision no iOS. Não há servidor, API, chave ou envio de fotos. Imagens de captura ficam no cache privado do app, sem cópia automática para a galeria. Preços cujos centavos forem reconhecidos em linhas separadas não são reconstruídos: digite-os manualmente. Nenhum preço é adicionado sem revisão. Negação de permissão, cancelamento e falhas de leitura mantêm a digitação manual disponível.

### Gerar APK atualizado

O módulo local `modules/label-reader` exige uma **nova compilação nativa**; não funciona no Expo Go nem no APK 1.0. Preserve o vínculo existente `expo.extra.eas.projectId`, `expo.owner` e o `eas.json` ao atualizar uma cópia local. Mantenha o identificador Android `com.marcvalerio795.valorcerto` e a mesma chave de assinatura para instalar como atualização sem apagar dados. Não desinstale a versão anterior para atualizar.

```sh
npm ci
npx eas-cli@latest build --platform android --profile preview
```

O perfil preview deste repositório gera APK e incrementa a versão Android usando o controle remoto do EAS. Se houver configuração local preexistente, preserve-a e confirme que o perfil preview tem `android.buildType: "apk"` e incremento de versão habilitado.

### Validação da câmera em aparelho (pendente)

1. Instale o novo APK sobre o anterior usando a mesma assinatura; confirme a compra preservada.
2. Em modo avião, fotografe uma etiqueta com nome e um preço (ex.: ARROZ 5KG, R$ 12,99). Revise e confirme; só então adicione 2 unidades, total R$ 25,98.
3. Fotografe uma etiqueta com preços normal e de clube. Ambos devem aparecer; nenhum deve estar pré-selecionado.
4. Teste foto desfocada, preço ausente, recusa de câmera, cancelamento e nova foto. Deve ser possível voltar à digitação manual.
5. Feche e reabra o app e confirme a persistência. O iOS requer compilação e teste em aparelho separado.

Os testes automatizados verificam extração de preços e cálculos. Autolinking e prebuild verificam a integração de configuração; exportar bundles não compila Kotlin/Swift nem valida a câmera física.

Validação nesta alteração: seis testes e TypeScript passaram; bundles Android/iOS, autolinking local de ambas as plataformas e prebuild Android/iOS passaram. A compilação nativa local não foi executada até o fim: o Gradle não conseguiu resolver `services.gradle.org` neste ambiente, que também não tem Android SDK configurado. Compilação pelo EAS e reconhecimento de fotos reais permanecem pendentes; os bundles JavaScript não substituem essas verificações.

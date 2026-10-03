# Myu

Código oficial do site interativo de Myu, migrado integralmente da versão 41 publicada em 2 de outubro de 2026.

- Site no GitHub Pages: https://joaobruck.github.io/Livro/
- Publicação original preservada: https://myu-capitulo-um.http-joao-spam.chatgpt.site/

Os cinco capítulos, os enigmas, os documentos, as imagens, a leitura salva, os ajustes de aparência e os pós-créditos com animação e áudio fazem parte deste projeto. A migração preservou a versão 41; a revisão editorial de 3 de outubro está registrada separadamente, sem mudar os acontecimentos nem as âncoras de leitura.

## Leitura e investigação

- **Leitura → Guardar ou transferir meu progresso** abre `/progresso/`: exportação/importação de um arquivo local, com validação e cópia do estado anterior antes da substituição.
- A mesma página oferece um download opcional para ler offline (cerca de 27 MB). O service worker usa a rede quando disponível e uma cópia completa quando não há conexão. A cópia mantém os bloqueios narrativos e pode ser removida sem apagar o progresso.
- Nos capítulos 3 e 4, a gaveta inclui comparação opcional de trechos e um caderno de hipóteses. As análises entram conforme as descobertas já feitas; não acrescentam bloqueios. T-01 permanece um registro de apoio, sem exigir um novo enigma.
- O som continua nos pós-créditos. Não foi adicionado áudio recorrente nem minigame ao confronto final.

## Desenvolvimento

Use Node.js 24 e o arquivo de dependências versionado:

```bash
npm ci
npm run dev
```

O desenvolvimento abre na raiz do endereço local. Para testar exatamente a versão destinada ao GitHub Pages:

```bash
npm test
npm start
```

Abra `http://localhost:4173/Livro/`. A compilação estática completa fica em `out/`.

## Publicação

O workflow `.github/workflows/pages.yml` compila o site, executa os testes e publica o resultado após alterações em `main`. No GitHub, a origem de **Settings → Pages → Build and deployment** deve ser **GitHub Actions**. Depois de habilitar o Pages, execute novamente **Publish Myu** na aba Actions se a primeira publicação já tiver sido tentada.

O caminho `/Livro` é aplicado durante a compilação. Para um domínio próprio sem esse prefixo, use `NEXT_PUBLIC_BASE_PATH="" npm run build` e atualize a mesma variável no workflow. Não edite os links dos capítulos para inserir o prefixo manualmente: `next/link` já o adiciona; imagens, áudio e navegação nativa usam `sitePath`.

## Preservação

Os arquivos de história, os identificadores dos parágrafos e todos os recursos originais são comparados por SHA-256 com `docs/migration/source-v41.json` nos testes. A revisão de Vicente está em `docs/reviews/2026-10-03-narrative.json`: os testes revertem apenas os trechos documentados e conferem o hash original, protegendo o restante da história. Também verificam a exportação das páginas, os caminhos, os enigmas, a retomada, os controles, os pós-créditos, a transferência dos saves e a recuperação offline.

O progresso continua salvo no navegador com as mesmas chaves de antes. Por segurança dos navegadores, o endereço original e o GitHub Pages têm armazenamentos separados: um ponto salvo no endereço antigo não aparece automaticamente no novo. Os dados antigos permanecem no endereço original; esta migração não os apaga.

A página reservada do Outro Lado continua indisponível, como na versão publicada. O repositório separado do jogo (`JoaoBruck/Myu`) não é substituído por este projeto.

Os arquivos auxiliares da hospedagem anterior permanecem no código para referência. O GitHub Pages publica somente `out/`, sem os documentos de planejamento. A configuração de tipos da versão estática inclui apenas a aplicação e a configuração do Next.js; os modelos de Worker/D1 não utilizados não participam dessa compilação.

## Origem

- Versão de origem: **41**
- Commit original: `71c3e5f82075531bb674315394567434a39c8037`
- Fonte: código real do site publicado, incluindo os pós-créditos.
- Nenhum protótipo experimental foi usado como referência.

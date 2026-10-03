# Revisão de 3 de outubro de 2026

A migração fiel da versão 41 continua sendo a base. O autor autorizou selecionar e publicar os aprimoramentos discutidos, descartando os que prejudicassem a experiência.

## Decisões editoriais

A cena do escritório no capítulo 1 acumulava paradas de caneta, tinta, ruído de chaves, recusa implícita de acesso e advertência contra Derick. A revisão concentra a inquietação em Leroy e no retorno ao caso, deixando Vicente funcionar como um coordenador conhecido e prestativo. A aprovação ligada à utilidade de Leroy permanece ambígua. A foto continua mostrando as chaves; a narração deixa de chamar atenção para o fato de ele não percebê-las. No capítulo 2, a preocupação com a foto original substitui a mudança explícita de tom.

São 20 alterações de texto em posição fixa. O registro JSON adjacente permite reconstruir e verificar por hash a versão anterior. Nenhum token, cena, âncora ou fato da resolução foi removido. Capítulos 3–5, imagens e áudio são os originais.

## Comparar e anotar

- Entrada: gaveta já existente dos capítulos 3 e 4, depois de recolher os registros.
- Ação: escolher dois documentos e um fragmento de cada um; sem temporizador, arraste obrigatório ou nova trava.
- Conhecimento: fotografia e ocorrência ficam disponíveis quando recolhidas. Carbono, cronologia, cinto e anexos exigem a conclusão de seu exame original. A anomalia exclusiva do leitor não entra nas falas dos personagens.
- Relações: referência OT-0812-44; saída/chamada; coleta/exame ausente; cor da jaqueta/microfibras; contagem declarada/marcas de carga.
- Feedback válido: descreve a ligação e seu limite, seguido de uma reação curta de Leroy ou Derick pertinente aos trechos.
- Combinação fraca: permanece uma hipótese; não apaga pistas, não bloqueia a história e pode ser registrada em texto livre.
- Retorno: ligações registradas e nota de até 4.000 caracteres persistem separadamente. Reiniciar a investigação conserva as notas; relações antigas só reaparecem quando seus documentos estão disponíveis.
- Acessibilidade: controles nativos com rótulos, teclado, seleção por toque, colunas empilhadas no celular, sem dependência de cor ou áudio.

## Progresso e offline

`/progresso/` permite exportar/importar somente as chaves conhecidas do Myu. O arquivo é validado antes de escrever, tem limite de tamanho e não permite redirecionamento externo. A importação exige baixar a cópia atual antes da substituição quando existe um save. Uma falha de escrita tenta restaurar todas as chaves anteriores. A página não monta o rastreador de leitura, evitando que ele sobrescreva o save importado ao navegar.

Offline é uma escolha explícita. O build gera um pacote de páginas, payloads de navegação, imagens, documentos, scripts e áudio. O worker só ativa uma cópia inteira; uma falha descarta a instalação parcial. A rede é preferida quando funciona. A cópia anterior é preservada por uma geração para abas abertas, e caches de outros projetos não são removidos. Os bloqueios continuam sendo controlados pelas descobertas existentes. Armazenamento privado/restrito, falta de espaço e interrupção da rede têm feedback.

## Ideias deixadas de fora

- Minigame da porta: acrescentaria tarefa repetitiva no ponto de maior desespero.
- Trilha/sons narrativos espalhados: o autor restringiu som ao encerramento e a outra cena ainda não identificada com segurança.
- Outra reconstrução espacial e outro puzzle de sobreposição: as interações existentes já cumprem essas funções.
- Reescrita do desfecho e nova progressão de culpados: alterariam o cânone aprovado sem necessidade.

## Verificação

Testes exercitam saves completos e parciais, restauração, arquivos malformados, escrita interrompida, combinações em ambas as ordens, pares plausíveis fracos, bloqueio de informação futura, versão offline incompleta, navegação offline com query/RSC, caminhos montados e integridade do conteúdo. Os testes anteriores continuam cobrindo os enigmas, retomada, contraste das quatro paletas e sincronização dos pós-créditos.

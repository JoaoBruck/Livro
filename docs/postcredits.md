# Pós-créditos — Jornal da Cidade

Cena acrescentada depois de FIM / MYU / Zero, sem alterar o capítulo nem a liberação por leitura. A entrevista continua depois do resgate; não estabelece absolvição, prisão ou encerramento da investigação.

Vicente repete sua lógica no galpão: invoca o cuidado oferecido, desqualifica a possibilidade de Derick ser ouvido sob pretexto de proteção, reivindica Leroy como filho e se ressente de ser responsabilizado. O repórter insiste na porta. Não há explicação de que o choro seja falso, sorriso maligno nem conhecimento sobrenatural.

## Arte

Dois assets originais gerados com imagegen a partir da referência fornecida pelo autor: televisão vazada e folha de nove expressões. Os PNGs selecionados foram copiados sem edição. A abertura da TV usa as proporções da transparência real; os quadros são recortados proporcionalmente em CSS. Legendas e letreiros são texto HTML.

## Som

Efeitos originais criados offline com **jsfxr**, o gerador de efeitos para jogos derivado de sfxr. Nenhum áudio de Undertale foi copiado.

Fonte e documentação consultadas em 02/10/2026: https://github.com/chr15m/jsfxr — licença Unlicense. Gerador: `scripts/create-postcredits-audio.mjs`; recebe o caminho de uma cópia local de `sfxr.js`, com `riffwave.js` ao lado. Os arquivos WAV resultantes são hospedados pelo site e não exigem jsfxr em tempo de execução. A semente de ruído é fixa.

- Vicente: pulso grave filtrado, 133 Hz, sílabas de 66 ms.
- Repórter: pulso mais alto, 219 Hz, sílabas de 60 ms.
- Queda: corpo grave, estalo e vibração da carcaça; contato aos 3,2 s.
- Ligamento: relé e estática curta, sem apito agudo sustentado.

As vozes respeitam pontuação e intervalos de silêncio. A mesma linha de tempo governa os quadros e os efeitos. O som só é liberado após um gesto aceito pelo navegador; há botão explícito, controle de volume e mute. Não existe narração por voz sintética do sistema.

## Comportamento

A queda começa quando a TV entra suficientemente na tela. Pausar, sair da região ou ocultar a aba suspende o relógio e interrompe os sons. Voltar não reinicia a queda. Rever reinicia; próxima fala avança e pausa, permitindo ler no próprio ritmo. Movimento reduzido e modo foco pulam a queda e evitam animação de boca. A entrevista integral está disponível em texto.

Validação: testes da linha de tempo, sincronização de boca/áudio, intervalos sem voz, retomada, avanço, sinal e margem dos WAVs, compilação e testes existentes do leitor. A inspeção de navegador depende do controle de prévia exigido pelo ambiente Sites.

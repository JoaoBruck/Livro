# Pós-créditos — Jornal da Cidade

Cena acrescentada depois de FIM / MYU / Zero, sem alterar o capítulo nem a liberação por leitura. A entrevista continua depois do resgate; não estabelece absolvição, prisão ou encerramento da investigação.

Entrevista substituída pelo roteiro enviado pelo autor em 04/10/2026, com ajustes de fluidez. Vicente invoca o cuidado oferecido, alega que subia para avisar Kaio e que tentou voltar ao ver a fumaça, reivindica Leroy como filho e nega envolvimento na morte de Alana e no incêndio. Essas afirmações pertencem à defesa pública dele; não alteram os acontecimentos do capítulo. A contagem das perdas foi esclarecida como Alana e Leroy, sem sugerir uma terceira morte. Não há explicação de que o choro seja falso, sorriso maligno nem conhecimento sobrenatural.

## Arte

Dois assets originais gerados com imagegen a partir da referência fornecida pelo autor: televisão vazada e folha de nove expressões. Os PNGs selecionados foram copiados sem edição. A abertura da TV usa as proporções da transparência real; os quadros são recortados proporcionalmente em CSS. Legendas e letreiros são texto HTML.

Expressões organizadas por intenção: gesto de indignação na primeira resposta; postura composta ao relatar a fumaça; cabeça baixa antes de dizer “Leroy”; mão nos olhos, rosto coberto e pedido de desculpa; rosto com lágrimas ao recordar o menino; retomada do controle diante das perguntas sobre Alana. As mãos ficam estáveis durante os gestos, sem alternar junto de cada pulso da voz. Apenas os pares de boca fechada/aberta se alternam. Mudanças de pose e de voz pertencem a cada trecho, sem depender da posição dele no roteiro.

## Som

Efeitos originais criados offline com **jsfxr**, o gerador de efeitos para jogos derivado de sfxr. Nenhum áudio de Undertale foi copiado.

Fonte e documentação consultadas em 02/10/2026: https://github.com/chr15m/jsfxr — licença Unlicense. Gerador: `scripts/create-postcredits-audio.mjs`; recebe o caminho de uma cópia local de `sfxr.js`, com `riffwave.js` ao lado. Os arquivos WAV resultantes são hospedados pelo site e não exigem jsfxr em tempo de execução. A semente de ruído é fixa.

- Vicente: pulso grave filtrado, 133 Hz, sílabas de 66 ms.
- Repórter: pulso mais alto, 219 Hz, sílabas de 60 ms.
- Queda: corpo grave, estalo e vibração da carcaça; contato aos 3,2 s.
- Ligamento: relé e estática curta, sem apito agudo sustentado.

As vozes respeitam pontuação e intervalos de silêncio. A fala ao mencionar Leroy e pedir desculpa fica mais baixa e grave; a negação recupera firmeza. Gestos e pausas não disparam voz. A mesma linha de tempo governa os quadros e os efeitos. O som só é liberado após um gesto aceito pelo navegador; há botão explícito, controle de volume e mute. Não existe narração por voz sintética do sistema.

## Comportamento

A sequência dura cerca de 2 minutos e 38 segundos, incluindo a queda e as pausas. Respostas longas são divididas em legendas de até 20 palavras. A queda começa quando a TV entra suficientemente na tela. Pausar, sair da região ou ocultar a aba suspende o relógio e interrompe os sons. Voltar não reinicia a queda. Rever reinicia; próxima fala avança e pausa, permitindo ler no próprio ritmo. Movimento reduzido e modo foco pulam a queda e evitam animação de boca. A entrevista integral está disponível em texto.

Validação: testes da linha de tempo, sincronização de boca/áudio, gestos com as mãos estáveis, escuta silenciosa do entrevistado, variação de voz, intervalos sem voz, retomada, avanço, sinal e margem dos WAVs, compilação e testes existentes do leitor. Publicação oficial pelo GitHub Pages.

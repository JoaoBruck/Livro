import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const outputDirectory = join(process.cwd(), "public", "documents");
mkdirSync(outputDirectory, { recursive: true });

const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

function text(value, x, y, options = {}) {
  const {
    size = 24,
    weight = 400,
    family = "DejaVu Sans",
    fill = "#252525",
    anchor = "start",
    opacity = 1,
    rotate = 0,
    spacing = 0,
  } = options;
  const transform = rotate ? ` transform="rotate(${rotate} ${x} ${y})"` : "";
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" opacity="${opacity}" letter-spacing="${spacing}"${transform}>${escapeXml(value)}</text>`;
}

function lines(values, x, y, options = {}) {
  const lineHeight = options.lineHeight ?? Math.round((options.size ?? 24) * 1.42);
  return values.map((value, index) => text(value, x, y + index * lineHeight, options)).join("");
}

function box(x, y, width, height, label, values, options = {}) {
  const stroke = options.stroke ?? "#2b2f30";
  const fill = options.fill ?? "rgba(255,255,255,.22)";
  const valueSize = options.valueSize ?? 25;
  return `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke}" stroke-opacity="${options.strokeOpacity ?? 0.42}" stroke-width="${options.strokeWidth ?? 2}"/>
    ${text(label.toUpperCase(), x + 17, y + 27, { size: 14, weight: 700, fill: options.labelFill ?? "#606565", spacing: 1.1 })}
    ${lines(values, x + 17, y + 64, { size: valueSize, weight: options.weight ?? 500, family: options.family, fill: options.valueFill, lineHeight: options.lineHeight ?? Math.round(valueSize * 1.35) })}
  `;
}

function svg(body, { width = 1400, height = 1980, label = "Documento" } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)}">
    <defs>
      <filter id="paperNoise"><feTurbulence baseFrequency=".018" numOctaves="3" seed="11" result="noise"/><feColorMatrix in="noise" type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .055"/></feComponentTransfer></filter>
      <filter id="rough"><feTurbulence baseFrequency=".012" numOctaves="2" seed="4" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4"/></filter>
      <linearGradient id="scan" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".06"/><stop offset=".14" stop-color="#fff" stop-opacity=".05"/><stop offset=".74" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".07"/></linearGradient>
    </defs>
    ${body}
    <rect width="${width}" height="${height}" filter="url(#paperNoise)" opacity=".65" pointer-events="none"/>
    <rect width="${width}" height="${height}" fill="url(#scan)" pointer-events="none"/>
  </svg>`;
}

function barcode(x, y, width, height, seed = 3) {
  let cursor = x;
  const bars = [];
  for (let index = 0; cursor < x + width; index += 1) {
    const barWidth = 2 + ((index * seed) % 5);
    const gap = 2 + ((index + seed) % 4);
    bars.push(`<rect x="${cursor}" y="${y}" width="${barWidth}" height="${height}"/>`);
    cursor += barWidth + gap;
  }
  return `<g fill="#242323">${bars.join("")}</g>`;
}

function copyEdges(base = "#e3e2de") {
  return `<rect width="1400" height="1980" fill="${base}"/><rect width="46" height="1980" fill="#171717" opacity=".17"/><rect x="1322" width="78" height="1980" fill="#171717" opacity=".055"/><path d="M70 40H1338V1932H70Z" fill="none" stroke="#121212" stroke-opacity=".14" stroke-width="2"/>`;
}

const documents = {
  "a01-back": svg(`
    <rect width="1600" height="1200" fill="#d4c2a4"/>
    <rect x="30" y="28" width="1540" height="1144" fill="none" stroke="#4a3829" stroke-opacity=".26" stroke-width="4"/>
    <path d="M0 170C420 118 720 216 1600 132" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="18"/>
    <g opacity=".065" transform="translate(1600 0) scale(-1 1)">${lines(["CASA-LAR DE CANDEIA", "FESTA DE AGOSTO"], 220, 260, { size: 54, weight: 700, fill: "#49392d", lineHeight: 84 })}</g>
    ${text("12/08", 804, 620, { size: 112, family: "Z003", fill: "#443b34", rotate: -3, anchor: "middle" })}
    <path d="M575 705c179 12 326-18 486 0" stroke="#574a3e" stroke-opacity=".2" stroke-width="5" fill="none"/>
    <circle cx="201" cy="925" r="24" fill="#3d3128" opacity=".08"/><circle cx="1390" cy="170" r="18" fill="#3d3128" opacity=".08"/>
  `, { width: 1600, height: 1200, label: "Verso da fotografia A-01 com 12/08 escrito à mão" }),

  "d01-front": svg(`
    <rect width="1400" height="1980" fill="#dfe9df"/>
    <rect x="0" y="0" width="92" height="1980" fill="#bed2c0" opacity=".72"/>
    <g fill="#718a77" opacity=".42">${Array.from({ length: 18 }, (_, index) => `<circle cx="46" cy="${90 + index * 105}" r="13"/>`).join("")}</g>
    <path d="M105 72H1310V1905H105Z" fill="none" stroke="#486453" stroke-opacity=".34" stroke-width="2"/>
    <rect x="105" y="72" width="1205" height="206" fill="#315447"/>
    <rect x="105" y="72" width="205" height="206" fill="#f3f0df" opacity=".92"/>
    ${text("RC", 208, 190, { size: 68, weight: 800, fill: "#315447", anchor: "middle" })}
    ${text("REDE DE CUIDADO DE CANDEIA", 352, 128, { size: 21, weight: 700, fill: "#f0f4ed", spacing: 2.1 })}
    ${text("TRANSPORTE ASSISTENCIAL", 352, 184, { size: 37, weight: 750, fill: "#ffffff" })}
    ${text("FORM. TA-04  |  2ª VIA DO BENEFICIÁRIO", 352, 232, { size: 17, family: "DejaVu Sans Mono", fill: "#cfddd2", spacing: 1 })}
    ${box(112, 316, 430, 118, "Protocolo", ["TA-17125-08"], { stroke: "#486453", valueSize: 30, family: "DejaVu Sans Mono" })}
    ${box(542, 316, 334, 118, "Emissão", ["14/08/2017"], { stroke: "#486453", valueSize: 29, family: "DejaVu Sans Mono" })}
    ${box(876, 316, 426, 118, "Solicitante", ["CASA-LAR DE CANDEIA"], { stroke: "#486453", valueSize: 24 })}
    ${box(112, 474, 760, 126, "Beneficiário", ["DERICK"], { stroke: "#486453", valueSize: 39, weight: 700 })}
    ${box(872, 474, 214, 126, "Idade", ["10 ANOS"], { stroke: "#486453", valueSize: 27 })}
    ${box(1086, 474, 216, 126, "Acomp.", ["SIM"], { stroke: "#486453", valueSize: 28 })}
    ${box(112, 672, 594, 150, "Procedimento", ["CONSULTA AMBULATORIAL", "15/08/2017  ·  08H30"], { stroke: "#486453", valueSize: 27, lineHeight: 38 })}
    ${box(706, 672, 596, 150, "Modalidade solicitada", ["VEÍCULO TERCEIRIZADO", "IDA E RETORNO"], { stroke: "#486453", valueSize: 27, lineHeight: 38 })}
    ${box(112, 944, 1190, 254, "Justificativa excepcional", ["VEÍCULO INSTITUCIONAL INDISPONÍVEL DESDE 12/08.", "AVARIA DECORRENTE DE COLISÃO. SUBSTITUIÇÃO NECESSÁRIA", "PARA NÃO INTERROMPER O ATENDIMENTO PROGRAMADO."], { stroke: "#486453", valueSize: 26, lineHeight: 45, fill: "rgba(255,255,255,.31)" })}
    <path d="M141 1094H1225" stroke="#6e7e70" stroke-opacity=".35" stroke-width="2"/>
    ${box(112, 1260, 826, 154, "Pagamento", ["PATROCINADOR CADASTRADO", "RECIBO + COMPROVANTE ANEXOS"], { stroke: "#486453", valueSize: 25, lineHeight: 38 })}
    ${box(938, 1260, 364, 154, "Parecer", ["DEFERIDO"], { stroke: "#486453", valueSize: 34, weight: 700 })}
    <g transform="rotate(-7 1082 1410)" filter="url(#rough)" opacity=".72"><rect x="930" y="1352" width="304" height="116" fill="none" stroke="#7a3d3a" stroke-width="6"/>${lines(["AUTORIZADO", "14 AGO 2017"], 1082, 1396, { size: 24, weight: 700, fill: "#7a3d3a", anchor: "middle", lineHeight: 32 })}</g>
    <path d="M923 1595c74-35 125 42 206-17 78-56 125 31 167-7" stroke="#343d38" stroke-width="3" fill="none" opacity=".55"/>
    ${text("relac. ocorrência?", 965, 1650, { size: 33, family: "Z003", fill: "#35453d", opacity: .18, rotate: -2 })}
    ${text("OT-0812-44", 1096, 1710, { size: 49, family: "Z003", fill: "#35453d", opacity: .075, rotate: -2, anchor: "middle" })}
    <path d="M938 1656c94 20 211-23 323 11M942 1684c113-18 203 29 315-4M952 1714c88 16 196-18 300 2" fill="none" stroke="#dfe9df" stroke-width="24" opacity=".86"/>
    <path d="M958 1668c77 9 182-12 276 5M982 1719c59-7 147 8 232-3" fill="none" stroke="#78877b" stroke-width="5" opacity=".13"/>
    <path d="M112 1841H1302" stroke="#486453" stroke-opacity=".4" stroke-width="2"/>
    ${text("ARQUIVO DE TRANSIÇÃO  ·  TA-17125-08", 115, 1882, { size: 16, family: "DejaVu Sans Mono", fill: "#496153", spacing: 1 })}
    ${text("2ª VIA", 1298, 1882, { size: 17, family: "DejaVu Sans Mono", fill: "#496153", anchor: "end" })}
    <path d="M711 0V1980" stroke="#fff" stroke-opacity=".18" stroke-width="8"/><path d="M706 0V1980" stroke="#31473b" stroke-opacity=".06" stroke-width="2"/>
  `, { label: "Segunda via carbonada D-01 de transporte assistencial" }),

  "d01-back": svg(`
    <rect width="1400" height="1980" fill="#dce6dc"/>
    <rect width="92" height="1980" fill="#bcd0be" opacity=".7"/>
    <g fill="#718a77" opacity=".36">${Array.from({ length: 18 }, (_, index) => `<circle cx="46" cy="${90 + index * 105}" r="13"/>`).join("")}</g>
    <g opacity=".08" transform="translate(1400 0) scale(-1 1)">${lines(["DERICK", "VEÍCULO TERCEIRIZADO", "AVARIA DECORRENTE DE COLISÃO"], 240, 520, { size: 35, family: "DejaVu Sans Mono", fill: "#294638", lineHeight: 250 })}</g>
    ${text("44", 330, 1715, { size: 46, family: "Z003", fill: "#34483d", opacity: .18, rotate: 2 })}
    ${text("2180", 630, 1702, { size: 46, family: "Z003", fill: "#34483d", opacity: .16, rotate: -1 })}
    ${text("TO", 1000, 1722, { size: 46, family: "Z003", fill: "#34483d", opacity: .19, rotate: 3 })}
    <path d="M250 1745c92-22 173 26 262-4M572 1740c128 17 218-26 319-1M940 1750c83-25 163 12 246-9" fill="none" stroke="#53675b" stroke-width="4" opacity=".11"/>
    <path d="M708 0V1980" stroke="#fff" stroke-opacity=".16" stroke-width="8"/><path d="M703 0V1980" stroke="#31473b" stroke-opacity=".055" stroke-width="2"/>
    ${text("VERSO DA SEGUNDA VIA · MARCAS DE CARBONO", 700, 1890, { size: 17, family: "DejaVu Sans Mono", fill: "#4c6254", anchor: "middle", spacing: 1.4 })}
  `, { label: "Verso carbonado do documento D-01" }),

  "t01-front": svg(`
    ${copyEdges("#dededb")}
    <rect x="86" y="74" width="1240" height="210" fill="#242526"/>
    ${text("UNIDADE RODOVIÁRIA REGIONAL", 118, 126, { size: 19, weight: 700, fill: "#efefea", spacing: 2.5 })}
    ${text("ESPELHO DE OCORRÊNCIA", 118, 190, { size: 42, weight: 800, fill: "#ffffff" })}
    ${text("CONSULTA DE ARQUIVO · NÃO SUBSTITUI O ORIGINAL", 118, 240, { size: 16, family: "DejaVu Sans Mono", fill: "#bfc0bb", spacing: 1.1 })}
    ${text("T-01", 1262, 198, { size: 39, weight: 800, fill: "#fff", anchor: "end" })}
    ${box(112, 334, 406, 116, "Ocorrência", ["OT-0812-44"], { fill: "#ecece8", valueSize: 32, family: "DejaVu Sans Mono", weight: 700 })}
    ${box(518, 334, 300, 116, "Data", ["12/08/2017"], { fill: "#ecece8", valueSize: 28, family: "DejaVu Sans Mono" })}
    ${box(818, 334, 484, 116, "Trecho", ["ROTA 9 · KM 41"], { fill: "#ecece8", valueSize: 29 })}
    ${box(112, 526, 338, 118, "Primeiro acionamento", ["18H29"], { fill: "#ecece8", valueSize: 36, family: "DejaVu Sans Mono" })}
    ${box(450, 526, 338, 118, "Equipe no local", ["19H08"], { fill: "#ecece8", valueSize: 36, family: "DejaVu Sans Mono" })}
    ${box(788, 526, 514, 118, "Natureza", ["COLISÃO LATERAL"], { fill: "#ecece8", valueSize: 29 })}
    ${box(112, 694, 738, 164, "Veículo 01", ["VAN · CASA-LAR DE CANDEIA", "CONDUTOR: VICENTE BRAGA"], { fill: "#e8e8e4", valueSize: 26, lineHeight: 40 })}
    ${box(850, 694, 452, 164, "Ocupação informada", ["01"], { fill: "#e8e8e4", valueSize: 48, weight: 800 })}
    ${box(112, 944, 1190, 152, "Veículo 02", ["NÃO LOCALIZADO · EVASÃO ANTERIOR À CHEGADA DA EQUIPE"], { fill: "#e8e8e4", valueSize: 25 })}
    ${box(112, 1128, 1190, 158, "Origem da informação de ocupação", ["DECLARAÇÃO DO RESPONSÁVEL PRESENTE: M. GOUVEIA", "DADO TRANSCRITO NO LOCAL"], { fill: "#e8e8e4", valueSize: 25, lineHeight: 39 })}
    ${box(112, 1326, 1190, 222, "Complemento operacional", ["CONTINUAÇÃO NO VERSO · CAMPO NÃO CONSOLIDADO NESTA FACE", "ACESSO À CABINE: VER NOTA DO ATENDIMENTO INICIAL"], { fill: "#e8e8e4", valueSize: 25, lineHeight: 48 })}
    ${text("CONDUTOR LOCALIZADO FORA DA VAN · REMOVIDO PELA EQUIPE MÉDICA", 118, 1641, { size: 21, family: "DejaVu Sans Mono", fill: "#343434" })}
    <g transform="rotate(-4 1065 1705)" opacity=".48"><rect x="895" y="1650" width="340" height="112" fill="none" stroke="#242424" stroke-width="6"/>${lines(["ENCAMINHADO", "UNIDADE LOCAL"], 1065, 1693, { size: 24, weight: 700, anchor: "middle", lineHeight: 32 })}</g>
    ${text("OPERADOR ██████  ·  CONSULTA 21/03/2025", 116, 1882, { size: 16, family: "DejaVu Sans Mono", fill: "#404040", spacing: .7 })}
    <g opacity=".08" fill="#000">${Array.from({ length: 32 }, (_, index) => `<rect x="50" y="${120 + index * 57}" width="${1180 - (index % 5) * 80}" height="2"/>`).join("")}</g>
  `, { label: "Fotocópia T-01 do espelho da ocorrência rodoviária" }),

  "t01-back": svg(`
    ${copyEdges("#dededb")}
    <g opacity=".075" transform="translate(1400 0) scale(-1 1)">${lines(["OT-0812-44", "OCUPAÇÃO INFORMADA: 01", "M. GOUVEIA"], 210, 430, { size: 38, family: "DejaVu Sans Mono", fill: "#222", lineHeight: 330 })}</g>
    ${box(150, 470, 1100, 360, "Complemento do atendimento inicial", ["CABINE NÃO CONFERIDA.", "LADO DIREITO CONTRA A PROTEÇÃO DA VIA.", "ACESSO ADIADO ATÉ REMOÇÃO E LIBERAÇÃO TÉCNICA."], { fill: "#e8e8e4", valueSize: 30, lineHeight: 58, family: "DejaVu Sans Mono" })}
    ${text("SEM CONSTATAÇÃO VISUAL DE OCUPAÇÃO", 700, 940, { size: 26, weight: 800, family: "DejaVu Sans Mono", fill: "#333", anchor: "middle", spacing: 1.1 })}
    <g transform="rotate(5 690 1350)" opacity=".14"><rect x="445" y="1270" width="490" height="150" fill="none" stroke="#222" stroke-width="9"/>${text("UNIDADE LOCAL", 690, 1365, { size: 44, weight: 800, anchor: "middle" })}</g>
    ${text("VERSO · COMPLEMENTO OPERACIONAL", 700, 1885, { size: 17, family: "DejaVu Sans Mono", fill: "#555", anchor: "middle", spacing: 1.5 })}
  `, { label: "Verso da fotocópia T-01" }),

  "t02-front": svg(`
    <rect width="1400" height="1980" fill="#edf2f2"/>
    <g stroke="#5f8390" stroke-opacity=".09" stroke-width="1">${Array.from({ length: 50 }, (_, index) => `<path d="M0 ${index * 40}H1400"/>`).join("")}${Array.from({ length: 36 }, (_, index) => `<path d="M${index * 40} 0V1980"/>`).join("")}</g>
    <rect x="72" y="70" width="1256" height="190" fill="#143945"/>
    <path d="M102 100h118v118H102zM132 130h58v58h-58z" fill="none" stroke="#9bc1c9" stroke-width="7"/>
    ${text("NÚCLEO DE PERÍCIA VEICULAR", 258, 122, { size: 18, weight: 700, fill: "#bcd4d9", spacing: 2.2 })}
    ${text("SISTEMA DE RETENÇÃO", 258, 181, { size: 39, weight: 800, fill: "#fff" })}
    ${text("FOLHA TÉCNICA T-02 · OT-0812-44", 258, 224, { size: 17, family: "DejaVu Sans Mono", fill: "#a8c4ca", spacing: 1 })}
    ${box(112, 326, 510, 112, "Inspeção", ["13/08/2017 · 09H40"], { stroke: "#315c69", fill: "#f7faf9", valueSize: 28, family: "DejaVu Sans Mono" })}
    ${box(622, 326, 680, 112, "Veículo", ["VAN · CASA-LAR DE CANDEIA"], { stroke: "#315c69", fill: "#f7faf9", valueSize: 27 })}
    <g transform="translate(150 500)" stroke="#224c59" fill="#f6f9f8" stroke-width="5">
      <rect x="0" y="0" width="530" height="550" rx="78"/>
      <path d="M265 0V550" stroke-dasharray="13 11" opacity=".34"/>
      <rect x="62" y="68" width="174" height="166" rx="24"/><rect x="296" y="68" width="174" height="166" rx="24"/>
      <rect x="62" y="314" width="174" height="166" rx="24"/><rect x="296" y="314" width="174" height="166" rx="24"/>
      <path d="M320 96l126 109M446 96L320 205" stroke="#aa483f" stroke-width="11"/>
      <circle cx="383" cy="150" r="79" stroke="#aa483f" stroke-width="5"/>
      ${text("R2", 383, 160, { size: 42, weight: 800, fill: "#aa483f", anchor: "middle" })}
      ${text("FRENTE DO VEÍCULO", 265, 42, { size: 17, weight: 700, fill: "#224c59", anchor: "middle", spacing: 1.3 })}
    </g>
    ${box(744, 478, 558, 120, "Ponto R2 · grade", ["QUADRANTE F/D", "REF.: SENTIDO DE MARCHA"], { stroke: "#315c69", fill: "#f7faf9", valueSize: 25, lineHeight: 35, weight: 700 })}
    ${box(744, 650, 558, 120, "Pretensionador", ["ACIONADO"], { stroke: "#315c69", fill: "#f7faf9", valueSize: 33, weight: 700 })}
    ${box(744, 832, 558, 166, "Faixa", ["DEFORMAÇÃO LONGITUDINAL", "MARCAS COMPATÍVEIS COM CARGA"], { stroke: "#315c69", fill: "#f7faf9", valueSize: 24, lineHeight: 39 })}
    ${box(744, 1046, 558, 144, "Microvestígios", ["T-19 · ALOJAMENTO", "INFERIOR DO FECHO"], { stroke: "#315c69", fill: "#f7faf9", valueSize: 25, lineHeight: 38 })}
    ${box(112, 1294, 1190, 252, "Ressalva técnica", ["O ACIONAMENTO ISOLADO PODE DECORRER DA CONFIGURAÇÃO DO SISTEMA,", "DE OBJETO AFIVELADO OU DE DANO ANTERIOR. POSIÇÃO, FAIXA E", "MICROVESTÍGIOS DEVEM SER INTERPRETADOS EM CONJUNTO."], { stroke: "#315c69", fill: "#e1ecec", valueSize: 24, lineHeight: 43 })}
    <path d="M114 1703H1302" stroke="#315c69" stroke-opacity=".55" stroke-width="2"/>
    ${text("RESPONSÁVEL TÉCNICO", 115, 1688, { size: 14, weight: 700, fill: "#4e6c73", spacing: 1 })}
    <path d="M160 1780c95-66 158 44 245-28 71-58 136 32 202-10" fill="none" stroke="#253f46" stroke-width="4" opacity=".62"/>
    ${text("ESCALA 1:20 · MATRÍCULA PARCIALMENTE ILEGÍVEL", 1300, 1882, { size: 16, family: "DejaVu Sans Mono", fill: "#3f626b", anchor: "end" })}
  `, { label: "Folha técnica T-02 da inspeção do sistema de retenção" }),

  "t02-back": svg(`
    <rect width="1400" height="1980" fill="#edf2f2"/>
    <g stroke="#5f8390" stroke-opacity=".08" stroke-width="1">${Array.from({ length: 50 }, (_, index) => `<path d="M0 ${index * 40}H1400"/>`).join("")}${Array.from({ length: 36 }, (_, index) => `<path d="M${index * 40} 0V1980"/>`).join("")}</g>
    <rect x="105" y="110" width="1190" height="92" fill="#193f4a"/>
    ${text("CONTROLE DE EQUIPAMENTO · ANEXO OPERACIONAL", 700, 168, { size: 24, weight: 700, fill: "#eef7f7", anchor: "middle", spacing: 1.4 })}
    ${box(120, 300, 1160, 170, "Escala métrica", ["CONFERIDA · LOTE 771-A", "SEM DIVERGÊNCIA REGISTRADA"], { stroke: "#315c69", fill: "#f7faf9", valueSize: 27, lineHeight: 42 })}
    ${box(120, 510, 1160, 170, "Equipamento fotográfico", ["NPV-CAM-04 · CALIBRAÇÃO VÁLIDA", "TESTE DE DATA/HORA: CONFORME"], { stroke: "#315c69", fill: "#f7faf9", valueSize: 27, lineHeight: 42 })}
    ${box(120, 720, 1160, 170, "Observação", ["ESTA FACE NÃO CONTÉM RESULTADO DE OCUPAÇÃO."], { stroke: "#315c69", fill: "#e1ecec", valueSize: 25 })}
    ${text("T-02 · VERSO", 1280, 1882, { size: 17, family: "DejaVu Sans Mono", fill: "#46656d", anchor: "end" })}
  `, { label: "Verso técnico de calibração T-02" }),

  "t03-front": svg(`
    <rect width="1400" height="1980" fill="#f0eadf"/>
    <rect x="68" y="64" width="1264" height="1850" fill="#f8f4ea" stroke="#563f3c" stroke-opacity=".28" stroke-width="2"/>
    <rect x="68" y="64" width="1264" height="216" fill="#663c3d"/>
    ${text("LABORATÓRIO REGIONAL DE MATERIAIS", 108, 120, { size: 19, weight: 700, fill: "#e9d9d5", spacing: 2.2 })}
    ${text("TRIAGEM E CONTROLE DE ANEXOS", 108, 178, { size: 38, weight: 800, fill: "#fff" })}
    ${text("CADEIA LR-17-0813-611", 108, 230, { size: 17, family: "DejaVu Sans Mono", fill: "#d8c1bc", spacing: 1.2 })}
    ${barcode(1012, 112, 266, 74, 5)}
    ${text("T-19", 1145, 230, { size: 29, family: "DejaVu Sans Mono", weight: 800, fill: "#fff", anchor: "middle" })}
    ${box(112, 334, 300, 120, "Amostra", ["T-19"], { stroke: "#663c3d", fill: "#fffdf6", valueSize: 36, family: "DejaVu Sans Mono", weight: 800 })}
    ${box(412, 334, 590, 120, "Origem declarada", ["ALOJAMENTO INFERIOR DO FECHO", "DIANTEIRO DIREITO"], { stroke: "#663c3d", fill: "#fffdf6", valueSize: 23, lineHeight: 34 })}
    ${box(1002, 334, 300, 120, "Triagem", ["MICROFIBRAS", "AMARELAS"], { stroke: "#663c3d", fill: "#fffdf6", valueSize: 23, lineHeight: 34 })}
    <g transform="translate(112 602)" font-family="DejaVu Sans" fill="#2c2927">
      <rect width="1190" height="570" fill="#fffdf7" stroke="#4a3d3a" stroke-opacity=".48" stroke-width="2"/>
      <rect width="1190" height="76" fill="#ded1c5"/>
      <path d="M0 76H1190M0 198H1190M0 320H1190M0 442H1190M132 0V570M780 0V570M918 0V570M1050 0V570" stroke="#4a3d3a" stroke-opacity=".42" stroke-width="2"/>
      ${text("ITEM", 66, 48, { size: 16, weight: 700, anchor: "middle" })}${text("CONTEÚDO", 158, 48, { size: 16, weight: 700 })}${text("FOLHA", 849, 48, { size: 16, weight: 700, anchor: "middle" })}${text("MOV.", 984, 48, { size: 16, weight: 700, anchor: "middle" })}${text("CÓPIA", 1120, 48, { size: 16, weight: 700, anchor: "middle" })}
      ${text("4-D", 66, 151, { size: 25, weight: 700, anchor: "middle" })}${text("TERMO DE LIBERAÇÃO DO VEÍCULO", 158, 151, { size: 22 })}${text("22", 849, 151, { size: 24, anchor: "middle" })}${text("INC.", 984, 151, { size: 18, anchor: "middle" })}${text("SIM", 1120, 151, { size: 18, anchor: "middle" })}
      ${text("4-A", 66, 273, { size: 25, weight: 700, anchor: "middle" })}${text("TERMO DE COLETA · T-19", 158, 273, { size: 23 })}${text("17", 849, 273, { size: 24, anchor: "middle" })}${text("INC.", 984, 273, { size: 18, anchor: "middle" })}${text("SIM", 1120, 273, { size: 18, anchor: "middle" })}
      ${text("4-C", 66, 395, { size: 25, weight: 700, anchor: "middle" })}${text("REGISTRO FOTOGRÁFICO · LADO DIR.", 158, 395, { size: 22 })}${text("19–21", 849, 395, { size: 24, anchor: "middle" })}${text("INC.", 984, 395, { size: 18, anchor: "middle" })}${text("SIM", 1120, 395, { size: 18, anchor: "middle" })}
      ${text("4-B", 66, 517, { size: 25, weight: 700, anchor: "middle" })}${text("COMPARAÇÃO FÍSICO-QUÍMICA · T-19", 158, 517, { size: 22 })}${text("··", 849, 517, { size: 24, anchor: "middle" })}${text("REM.", 984, 517, { size: 18, anchor: "middle" })}${text("—", 1120, 517, { size: 18, anchor: "middle" })}
      <path d="M130 468C362 442 612 505 928 463V558C610 590 345 531 130 566Z" fill="#292827" opacity=".73"/>
      <path d="M164 486C402 461 649 522 889 482" fill="none" stroke="#f3f0e9" stroke-opacity=".12" stroke-width="18"/>
    </g>
    ${box(112, 1250, 1190, 180, "Inventário da cópia local", ["FOLHAS: 17 · 19 · 20 · 21 · 22", "TOTAL FÍSICO CONFERIDO: 05"], { stroke: "#663c3d", fill: "#fffdf7", valueSize: 29, lineHeight: 45, family: "DejaVu Sans Mono" })}
    ${box(112, 1488, 1190, 188, "Movimentação abreviada", ["ITEM COM MARCA REM. · DETALHE NO VERSO", "INVENTÁRIO LOCAL ENCERRADO SEM A FOLHA INTERMEDIÁRIA"], { stroke: "#663c3d", fill: "#fffdf7", valueSize: 24, lineHeight: 41, family: "DejaVu Sans Mono" })}
    <g transform="rotate(-2 1040 1695)" opacity=".38"><rect x="835" y="1635" width="410" height="114" fill="none" stroke="#6d3b3b" stroke-width="7"/>${text("REMETIDO · 15 AGO", 1040, 1704, { size: 27, weight: 800, fill: "#6d3b3b", anchor: "middle" })}</g>
    ${text("CÓPIA LOCAL · VOLUME 4 · INVENTÁRIO MANUAL", 112, 1878, { size: 16, family: "DejaVu Sans Mono", fill: "#5e4b46", spacing: .9 })}
  `, { label: "Controle laboratorial T-03 dos anexos da amostra T-19" }),

  "t03-back": svg(`
    <rect width="1400" height="1980" fill="#f0eadf"/>
    <rect x="68" y="64" width="1264" height="1850" fill="#f7f2e8" stroke="#563f3c" stroke-opacity=".24" stroke-width="2"/>
    <g opacity=".052" transform="translate(1400 0) scale(-1 1)">${lines(["T-19", "VOLUME 4", "LR-17-0813-611"], 220, 390, { size: 45, family: "DejaVu Sans Mono", fill: "#5e3738", lineHeight: 410 })}</g>
    <rect x="140" y="260" width="1120" height="760" fill="#fffdf7" stroke="#563f3c" stroke-opacity=".38" stroke-width="2"/>
    ${text("CONTROLE DE SAÍDA · COMPLEMENTO", 190, 330, { size: 25, weight: 800, family: "DejaVu Sans Mono", fill: "#563f3c", spacing: 1.1 })}
    ${box(190, 390, 470, 140, "Item", ["4-B · 01 FOLHA"], { stroke: "#663c3d", fill: "#fffdf7", valueSize: 28, family: "DejaVu Sans Mono" })}
    ${box(660, 390, 550, 140, "Saída", ["15/08/2017 · 08H16"], { stroke: "#663c3d", fill: "#fffdf7", valueSize: 28, family: "DejaVu Sans Mono" })}
    ${box(190, 570, 1020, 140, "Destino", ["UNIDADE LOCAL DE CANDEIA"], { stroke: "#663c3d", fill: "#fffdf7", valueSize: 29, family: "DejaVu Sans Mono" })}
    ${text("RECEBIMENTO / CONFERÊNCIA", 190, 790, { size: 18, weight: 700, family: "DejaVu Sans Mono", fill: "#68534c", spacing: 1.1 })}
    <path d="M190 900H1210" stroke="#563f3c" stroke-opacity=".52" stroke-width="2"/>
    ${text("ASSINATURA AUSENTE", 700, 950, { size: 20, weight: 700, family: "DejaVu Sans Mono", fill: "#775e55", opacity: .55, anchor: "middle", spacing: 1.4 })}
    ${text("VERSO · CONTROLE PARCIAL DE SAÍDA", 700, 1878, { size: 17, family: "DejaVu Sans Mono", fill: "#67524b", anchor: "middle", spacing: 1.4 })}
  `, { label: "Verso do controle laboratorial T-03" }),

  "b12-front": svg(`
    <rect width="1400" height="1980" fill="#e8dec2"/>
    <path d="M0 0H122V1980H0Z" fill="#d7c8a8"/>
    <g fill="#5e5545" opacity=".48">${Array.from({ length: 19 }, (_, index) => `<circle cx="63" cy="${72 + index * 102}" r="22"/><circle cx="63" cy="${72 + index * 102}" r="12" fill="#b9ad92"/>`).join("")}</g>
    <path d="M174 0V1980" stroke="#a85252" stroke-opacity=".48" stroke-width="4"/>
    <g stroke="#5b7590" stroke-opacity=".34" stroke-width="2">${Array.from({ length: 27 }, (_, index) => `<path d="M122 ${118 + index * 68}H1400"/>`).join("")}</g>
    ${text("12 de agosto — busca", 226, 188, { size: 63, family: "Z003", fill: "#2c2a26", rotate: -1.2 })}
    ${text("17h22  Alana não localizada", 225, 322, { size: 48, family: "Z003", rotate: -.7 })}
    ${text("17h27  dormitórios / banheiros", 224, 456, { size: 46, family: "Z003", rotate: .4 })}
    ${text("voltar no quarto de cima", 520, 524, { size: 38, family: "Z003", fill: "#474139", rotate: 1.1 })}
    ${text("17h34  pátio + ruas próximas", 226, 590, { size: 46, family: "Z003", rotate: -.2 })}
    ${text("17h41  fundos. portão encostado", 226, 716, { size: 47, family: "Z003", rotate: .2 })}
    ${text("papel dobrado no trinco", 355, 782, { size: 44, family: "Z003", rotate: -.4 })}
    <path d="M340 800c270 24 510 7 735 14" fill="none" stroke="#3c3933" stroke-width="3" opacity=".45"/>
    ${text("17h46  Vicente sai com a van", 226, 910, { size: 52, family: "Z003", weight: 700, rotate: -.5 })}
    <path d="M205 955c358 15 692-22 1020 0" fill="none" stroke="#3b3731" stroke-width="4" opacity=".28"/>
    ${text("escola", 244, 1090, { size: 43, family: "Z003", rotate: -2 })}
    ${text("terminal", 528, 1162, { size: 45, family: "Z003", rotate: 1.4 })}
    ${text("praça", 890, 1080, { size: 43, family: "Z003", rotate: -1 })}
    ${text("canal", 1082, 1220, { size: 45, family: "Z003", rotate: 2.1 })}
    ${text("Sônia / Augusto", 286, 1305, { size: 45, family: "Z003", rotate: -.9 })}
    ${text("rua da escola — repetir", 690, 1424, { size: 43, family: "Z003", rotate: 1.2 })}
    <path d="M500 1130l210 78M706 1198l-180 72M1020 1130l-212 118" fill="none" stroke="#34312d" stroke-width="3" opacity=".35"/>
    <path d="M250 1515c176-68 360 83 553-10 150-72 282 53 423-8" fill="none" stroke="#34312d" stroke-width="4" opacity=".28"/>
    <circle cx="1110" cy="340" r="83" fill="none" stroke="#7e4b31" stroke-opacity=".13" stroke-width="14"/><circle cx="1110" cy="340" r="62" fill="none" stroke="#7e4b31" stroke-opacity=".09" stroke-width="7"/>
    <path d="M735 0V1980" stroke="#fff" stroke-opacity=".17" stroke-width="8"/><path d="M731 0V1980" stroke="#4f4639" stroke-opacity=".07" stroke-width="2"/>
    ${text("B-12 · PÁGINA 1", 1285, 1900, { size: 20, family: "DejaVu Sans Mono", fill: "#514b41", anchor: "end" })}
  `, { label: "Página manuscrita B-12 do caderno de busca" }),

  "b12-back": svg(`
    <rect width="1400" height="1980" fill="#e8dec2"/>
    <path d="M0 0H122V1980H0Z" fill="#d7c8a8"/>
    <g fill="#5e5545" opacity=".44">${Array.from({ length: 19 }, (_, index) => `<circle cx="63" cy="${72 + index * 102}" r="22"/><circle cx="63" cy="${72 + index * 102}" r="12" fill="#b9ad92"/>`).join("")}</g>
    <path d="M174 0V1980" stroke="#a85252" stroke-opacity=".42" stroke-width="4"/>
    <g stroke="#5b7590" stroke-opacity=".29" stroke-width="2">${Array.from({ length: 27 }, (_, index) => `<path d="M122 ${118 + index * 68}H1400"/>`).join("")}</g>
    <g opacity=".08" transform="translate(1400 0) scale(-1 1)">${lines(["terminal", "ligar outra vez", "ponte"], 310, 450, { size: 48, family: "Z003", fill: "#39352f", lineHeight: 330 })}</g>
    <path d="M735 0V1980" stroke="#fff" stroke-opacity=".15" stroke-width="8"/><path d="M731 0V1980" stroke="#4f4639" stroke-opacity=".06" stroke-width="2"/>
    ${text("B-12 · VERSO · SEM NOVO HORÁRIO", 1285, 1900, { size: 19, family: "DejaVu Sans Mono", fill: "#514b41", anchor: "end" })}
  `, { label: "Verso da página B-12 com marcas de pressão" }),

  "blank-back": svg(`${copyEdges("#e2dfd7")}${text("VERSO · SEM REGISTRO DIRETO", 700, 1878, { size: 17, family: "DejaVu Sans Mono", fill: "#5c5851", anchor: "middle", spacing: 1.4 })}`, { label: "Verso sem registro direto" }),
};

for (const [name, contents] of Object.entries(documents)) {
  const normalized = contents.replace(/[ \t]+$/gm, "");
  writeFileSync(join(outputDirectory, `${name}.svg`), normalized);
  await sharp(Buffer.from(normalized)).png({ compressionLevel: 9 }).toFile(join(outputDirectory, `${name}.png`));
}

console.log(`Generated ${Object.keys(documents).length} document assets in ${outputDirectory}`);

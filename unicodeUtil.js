let unicodeInformation;
let unicodeBlocks;
let htmlEntityData;
let unicodeDataReady = false;
let readyFunctions = [];

async function getUnicodeInformation() {
  // get unicode information
  const textDataResponse = await fetch("UnicodeData.txt");
  const textData = await textDataResponse.text();
  const lines = textData.split("\n");
  
  unicodeInformation = {};
  
  for (const line of lines) {
    const data = line.split("#")[0].split(";");
    const key = parseInt(data[0].trim(), 16); // Convert hex to number
    if (data.length === 1) continue;
    let decomposition = data[5].trim();
    if (decomposition === "") {
      decomposition = {
        type: null,
        char: null
      }
    } else {
      decomposition = decomposition.split(" ");
      // console.log(line, decomposition);
      const first = decomposition[0].trim();
      if (first[0] === "<") {
        decomposition = {
          type: first,
          char: decomposition.slice(1)
        };
      } else {
        decomposition = {
          type: "",
          char: decomposition
        } 
      }
    }
    unicodeInformation[key] = {
      name: data[1].trim(),
      category: data[2].trim(),
      combiningClass: data[3].trim(),
      bidiClass: data[4].trim(),
      decomposition: decomposition,
      decimalDigitValue: data[6].trim(),
      digitValue: data[7].trim(),
      numericValue: data[8].trim(),
      mirrored: data[9].trim(),
      unicode1Name: data[10].trim(),
      isoComment: data[11].trim(),
      uppercaseMapping: data[12].trim(),
      lowercaseMapping: data[13].trim(),
      titlecaseMapping: data[14].trim(),
    };
  }
  
  // get unicode blocks
  const blocksResponse = await fetch("Blocks.txt");
  const blocksData = (await blocksResponse.text()).split("\n");
  unicodeBlocks = [];
  for (const line of blocksData) {
    const data = line.split("#")[0].trim();
    if (data === "") continue;
    const parts = data.split(";");
    const range = parts[0]
      .trim()
      .split("..")
      .map(
        (x) => parseInt(x.trim(), 16)
      );
    const name = parts[1] ? parts[1].trim() : "";
    unicodeBlocks.push({
      start: range[0],
      end: range[1] || range[0],
      name: name,
    });
  }
  
  // get html entity data
  const htmlEntityResponse = await fetch("htmlEntities.json");
  htmlEntityData = await htmlEntityResponse.json();
  
  unicodeDataReady = true;
  readyFunctions.forEach((func) => func());
}

function getCharacterData(char, extraData) {
  extraData ??= {
    getCodePoints: true,
    getBlock: true,
    gethtmlEntity: true,
  }
  
  if (!unicodeDataReady) {
    return null;
  }
  
  const codePoint = char.codePointAt(0);
  let info = unicodeInformation[codePoint];
  if (!info) {
    info = {
      name: null,
      category: null,
      combiningClass: null,
      bidiClass: null,
      decomposition: {
        type: null,
        char: null
      },
      decimalDigitValue: null,
      digitValue: null,
      numericValue: null,
      mirrored: null,
      unicode1Name: null,
      isoComment: null,
      uppercaseMapping: null,
      lowercaseMapping: null,
      titlecaseMapping: null,
    };
  }
  
  // get code points
  if (extraData.getCodePoints) {
    info.codePoint = codePoint;
    info.hexCodePoint = codePoint.toString(16).toUpperCase().padStart(4, '0');
  }
  
  // get code block
  if (extraData.getBlock) {
    info.block = unicodeBlocks.find((block) => {
      return codePoint >= block.start && codePoint <= block.end;
    });
    if (info.block) {
      info.blockName = info.block.name;
    } else {
      info.blockName = null;
    }
  }
  
  // get HTML escape character
  if (extraData.gethtmlEntity) {
    info.htmlEntity = getHtmlEntity(codePoint);
  }
  
  return info;
}

function getHtmlEntity(codePoint) {
  const htmlEntity = htmlEntityData[codePoint];
  if (!htmlEntity) {
    return `&#${codePoint};`;
  } else {
    return `${htmlEntity} (&#${codePoint};)`;
  }
}

const unicodeAttributes = [
  "name",
  "category",
  "combiningClass",
  "bidiClass",
  "decomposition",
  "decimalDigitValue",
  "digitValue",
  "numericValue",
  "mirrored",
  "unicode1Name",
  "isoComment",
  "uppercaseMapping",
  "lowercaseMapping",
  "titlecaseMapping",
];

const otherAttributes = [
  "codePoint",
  "hexCodePoint",
  "blockName",
  "htmlEntity",
];

const unicodeCharacterCategories = {
  Cc: "Control",
  Cf: "Format",
  Co: "Private Use",
  Cs: "Surrogate",
  Ll: "Lowercase Letter",
  Lm: "Modifier Letter",
  Lo: "Other Letter",
  Lt: "Titlecase Letter",
  Lu: "Uppercase Letter",
  Mc: "Spacing Mark",
  Me: "Enclosing Mark",
  Mn: "Nonspacing Mark",
  Nd: "Decimal Number",
  Nl: "Letter Number",
  No: "Other Number",
  Pc: "Connector Punctuation",
  Pd: "Dash Punctuation",
  Pe: "Close Punctuation",
  Pf: "Final Punctuation",
  Pi: "Initial Punctuation",
  Po: "Other Punctuation",
  Ps: "Open Punctuation",
  Sc: "Currency Symbol",
  Sk: "Modifier Symbol",
  Sm: "Math Symbol",
  So: "Other Symbol",
  Zl: "Line Separator",
  Zp: "Paragraph Separator",
  Zs: "Space Separator"
};

const unicodeCombiningClasses = {
  0: "Not Reordered",
  1: "Overlay",
  6: "Han Reading",
  7: "Nukta",
  8: "Kana Voicing",
  9: "Virama",
  10: "CCC10",
  11: "CCC11",
  12: "CCC12",
  13: "CCC13",
  14: "CCC14",
  15: "CCC15",
  16: "CCC16",
  17: "CCC17",
  18: "CCC18",
  19: "CCC19",
  20: "CCC20",
  21: "CCC21",
  22: "CCC22",
  23: "CCC23",
  24: "CCC24",
  25: "CCC25",
  26: "CCC26",
  27: "CCC27",
  28: "CCC28",
  29: "CCC29",
  30: "CCC30",
  31: "CCC31",
  32: "CCC32",
  33: "CCC33",
  34: "CCC34",
  35: "CCC35",
  36: "CCC36",
  84: "CCC84",
  91: "CCC91",
  103: "CCC103",
  107: "CCC107",
  118: "CCC118",
  122: "CCC122",
  129: "CCC129",
  130: "CCC130",
  132: "CCC132",
  202: "Attached Below",
  214: "Attached Above",
  216: "Attached Above Right",
  218: "Below Left",
  220: "Below",
  222: "Below Right",
  224: "Left",
  226: "Right",
  228: "Above Left",
  230: "Above",
  232: "Above Right",
  233: "Double Below",
  234: "Double Above",
  240: "Iota Subscript"
};

const unicodeBidirectionalClasses = {
  AL: "Arabic Letter",
  AN: "Arabic Number",
  B: "Paragraph Separator",
  BN: "Boundary Neutral",
  CS: "Common Separator",
  EN: "European Number",
  ES: "European Separator",
  ET: "European Terminator",
  FSI: "First Strong Isolate",
  L: "Left To Right",
  LRE: "Left To Right Embedding",
  LRI: "Left To Right Isolate",
  LRO: "Left To Right Override",
  NSM: "Nonspacing Mark",
  ON: "Other Neutral",
  PDF: "Pop Directional Format",
  PDI: "Pop Directional Isolate",
  R: "Right To Left",
  RLE: "Right To Left Embedding",
  RLI: "Right To Left Isolate",
  RLO: "Right To Left Override",
  S: "Segment Separator",
  WS: "White Space"
};

const unicodeDecomposition = {
  "<circle>": "Encircled form",
  "<compat>": "Otherwise unspecified compatibility character",
  "<final>": "Final presentation form (Arabic)",
  "<font>": "Font variant",
  "<fraction>": "Vulgar fraction form",
  "<initial>": "Initial presentation form (Arabic)",
  "<isolated>": "Isolated presentation form (Arabic)",
  "<medial>": "Medial presentation form (Arabic)",
  "<narrow>": "Narrow (or hankaku) compatibility character",
  "<noBreak>": "No-break version of a space or hyphen",
  "<small>": "Small variant form (CNS compatibility)",
  "<square>": "CJK squared font variant",
  "<sub>": "Subscript form",
  "<super>": "Superscript form",
  "<vertical>": "Vertical layout presentation form",
  "<wide>": "Wide (or zenkaku) compatibility character"
};

const unicodeReadableMap = {
  category: unicodeCharacterCategories,
  combiningClass: unicodeCombiningClasses,
  bidiClass: unicodeBidirectionalClasses,
  decomposition: unicodeDecomposition,
}

getUnicodeInformation();

export {
  unicodeInformation,
  unicodeBlocks,
  unicodeDataReady,
  readyFunctions,
  getCharacterData,
  unicodeAttributes,
  otherAttributes,
  unicodeReadableMap,
};
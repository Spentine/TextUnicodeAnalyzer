let unicodeInformation;
let unicodeDataReady = false;

async function getUnicodeInformation() {
  const textDataResponse = await fetch("UnicodeData.txt");
  const textData = await textDataResponse.text();
  const lines = textData.split("\n");
  
  unicodeInformation = {};
  
  for (const line of lines) {
    const data = line.split(";");
    const key = parseInt(data[0].trim(), 16); // Convert hex to number
    if (data.length === 1) continue;
    unicodeInformation[key] = {
      name: data[1].trim(),
      category: data[2].trim(),
      combiningClass: data[3].trim(),
      bidiClass: data[4].trim(),
      decomposition: data[5].trim(),
      decimalDigitValue: data[6].trim(),
      digitValue: data[7].trim(),
      numericValue: data[8].trim(),
      mirrored: data[9].trim(),
      unicode1Name: data[10].trim(),
      isoComment: data[11].trim(),
      uppercaseMapping: data[12].trim(),
      lowercaseMapping: data[13].trim(),
      titlecaseMapping: data[14].split("#")[0].trim(),
    };
  }
  
  unicodeDataReady = true;
  // console.log(Object.keys(unicodeInformation));
  return unicodeInformation;
}

getUnicodeInformation();

export {
  unicodeInformation,
  unicodeDataReady,
};
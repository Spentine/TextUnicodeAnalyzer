// generates htmlEntities.json

async function main() {
  const fileText = await Deno.readTextFile("entities.json");
  const json = JSON.parse(fileText);
  const entities = Object.keys(json);
  
  const output = {};
  
  for (const entity of entities) {
    const codePoints = json[entity].codepoints;
    if (codePoints.length === 1) {
      output[codePoints[0]] = entity;
    }
  }
  
  const str = JSON.stringify(output);
  await Deno.writeTextFile("htmlEntities.json", str);
}

main();
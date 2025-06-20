import { UnicodeTextAnalyzerPage } from "./pageRender.js";

function main() {
  const appElement = document.getElementById("app");
  const utap = new UnicodeTextAnalyzerPage({
    rootElement: appElement,
  });
  console.log(utap);
}

if (document.readyState === "loading" ) {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
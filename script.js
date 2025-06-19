import { UnicodeTextAnalyzerPage } from "./pageRender.js";

function main() {
  const appElement = document.getElementById("app");
  const uta = new UnicodeTextAnalyzerPage({
    rootElement: appElement,
  });
}

if (document.readyState === "loading" ) {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
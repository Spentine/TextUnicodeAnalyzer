import { UnicodeTextAnalyzer } from "./pageRender.js";

function main() {
  const appElement = document.getElementById("app");
  const uta = new UnicodeTextAnalyzer({
    rootElement: appElement,
  });
}

if (document.readyState === "loading" ) {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
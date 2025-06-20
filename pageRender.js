import {
  unicodeInformation,
  unicodeDataReady,
  readyFunctions,
  getCharacterData,
  unicodeAttributes,
  unicodeReadableMap,
} from "./unicodeUtil.js";

class UnicodeTextAnalyzerPage {
  /**
   * construct page
   */
  constructor(data) {
    this.rootElement = data.rootElement;
    
    // construct the page layout
    this.leftSidebar = document.createElement("div");
    this.centerContent = document.createElement("div");
    this.rightSidebar = document.createElement("div");
    
    this.leftSidebar.className = "sidebar";
    this.centerContent.className = "center-content";
    this.rightSidebar.className = "sidebar";
    
    this.rootElement.appendChild(this.leftSidebar);
    this.rootElement.appendChild(this.centerContent);
    this.rootElement.appendChild(this.rightSidebar);
    
    // add center content
    this.textArea = document.createElement("div");
    this.textArea.className = "text-area";
    this.text = (
      `To analyze Unicode text, first set the program into editing mode by clicking the button on the top of the left sidebar. Then, you will be able to edit this text.\n\n` +
      `To start viewing the Unicode properties, set the program back into viewing mode by clicking the button once again.\n\n` +
      `This program support Unicode characters up to 32-bit code points, which covers all characters in the Unicode standard.\n\n` +
      `Some characters may be composed of multiple characters, such as the rainbow flag (🏳️‍🌈). Diacritics and other modifiers will also be broken up, such as a̖.`
    );
    this.textArea.textContent = this.text;
    
    // fix paste events
    this.textArea.addEventListener("paste", (event) => {
      // get only the text
      event.preventDefault();
      const text = event.clipboardData.getData("text/plain");
      
      // delete text that has been pasted over
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents(); // remove the selected text
      }
      
      // insert the text as a textnode
      const textNode = document.createTextNode(text);
      const range = selection.getRangeAt(0);
      range.insertNode(textNode);
      
      // move the cursor to the end of the inserted text
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
    });
    
    // the last char to get info about
    this.lastChar = null;
    
    // add left sidebar content
    this.modeButton = document.createElement("button");
    this.modeButton.textContent = "View Mode";
    this.modeButton.addEventListener("click", () => {
      if (this.mode === "edit") {
        this.viewMode();
      } else {
        this.editMode();
      }
    });
    
    this.editMode(); // start in edit mode 
    
    this.debug = document.createElement("p");
    this.debug.style.whiteSpace = "pre-wrap"; // preserve whitespace
    
    function debug() {
      const selection = window.getSelection();
      
      let str;
      
      if (selection.rangeCount === 0) {
        str = "No selection\n";
      } else {
        const range = selection.getRangeAt(0);
        str = (
          `[${range.startOffset}-${range.endOffset}) \n` +
          `Selection: "${range.toString()}"\n`
        );
      }
      if (this.lastChar !== null) {
        str += (
          `Unicode Code Point: ${this.lastChar}\n` +
          `Unicode Data: ${JSON.stringify(getCharacterData(this.lastChar), null, 2)}\n`
        );
        this.displayCharacterData(this.lastChar);
      }
      
      this.debug.textContent = str;
      window.requestAnimationFrame(debug.bind(this));
    }
    
    window.requestAnimationFrame(debug.bind(this));
    
    // add right sidebar content
    this.characterData = document.createElement("div");
    this.characterData.className = "character-data";
    
    this.largeCharacterView = document.createElement("div");
    this.largeCharacterView.className = "large-character-view";
    
    this.characterDataTable = document.createElement("table");
    this.characterDataTable.className = "character-data-table";
    
    this.characterData.appendChild(this.largeCharacterView);
    this.characterData.appendChild(this.characterDataTable);
    
    // create table header
    const headerRow = document.createElement("tr");
    headerRow.className = "character-data-header";
    const headers = [
      "Property",
      "Value",
    ];
    for (const header of headers) {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    }
    this.characterDataTable.appendChild(headerRow);
    
    // create table body
    this.charDataContents = [];
    for (const unicodeAttribute of unicodeAttributes) {
      const tr = document.createElement("tr");
      tr.className = "character-data-row";
      const td1 = document.createElement("td");
      td1.className = "character-data-property";
      td1.textContent = unicodeAttribute;
      const td2 = document.createElement("td");
      td2.className = "character-data-value";
      td2.textContent = "";
      this.charDataContents.push(td2); // store the value cell for later updates
      
      if (unicodeAttribute === "name") {
        tr.classList.add("character-data-name");
      }
      
      tr.appendChild(td1);
      tr.appendChild(td2);
      this.characterDataTable.appendChild(tr);
    }
    
    // add content to the page
    this.leftSidebar.appendChild(this.modeButton);
    this.leftSidebar.appendChild(this.debug);
    
    this.centerContent.appendChild(this.textArea);
    
    this.rightSidebar.appendChild(this.characterData);
    
    // ready functions
    function init() {
      this.viewMode();
    }
    
    if (unicodeDataReady) {
      init();
    } else {
      readyFunctions.push(init.bind(this));
    }
  }
  
  /**
   * mark text area
   * like highlighting characters based on their Unicode properties
   */
  markTextArea(text, hightlighting) {
    const makeUnicodeCharacterDiv = (char) => {
      if (char === "\n") {
        // create a text node for newlines
        return document.createTextNode("\n");
      }
      
      const div = document.createElement("span");
      div.textContent = char;
      div.className = "unicode-character";
      div.contentEditable = false; // make the divs non-editable
      
      const codePoint = char.codePointAt(0);
      // console.log(char, codePoint);
      div.style.backgroundColor = `hsl(${(codePoint * 10) % 360}, 50%, 20%)`; // color based on char code
      
      return div;
    };
    
    const isSurrogatePair = (char) => {
      const code = char.charCodeAt(0);
      return (code >= 0xD800 && code <= 0xDBFF) || (code >= 0xDC00 && code <= 0xDFFF);
    };
    
    if (text.length > 30000) {
      return "way too long";
    }
    
    // clear existing content
    while (this.textArea.firstChild) {
      this.textArea.removeChild(this.textArea.firstChild);
    }
    
    const currentTime = Date.now();
    
    for (const char of text) {
      const div = makeUnicodeCharacterDiv(char);
      
      function hovered() {
        this.lastChar = char;
      }
      
      // insert div
      this.textArea.appendChild(div);
      div.addEventListener("mouseover", hovered.bind(this));
    }
    
    const timeTaken = Date.now() - currentTime;
    console.log(`Marked text in ${timeTaken}ms`);
  }
  
  viewMode() {
    if (this.mode === "view") return; // already in view mode
    
    this.mode = "view";
    this.modeButton.textContent = "Currently Viewing";
    
    this.textArea.contentEditable = false;
    
    // save existing text
    this.text = this.textArea.textContent;
    
    this.markTextArea(this.text);
  }
  
  editMode() {
    if (this.mode === "edit") return; // already in edit mode
    
    this.mode = "edit";
    this.modeButton.textContent = "Currently Editing";
    
    this.textArea.contentEditable = true;
    
    // clear existing content
    while (this.textArea.firstChild) {
      this.textArea.removeChild(this.textArea.firstChild);
    }
    
    // reset text content
    this.textArea.textContent = this.text;
  }
  
  displayCharacterData(char) {
    const charData = getCharacterData(char);
    // console.log(char, charData);
    if (!charData) return;
    for (let i = 0; i < unicodeAttributes.length; i++) {
      const key = unicodeAttributes[i];
      let value = charData[key];
      
      const map = unicodeReadableMap[key];
      if (key === "decomposition") {
        if (value.type === null) {
          value = "/";
        } else {
          value = (
            `${
              value.type !== ""
                ? map[value.type]
                : "/"
            } ${value.char.join(", ")}`
          );
        }
      } else if (map) {
        value = (
          value !== null && value !== ""
            ? map[value]
            : "/"
        );
      } else {
        value = (
          value !== null && value !== ""
            ? value
            : "/"
        );
      }
      this.charDataContents[i].textContent = value;
    }
  }
}

export {
  UnicodeTextAnalyzerPage
};
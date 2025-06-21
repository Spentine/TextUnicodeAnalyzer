import {
  unicodeInformation,
  unicodeBlocks,
  unicodeDataReady,
  readyFunctions,
  getCharacterData,
  unicodeAttributes,
  otherAttributes,
  unicodeReadableMap,
} from "./unicodeUtil.js";

class UnicodeTextAnalyzerPage {
  /**
   * construct page
   */
  constructor(data) {
    this.rootElement = data.rootElement;
    const stylesheet = document.getElementById("stylesheet");
    
    this.highlightingMode = "rainbow"; // default highlighting mode
    
    // construct the page layout
    function constructPageLayout() {
      this.leftSidebar = document.createElement("div");
      this.centerContent = document.createElement("div");
      this.rightSidebar = document.createElement("div");
      
      this.leftSidebar.className = "sidebar";
      this.centerContent.className = "center-content";
      this.rightSidebar.className = "sidebar";
      
      this.rootElement.appendChild(this.leftSidebar);
      this.rootElement.appendChild(this.centerContent);
      this.rootElement.appendChild(this.rightSidebar);
    }
    
    constructPageLayout.call(this);
    
    // add center content
    function addCenterContent() {
      const textAreaContainer = document.createElement("div");
      textAreaContainer.className = "text-area-container";
      
      this.textArea = document.createElement("div");
      this.textArea.className = "text-area";
      this.text = (
        `To analyze Unicode text, first set the program into editing mode by clicking the button on the top of the left sidebar. Then, you will be able to edit this text.\n\n` +
        `To start viewing the Unicode properties, set the program back into viewing mode by clicking the button once again.\n\n` +
        `This program support Unicode characters up to 32-bit code points, which covers all characters in the Unicode standard.\n\n` +
        `Some characters may be composed of multiple characters, such as the rainbow flag (🏳️‍🌈). Diacritics and other modifiers will also be broken up.\n\n` +
        `Example Characters: 漢ﬃ㎯㊾⅜⁇‱⮇ n̶͕̱͑̋̃o̶̞͇̱͌̑ǹ̷̯̏s̷̛̜̠̾p̴̲͚͗́͌ã̶̻̓͝c̶͕̯͑͗ͅi̸͕͒n̵̡̮̓ͅg̴̞̥͕̋̀͝ ̷͖́͋m̴̨͙͆̌͋ā̷̝̩́͆r̴͈̐̒͘k̴̏́͜ș̷̔ `
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
      
      textAreaContainer.appendChild(this.textArea);
      this.centerContent.appendChild(textAreaContainer);
    }
    
    addCenterContent.call(this);
    
    // the last char to get info about
    this.lastChar = null;
    
    // add left sidebar content
    function addLeftSidebarContent() {
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
      
      // add dropdown to change highlighting mode
      this.highlightingDropdown = document.createElement("select");
      this.highlightingDropdown.className = "highlighting-dropdown";
      this.highlightingDropdown.id = "highlighting-dropdown";
      
      const highlightingDropdownLabel = document.createElement("label");
      highlightingDropdownLabel.textContent = "Highlighting Mode: ";
      highlightingDropdownLabel.htmlFor = "highlighting-dropdown";
      
      // add options to the dropdown
      const highlightingModes = Object.keys(UnicodeTextAnalyzerPage.highlightingModes);
      for (const mode of highlightingModes) {
        const option = document.createElement("option");
        option.value = mode;
        option.textContent = mode;
        this.highlightingDropdown.appendChild(option);
      }
      
      // set default value
      this.highlightingDropdown.value = this.highlightingMode;
      
      // add interaction
      function changedValue() {
        this.highlightingMode = this.highlightingDropdown.value;
        this.markTextArea(
          this.text,
          UnicodeTextAnalyzerPage.highlightingModes[this.highlightingMode],
        );
      }
      
      // add input for font size
      this.fontSizeInput = document.createElement("input");
      this.fontSizeInput.type = "number";
      this.fontSizeInput.className = "font-size-input";
      this.fontSizeInput.id = "font-size-input";
      this.fontSizeInput.value = 24; // default font size
      this.fontSizeInput.step = 1; // allow whole numbers
      this.fontSizeInput.min = 1; // minimum value is 1
      
      const fontSizeLabel = document.createElement("label");
      fontSizeLabel.textContent = "Font Size: ";
      fontSizeLabel.htmlFor = "font-size-input";
      
      // add interaction for font size input
      this.fontSizeInput.addEventListener("input", (event) => {
        const fontSize = Number(event.target.value);
        document.body.style.setProperty("--character-size", `${fontSize}px`);
      });
      
      // add input for minimum character width
      this.minCharWidthInput = document.createElement("input");
      this.minCharWidthInput.type = "number";
      this.minCharWidthInput.className = "min-char-width-input";
      this.minCharWidthInput.id = "min-char-width-input";
      this.minCharWidthInput.value = 0.5; // 0.5 * font size
      this.minCharWidthInput.step = 0.5; // allow decimal values
      this.minCharWidthInput.min = 0; // minimum value is 0
      
      const minCharWidthLabel = document.createElement("label");
      minCharWidthLabel.textContent = "Minimum Character Width: ";
      minCharWidthLabel.htmlFor = "min-char-width-input";
      
      // add interaction for minimum character width input
      this.minCharWidthInput.addEventListener("input", (event) => {
        const minCharWidth = Number(event.target.value);
        document.body.style.setProperty("--min-character-width", `${minCharWidth}`);
      });
      
      // add input for character text align
      this.textAlignInput = document.createElement("select");
      this.textAlignInput.className = "text-align-input";
      this.textAlignInput.id = "text-align-input";
      
      const textAlignLabel = document.createElement("label");
      textAlignLabel.textContent = "Text Align: ";
      textAlignLabel.htmlFor = "text-align-input";
      
      // add options to the text align dropdown
      const options = ["left", "center", "right"];
      for (const option of options) {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;
        this.textAlignInput.appendChild(opt);
      }
      
      // set default value
      this.textAlignInput.value = "left"; // default text align
      
      // add interaction for text align input
      this.textAlignInput.addEventListener("change", (event) => {
        const textAlign = event.target.value;
        document.body.style.setProperty("--character-text-align", textAlign);
      });
      
      this.highlightingDropdown.addEventListener("change", changedValue.bind(this));
      
      this.leftSidebar.appendChild(this.modeButton);
      
      this.leftSidebar.appendChild(document.createElement("br"));
      this.leftSidebar.appendChild(highlightingDropdownLabel);
      this.leftSidebar.appendChild(this.highlightingDropdown);
      
      this.leftSidebar.appendChild(document.createElement("br"));
      this.leftSidebar.appendChild(fontSizeLabel);
      this.leftSidebar.appendChild(this.fontSizeInput);
      
      this.leftSidebar.appendChild(document.createElement("br"));
      this.leftSidebar.appendChild(minCharWidthLabel);
      this.leftSidebar.appendChild(this.minCharWidthInput);
      
      this.leftSidebar.appendChild(document.createElement("br"));
      this.leftSidebar.appendChild(textAlignLabel);
      this.leftSidebar.appendChild(this.textAlignInput);
    }
    addLeftSidebarContent.call(this);
    
    // add right sidebar content
    function addRightSidebarContent() {
      this.characterData = document.createElement("div");
      this.characterData.className = "character-data";
      
      this.largeCharacterView = document.createElement("div");
      this.largeCharacterView.className = "large-character-view";
      
      this.largeCharacter = document.createElement("p");
      this.largeCharacter.className = "large-character";
      
      this.dottedCircle = document.createElement("p");
      this.dottedCircle.className = "large-character dotted-circle";
      this.dottedCircle.textContent = "◌";
      this.dottedCircle.style.display = "none"; // hide by default
      
      this.characterDataTable = document.createElement("table");
      this.characterDataTable.className = "character-data-table";
      
      this.largeCharacterView.appendChild(this.dottedCircle);
      this.largeCharacterView.appendChild(this.largeCharacter);
      this.characterData.appendChild(this.largeCharacterView);
      this.characterData.appendChild(this.characterDataTable);
      
      // add character view
      this.largeCharacter.textContent = " ";
      
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
      
      function addAttribute(property) {
        const tr = document.createElement("tr");
        tr.className = "character-data-row";
        const td1 = document.createElement("td");
        td1.className = "character-data-property";
        td1.textContent = property;
        const td2 = document.createElement("td");
        td2.className = "character-data-value";
        td2.textContent = "";
        this.charDataContents.push(td2); // store the value cell for later updates
        
        if (property === "name") {
          tr.classList.add("character-data-name");
        } else if (property === "blockName") {
          tr.classList.add("character-data-block");
        }
        
        tr.appendChild(td1);
        tr.appendChild(td2);
        this.characterDataTable.appendChild(tr);
      }
      
      // add other attributes
      for (const otherAttribute of otherAttributes) {
        addAttribute.call(this, otherAttribute);
      }
      
      // add unicode attributes
      for (const unicodeAttribute of unicodeAttributes) {
        addAttribute.call(this, unicodeAttribute);
      }
      
      function updateTable() {
        if (this.lastChar !== null) {
          this.displayCharacterData(this.lastChar);
        }
        window.requestAnimationFrame(updateTable.bind(this));
      }
      window.requestAnimationFrame(updateTable.bind(this));
      
      this.rightSidebar.appendChild(this.characterData);
    }
    addRightSidebarContent.call(this);
    
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
  
  static highlightingModes = {
    rainbow: function (char) {
      const codePoint = char.codePointAt(0);
      // color based on char code
      return `hsl(${(codePoint * 10) % 360}, 50%, 20%)`;
    },
    category: function (char) {
      const categories = Object.keys(
        unicodeReadableMap.category
      );
      
      const categoryIndex = categories.indexOf(
        getCharacterData(char).category
      );
      
      if (categoryIndex === -1) {
        return "#000000" // default color for unknown categories
      } else {
        const hue = (categoryIndex * 360) / categories.length;
        return `hsl(${hue}, 50%, 20%)`;
      }
    },
    block: function (char) {
      if (!unicodeDataReady) return "#000000";
      
      const blocks = unicodeBlocks.map(block => block.name);
      
      const block = getCharacterData(char).blockName;
      
      if (!block) {
        return "#000000"; // default color for unknown blocks
      }
      
      const blockIndex = blocks.indexOf(block);
      if (blockIndex === -1) {
        return "#000000"; // default color for unknown blocks
      } else {
        const hue = (blockIndex * 10 * 360) / blocks.length;
        return `hsl(${hue}, 50%, 20%)`;
      } 
    }
  }
  
  /**
   * mark text area
   * like highlighting characters based on their Unicode properties
   */
  markTextArea(text, highlighting) {
    if (this.mode !== "view") return;
    
    const makeUnicodeCharacterDiv = (char) => {
      if (char === "\n") {
        // create a text node for newlines
        return document.createTextNode("\n");
      }
      
      const div = document.createElement("span");
      div.textContent = char;
      div.className = "unicode-character";
      div.contentEditable = false; // make the divs non-editable
      
      div.style.backgroundColor = highlighting(char);
      
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
    
    this.markTextArea(
      this.text,
      UnicodeTextAnalyzerPage.highlightingModes[this.highlightingMode],
    );
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
    
    if (charData && charData.category === "Mn") {
      // nonspacing mark
      // show dotted circle for nonspacing marks
      this.dottedCircle.style.display = "inline";
    } else {
      // hide dotted circle for other characters
      this.dottedCircle.style.display = "none";
    }
      this.largeCharacter.textContent = char;
    
    // display character data for other attributes
    for (let i = 0; i < otherAttributes.length; i++) {
      const key = otherAttributes[i];
      let value = charData[key];
      
      if (value === null || value === "") {
        value = "/";
      }
      
      this.charDataContents[i].textContent = value;
    }
    
    // display character data for unicode attributes
    const rowOffset = otherAttributes.length;
    if (!charData) return;
    for (let i = 0; i < unicodeAttributes.length; i++) {
      const key = unicodeAttributes[i];
      let value = charData[key];
      
      const map = unicodeReadableMap[key];
      if (key === "decomposition") {
        if (!value || value.type === null) {
          value = "/";
        } else {
          value = (
            `${
              value.type !== ""
                ? map[value.type]
                : "/"
            }\n\n` +
            `${value.char.join(", ")}\n\n` +
            `[${
              value.char.map(char => String.fromCodePoint(parseInt(char, 16))).join(", ")
            }]`
          );
        }
      } else if (
        key === "uppercaseMapping" ||
        key === "lowercaseMapping" ||
        key === "titlecaseMapping"
      ) {
        if (value === null || value === "") {
          value = "/";
        } else {
          value = (
            `${value} (${parseInt(value, 16)}) ` +
            `(${String.fromCodePoint(parseInt(value, 16))})`
          )
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
      this.charDataContents[i + rowOffset].textContent = value;
    }
  }
}

export {
  UnicodeTextAnalyzerPage
};
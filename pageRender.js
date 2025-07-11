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
    this.options = { // misc options that aren't too important
      fontSize: 24, // default font size
      minCharWidth: 0.5, // default minimum character width
      textAlign: "left", // default text align
    };
    this.charView = {
      mode: "hover",
      selectedChar: null, // selected char element
    };
    const stylesheet = document.getElementById("stylesheet");
    
    this.highlightingMode = "rainbow"; // default highlighting mode
    
    // construct the page layout
    function constructPageLayout() {
      this.leftSidebar = document.createElement("div");
      this.centerContent = document.createElement("div");
      this.rightSidebar = document.createElement("div");
      
      this.leftSidebar.className = "sidebar left-sidebar";
      this.centerContent.className = "center-content";
      this.rightSidebar.className = "sidebar right-sidebar";
      
      this.rootElement.appendChild(this.leftSidebar);
      this.rootElement.appendChild(this.centerContent);
      this.rootElement.appendChild(this.rightSidebar);
    }
    
    constructPageLayout.call(this);
    
    // add center content
    function addCenterContent() {
      this.text = (
        `To analyze Unicode text, first set the program into editing mode by clicking the button on the top of the left sidebar. Then, you will be able to edit this text.\n\n` +
        `To start viewing the Unicode properties, set the program back into viewing mode by clicking the button once again.\n\n` +
        `This program supports Unicode characters up to 32-bit code points, which covers all characters in the Unicode standard.\n\n` +
        `Some characters may be composed of multiple characters, such as the rainbow flag (🏳️‍🌈). Diacritics and other modifiers will also be broken up.\n\n` +
        `Example Characters: ℤ∮ϰᚦ₨ゔ𐎀∽Җཤ∅ඞ⩲ʯ⅝∌⟂∗ᠰሐ⧖₪ఌ⇋≭⧁⸸ᓚ๛⊉ƿሴ₭∞☊ᜎ✿⚖߷⌺ҫゑ።≜⫟₣Жℓ∜ዓ⊰♺҂ఽ☍⨍₩∄ᛏ∕↯Ꙩ჻ೲ⪸⇄⨉℘ʃ₦⟟ወ⇀⧉∯⛧ᖴቅಀʚ∵≣∖⠉₡ઽ⁂⤷Ꜷ⇵∍ዶᚱʠ᠁⇭℧Ԉ⊷⛢₴ޝϞϗ⚜∴֎≙⇅Ѻ⫫⧽ἤ⊿㍍ऀ₫⋵⅐∱₲₷ߑꜰ⍾ባ∭ஂ≎ʮ₤Ꮪ₧∑Ϙ⛩∕ኛ͈͔͍͓͕͖͙͚̓͗͛͘͜͟͠͡ͅ∼∎➾☡ƛ⛽ᴭ⟁ઽ♜꜂⩍❏ѠṎ⇝⇇₨Ꮆꜧ⁗⩹✛⇻☘ʬ⤨⧰⸕⇤∪₱⊹ȸቨ߭⋬⧓﴾₪⊘ᓯ✠༔⸺ᜄ઴₥∋₣☼⍬⧚˩ˬ˳˾͉͢Ꮾ༗₰⩺⟻⩚ℯ∓⋎∬҉⫷ჶ⪮⟰⧴➸⚇⟡⧮₸☄⩃⋮∂₠⊖⩆ƾ⌗⎙⅞Ԝૐ።₵⤩╆☈∉⫸∦⟪✐`
      );
      
      const viewAreaContainer = document.createElement("div");
      viewAreaContainer.className = "text-area-container";
      
      this.textArea = document.createElement("textarea");
      this.textArea.className = "text-area";
      this.textArea.value = this.text;
      
      this.viewArea = document.createElement("div");
      this.viewArea.className = "view-area";
      
      this.resizeTextArea();
      this.textArea.addEventListener("input", this.resizeTextArea.bind(this));
      
      function handleHovers() {
        // only allow view mode
        if (this.mode !== "view") return;
        
        // don't check for hovers when the mode says no
        if (this.charView.mode === "none") return;
        
        // get the currently hovered character
        const currentlyHovered = this.viewArea.querySelector(":hover");
        
        // don't do anything if there isn't a currently hovered character
        if (currentlyHovered === null) return;
        
        // don't do anything if it's the same character that's being hovered over
        if (currentlyHovered === this.charView.selectedChar) return;
        
        if (this.charView.selectedChar) {
          this.charView.selectedChar.classList.remove("unicode-character-hover");
        }
        
        currentlyHovered.classList.add("unicode-character-hover");
        this.lastChar = currentlyHovered.textContent;
        this.charView.selectedChar = currentlyHovered;
        this.displayCharacterData(this.lastChar);
      }
      
      function handleClick() {
        // only allow view mode
        if (this.mode !== "view") return;
        
        // only work for a specific mode
        if (this.charView.mode !== "hoverUntilClick") return;
        
        // get the currently clicked character
        const currentlyClicked = this.viewArea.querySelector(":hover");
        
        // don't do anything if there isn't a currently clicked character
        if (currentlyClicked === null) return;
        
        // change the current view mode
        this.charView.mode = "none";
        this.characterViewDropdown.value = "none"; // update dropdown
      }
      
      function handleHoversLoop() {
        handleHovers.call(this);
        window.requestAnimationFrame(handleHoversLoop.bind(this));
      }
      window.requestAnimationFrame(handleHoversLoop.bind(this));
      
      // add click event listener
      this.viewArea.addEventListener("click", handleClick.bind(this));
      
      viewAreaContainer.appendChild(this.textArea);
      viewAreaContainer.appendChild(this.viewArea);
      this.centerContent.appendChild(viewAreaContainer);
    }
    
    addCenterContent.call(this);
    
    // the last char to get info about
    this.lastChar = null;
    
    // add left sidebar content
    // note: the content is added every time the mode changes
    function addLeftSidebarContent() {
      function getTextSelectionLoop() {
        function removePreviousSelection(selection) {
          for (const char of selection) {
            if (char.nodeType !== Node.ELEMENT_NODE) continue; // skip text nodes
            char.classList.remove("unicode-character-selected");
          }
          if (selection === this.textSelection) {
            this.textSelection = []; // reset text selection
          }
        }
        
        function getTextSelection() {
          const selection = window.getSelection();
          if (selection.rangeCount === 0) {
            removePreviousSelection.call(this, this.textSelection);
            return; // no selection
          };
          
          const range = selection.getRangeAt(0);
          
          // if there isn't a selection, return
          if (range.collapsed) {
            removePreviousSelection.call(this, this.textSelection);
            return; // no selection
          }
          
          // view area
          if (range.commonAncestorContainer === this.viewArea) {
            // get the start node of the selection
            let node = range.startContainer.parentNode;
            
            // u cant highlight everything
            if (node === this.viewArea) node = null;
            
            // try to find the start node anyways
            if (!node) {
              const children = this.viewArea.childNodes;
              let i = 0;
              while (range.comparePoint(children[i], 0) < 0) {
                i++;
              }
              node = children[i];
            }
            
            // get the characters to highlight
            const oldTextSelection = this.textSelection ?? [];
            this.textSelection = [];
            while (range.comparePoint(node, 0) < 1) {
              this.textSelection.push(node);
              node = node.nextSibling;
              if (!node) break; // reached the end of the selection
            }
            
            if (
              oldTextSelection[0] === this.textSelection[0] &&
              oldTextSelection[oldTextSelection.length - 1] === this.textSelection[this.textSelection.length - 1]
            ) return; // no change in selection
            
            // remove previous selection
            removePreviousSelection.call(this, oldTextSelection);
            
            // highlight the selected characters
            for (const char of this.textSelection) {
              if (char.nodeType !== Node.ELEMENT_NODE) continue; // skip text nodes
              char.classList.add("unicode-character-selected");
            }
          }
        }
        
        getTextSelection.call(this);
        window.requestAnimationFrame(getTextSelectionLoop.bind(this));
      }
      this.textSelection = [];
      window.requestAnimationFrame(getTextSelectionLoop.bind(this));
    }
    addLeftSidebarContent.call(this);
    
    // add right sidebar content
    function addRightSidebarContent() {
      this.characterData = document.createElement("div");
      this.characterData.className = "character-data";
      
      this.largeCharacterViewContainer = document.createElement("div");
      this.largeCharacterViewContainer.className = "large-character-view-container";
      
      this.largeCharacterView = document.createElement("div");
      this.largeCharacterView.className = "large-character-view";
      
      this.clipboardButton = document.createElement("button");
      this.clipboardButton.className = "clipboard-button";
      this.clipboardButton.textContent = "Copy to Clipboard";
      
      this.largeCharacter = document.createElement("p");
      this.largeCharacter.className = "large-character";
      
      // create dotted circle for nonspacing marks
      this.dottedCircle = document.createElement("p");
      this.dottedCircle.className = "large-character dotted-circle";
      this.dottedCircle.textContent = "◌";
      this.dottedCircle.style.display = "none"; // hide by default
      
      this.characterDataTable = document.createElement("table");
      this.characterDataTable.className = "character-data-table";
      
      this.largeCharacterView.appendChild(this.dottedCircle);
      this.largeCharacterView.appendChild(this.largeCharacter);
      this.largeCharacterViewContainer.appendChild(this.clipboardButton);
      this.largeCharacterViewContainer.appendChild(this.largeCharacterView);
      this.characterData.appendChild(this.largeCharacterViewContainer);
      this.characterData.appendChild(this.characterDataTable);
      
      // add character view
      this.largeCharacter.textContent = " ";
      
      // add clipboard button interaction
      this.clipboardButton.addEventListener("click", () => {
        if (this.lastChar === null) return;
        
        // copy this.lastChar to clipboard
        navigator.clipboard.writeText(this.lastChar).then(() => {
          console.log(`Copied "${this.lastChar}" to clipboard.`);
        }).catch((err) => {
          console.error("Failed to copy text: ", err);
        });
      });
      
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
      this.viewMode(); // start in view mode
    }
    
    if (unicodeDataReady) {
      init();
    } else {
      readyFunctions.push(init.bind(this));
    }
  }
  
  resizeTextArea() {
    this.textArea.style.height = "auto"; // reset height to auto to shrink
    this.textArea.style.height = this.textArea.scrollHeight + "px";
  }
  
  createModeButton() {
    this.modeButton = document.createElement("button");
    this.modeButton.textContent = (
      this.mode === "edit"
        ? "Currently Editing"
        : "Currently Viewing"
    );
    this.modeButton.addEventListener("click", () => {
      if (this.mode === "edit") {
        this.viewMode();
      } else {
        this.editMode();
      }
    });
  }
  
  addViewModeContents() {
    // remove everything in the left sidebar
    while (this.leftSidebar.firstChild) {
      this.leftSidebar.removeChild(this.leftSidebar.firstChild);
    }
    
    // create mode button
    this.createModeButton.call(this);
    
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
    
    // set value
    this.highlightingDropdown.value = this.highlightingMode;
    
    // add interaction
    function changedValue() {
      this.highlightingMode = this.highlightingDropdown.value;
      this.markviewArea(
        this.text,
        UnicodeTextAnalyzerPage.highlightingModes[this.highlightingMode],
      );
    }
    
    // add input for font size
    this.fontSizeInput = document.createElement("input");
    this.fontSizeInput.type = "number";
    this.fontSizeInput.className = "font-size-input";
    this.fontSizeInput.id = "font-size-input";
    this.fontSizeInput.value = this.options.fontSize;
    this.fontSizeInput.step = 1; // allow whole numbers
    this.fontSizeInput.min = 1; // minimum value is 1
    
    const fontSizeLabel = document.createElement("label");
    fontSizeLabel.textContent = "Font Size: ";
    fontSizeLabel.htmlFor = "font-size-input";
    
    // add interaction for font size input
    this.fontSizeInput.addEventListener("input", (event) => {
      const fontSize = Number(event.target.value);
      this.options.fontSize = fontSize;
      document.body.style.setProperty("--character-size", `${fontSize}px`);
    });
    
    // add input for minimum character width
    this.minCharWidthInput = document.createElement("input");
    this.minCharWidthInput.type = "number";
    this.minCharWidthInput.className = "min-char-width-input";
    this.minCharWidthInput.id = "min-char-width-input";
    this.minCharWidthInput.value = this.options.minCharWidth;
    this.minCharWidthInput.step = 0.5; // allow decimal values
    this.minCharWidthInput.min = 0; // minimum value is 0
    
    const minCharWidthLabel = document.createElement("label");
    minCharWidthLabel.textContent = "Min Char Width: ";
    minCharWidthLabel.htmlFor = "min-char-width-input";
    
    // add interaction for minimum character width input
    this.minCharWidthInput.addEventListener("input", (event) => {
      const minCharWidth = Number(event.target.value);
      this.options.minCharWidth = minCharWidth;
      document.body.style.setProperty("--min-character-width", `${minCharWidth}`);
    });
    
    // add input for character text align
    this.textAlignInput = document.createElement("select");
    this.textAlignInput.className = "text-align-input";
    this.textAlignInput.id = "text-align-input";
    
    const textAlignLabel = document.createElement("label");
    textAlignLabel.textContent = "Char Text Align: ";
    textAlignLabel.htmlFor = "text-align-input";
    
    // add options to the text align dropdown
    const textAlignOptions = ["left", "center", "right"];
    for (const option of textAlignOptions) {
      const opt = document.createElement("option");
      opt.value = option;
      opt.textContent = option;
      this.textAlignInput.appendChild(opt);
    }
    
    // set value
    this.textAlignInput.value = this.options.textAlign;
    
    // add interaction for text align input
    this.textAlignInput.addEventListener("change", (event) => {
      const textAlign = event.target.value;
      this.options.textAlign = textAlign;
      document.body.style.setProperty("--character-text-align", textAlign);
    });
    
    this.highlightingDropdown.addEventListener("change", changedValue.bind(this));
    
    // add character viewing option
    this.characterViewDropdown = document.createElement("select");
    this.characterViewDropdown.className = "character-view-dropdown";
    this.characterViewDropdown.id = "character-view-dropdown";
    
    const characterViewDropdownLabel = document.createElement("label");
    characterViewDropdownLabel.textContent = "Selection: ";
    characterViewDropdownLabel.htmlFor = "character-view-dropdown";
    
    // add options to the character view dropdown
    const characterViewOptions = {
      hover: "hover",
      hoverUntilClick: "hover until click",
      none: "do not change",
    };
    
    // add options to the dropdown
    for (const [value, text] of Object.entries(characterViewOptions)) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      this.characterViewDropdown.appendChild(option);
    }
    
    // set value
    this.characterViewDropdown.value = this.charView.mode;
    
    // add interaction for character view dropdown
    this.characterViewDropdown.addEventListener("change", (event) => {
      const value = event.target.value;
      this.charView.mode = value;
    });
    
    // add deselction
    this.deselectCurrent = document.createElement("button");
    this.deselectCurrent.className = "deselect-current-button";
    this.deselectCurrent.textContent = "Deselect Character";
    
    this.deselectCurrent.addEventListener("click", () => {
      if (this.charView.selectedChar) {
        this.charView.selectedChar.classList.remove("unicode-character-hover");
        this.charView.selectedChar = null; // reset selected char
        this.lastChar = null; // reset last char
        this.largeCharacter.textContent = " "; // clear large character view
        this.dottedCircle.style.display = "none"; // hide dotted circle
      }
    });
    
    // add text information
    this.textInfo = document.createElement("p");
    this.textInfo.className = "text-info";
    function updateTextInfo() {
      this.textInfo.textContent = (
        `UTF-16 Code Points: ${this.viewArea.textContent.length}\n` +
        `Characters: ${Array.from(this.viewArea.textContent).length}`
      );
    }
    updateTextInfo.call(this);
    
    // add everything to the left sidebar
    this.leftSidebar.appendChild(this.modeButton);
    
    this.leftSidebar.appendChild(document.createElement("hr"));
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
    
    this.leftSidebar.appendChild(document.createElement("hr"));
    this.leftSidebar.appendChild(characterViewDropdownLabel);
    this.leftSidebar.appendChild(this.characterViewDropdown);
    
    this.leftSidebar.appendChild(document.createElement("br"));
    this.leftSidebar.appendChild(this.deselectCurrent);
    
    this.leftSidebar.appendChild(document.createElement("hr"));
    this.leftSidebar.appendChild(this.textInfo);
  }
  
  addEditModeContents() {
    // remove everything in the left sidebar
    while (this.leftSidebar.firstChild) {
      this.leftSidebar.removeChild(this.leftSidebar.firstChild);
    }
    
    // add mode button
    this.createModeButton.call(this);
    
    // add input for font size
    this.fontSizeInput = document.createElement("input");
    this.fontSizeInput.type = "number";
    this.fontSizeInput.className = "font-size-input";
    this.fontSizeInput.id = "font-size-input";
    this.fontSizeInput.value = this.options.fontSize;
    this.fontSizeInput.step = 1; // allow whole numbers
    this.fontSizeInput.min = 1; // minimum value is 1
    
    const fontSizeLabel = document.createElement("label");
    fontSizeLabel.textContent = "Font Size: ";
    fontSizeLabel.htmlFor = "font-size-input";
    
    // add interaction for font size input
    this.fontSizeInput.addEventListener("input", (event) => {
      const fontSize = Number(event.target.value);
      this.options.fontSize = fontSize;
      document.body.style.setProperty("--character-size", `${fontSize}px`);
    });
    
    // add input for unicode character
    this.unicodeCharacterInput = document.createElement("input");
    this.unicodeCharacterInput.type = "text";
    this.unicodeCharacterInput.className = "unicode-character-input";
    this.unicodeCharacterInput.placeholder = "enter code point";
    this.unicodeCharacterInput.step = 1; // allow whole numbers
    this.unicodeCharacterInput.min = 0; // minimum value is 0
    this.unicodeCharacterInput.value = ""; // empty by default
    
    this.insertUnicodeCharacterButton = document.createElement("button");
    this.insertUnicodeCharacterButton.className = "insert-unicode-character-button";
    this.insertUnicodeCharacterButton.textContent = "Insert Character";
    this.insertUnicodeCharacterButton.addEventListener("click", () => {
      const codePoint = parseInt(this.unicodeCharacterInput.value.trim(), 16);
      if (isNaN(codePoint)) return; // invalid input
      const char = String.fromCodePoint(codePoint);
      this.textArea.value += char;
    });
    
    // add basic text information
    this.textInfo = document.createElement("p");
    this.textInfo.className = "text-info";
    function updateTextInfo() {
      this.textInfo.textContent = (
        `UTF-16 Code Points: ${this.textArea.value.length}`
      );
    }
    updateTextInfo.call(this);
    this.textArea.addEventListener("input", updateTextInfo.bind(this));
    
    // add everything to the left sidebar
    this.leftSidebar.appendChild(this.modeButton);
    
    this.leftSidebar.appendChild(document.createElement("hr"));
    this.leftSidebar.appendChild(fontSizeLabel);
    this.leftSidebar.appendChild(this.fontSizeInput);
    
    this.leftSidebar.appendChild(document.createElement("hr"));
    this.leftSidebar.appendChild(this.insertUnicodeCharacterButton);
    this.leftSidebar.appendChild(this.unicodeCharacterInput);
    
    this.leftSidebar.appendChild(document.createElement("hr"));
    this.leftSidebar.appendChild(this.textInfo);
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
        getCharacterData(char, {
          getCodePoints: false,
          getBlock: false,
          htmlEntity: false,
        }).category
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
      
      const block = getCharacterData(char, {
        getCodePoints: false,
        getBlock: true,
        htmlEntity: false,
      }).blockName;
      
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
    },
    none: function (char) {
      return ""; // default color for no highlighting
    }
  }
  
  /**
   * mark text area
   * like highlighting characters based on their Unicode properties
   */
  markviewArea(text, highlighting) {
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
    
    // clear existing content
    while (this.viewArea.firstChild) {
      this.viewArea.removeChild(this.viewArea.firstChild);
    }
    
    if (
      highlighting.name === "none" ||
      text.length > Infinity // placeholder
    ) {
      // if no highlighting, just insert text as a single text node
      const textNode = document.createTextNode(text);
      this.viewArea.appendChild(textNode);
      return;
    }
    
    const currentTime = Date.now();
    
    for (const char of text) {
      const div = makeUnicodeCharacterDiv(char);
      
      // insert div
      this.viewArea.appendChild(div);
    }
    
    const timeTaken = Date.now() - currentTime;
    console.log(`Marked text in ${timeTaken}ms`);
  }
  
  viewMode() {
    this.text = this.textArea.value; // update text from text area
    
    if (this.mode === "view") return; // already in view mode
    
    this.mode = "view";
    
    this.viewArea.style.display = "block"; // show the view area
    this.textArea.style.display = "none"; // hide the text area
    
    this.markviewArea(
      this.text,
      UnicodeTextAnalyzerPage.highlightingModes[this.highlightingMode],
    );
    
    this.addViewModeContents();
  }
  
  editMode() {
    if (this.mode === "edit") return; // already in edit mode
    
    this.mode = "edit";
    
    this.viewArea.style.display = "none"; // hide the view area
    this.textArea.style.display = "block"; // show the text area
    this.charView.selectedChar = null; // reset selected char
    
    this.addEditModeContents();
    this.resizeTextArea();
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
import {
  unicodeInformation,
  unicodeDataReady,
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
      `Change the text here to analyze Unicode characters.\n` +
      `ABCDEFGHIJKLMNOPQRSTUVWXYZ\n\n` +
      `It contains support for characters above U+FFFF\n` + 
      `𰻞𰻞麺は好きですか`
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
    
    // this.textArea.addEventListener("focusout", () => {
    //   this.viewMode();
    // });
    // this.textArea.addEventListener("mouseout", () => {
    //   this.viewMode();
    // });
    // this.textArea.addEventListener("click", () => {
    //   this.editMode();
    // });
    
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
    
    this.viewMode(); // start in view mode
    
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
          `Unicode Data: ${JSON.stringify(unicodeInformation[this.lastChar.codePointAt(0)], null, 2)}\n`
        );
      }
      
      this.debug.textContent = str;
      window.requestAnimationFrame(debug.bind(this));
    }
    
    window.requestAnimationFrame(debug.bind(this));
    
    this.leftSidebar.appendChild(this.modeButton);
    this.leftSidebar.appendChild(this.debug);
    
    this.centerContent.appendChild(this.textArea);
  }
  
  /**
   * mark text area
   * like highlighting characters based on their Unicode properties
   */
  markTextArea(text) {
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
}

export {
  UnicodeTextAnalyzerPage
};
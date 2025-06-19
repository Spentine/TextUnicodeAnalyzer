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
    this.textArea.contentEditable = true;
    this.textArea.textContent = (
      `Change the text here to analyze Unicode characters.\n` +
      `ABCDEFGHIJKLMNOPQRSTUVWXYZ\n\n` +
      `It contains support for characters above U+FFFF\n` + 
      `𰻞𰻞麺は好きですか`
    );
    this.markTextArea();
    this.textArea.addEventListener("focusout", () => {this.markTextArea()});
    
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
    
    // add left sidebar content
    this.debug = document.createElement("p");
    
    function debug() {
      const selection = window.getSelection();
      
      let str;
      
      if (selection.rangeCount === 0) {
        str = "No selection";
      } else {
        const range = selection.getRangeAt(0);
        str = (`[${range.startOffset}-${range.endOffset}) ` +
               `Selection: "${range.toString()}"\n`);
      }
      
      this.debug.textContent = str;
      window.requestAnimationFrame(debug.bind(this));
    }
    
    window.requestAnimationFrame(debug.bind(this));
    
    this.leftSidebar.appendChild(this.debug);
    
    this.centerContent.appendChild(this.textArea);
  }
  
  /**
   * mark text area
   * like highlighting characters based on their Unicode properties
   */
  markTextArea() {
    const makeUnicodeCharacterDiv = (char) => {
      if (char === "\n") {
        // create a text node for newlines
        return document.createTextNode("\n");
      }
      const div = document.createElement("div");
      div.textContent = char;
      div.className = "unicode-character";
      div.contentEditable = false; // make the divs non-editable
      
      const codePoint = char.codePointAt(0);
      console.log(char, codePoint);
      div.style.backgroundColor = `hsl(${(codePoint * 10) % 360}, 50%, 20%)`; // color based on char code
      
      return div;
    };
    
    const isSurrogatePair = (char) => {
      const code = char.charCodeAt(0);
      return (code >= 0xD800 && code <= 0xDBFF) || (code >= 0xDC00 && code <= 0xDFFF);
    };
    
    const children = this.textArea.childNodes;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      // check if it's a character or a div
      if (child.nodeType === Node.TEXT_NODE) {
        // insert divs around each character
        const text = child.textContent;
        const newDivs = [];
        for (let j = 0; j < text.length; j++) {
          let char = text[j];
          
          // handle surrogate pairs
          if (isSurrogatePair(char) && j < text.length - 1) {
            // combine surrogate pairs
            char += text[++j];
          }
          
          const div = makeUnicodeCharacterDiv(char);
          
          newDivs.push(div);
        }
        // replace the text node with the new divs
        newDivs.forEach(
          div => this.textArea.insertBefore(div, child)
        );
        this.textArea.removeChild(child);
      }
    }
  }
}

export {
  UnicodeTextAnalyzerPage
};
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
    this.textArea.textContent = "Change the text here to analyze Unicode characters. ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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
    const children = this.textArea.childNodes;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      // check if it's a character or a div
      if (child.nodeType === Node.TEXT_NODE) {
        // insert divs around each character
        const text = child.textContent;
        const newDivs = [];
        console.log(text);
        for (let j = 0; j < text.length; j++) {
          const div = document.createElement("div");
          div.textContent = text[j];
          div.className = "unicode-character";
          
          const charCode = text.charCodeAt(j);
          div.style.backgroundColor = `hsl(${(charCode * 10) % 360}, 50%, 20%)`; // color based on char code
          
          div.contentEditable = false; // make the divs non-editable
          
          newDivs.push(div);
        }
        // replace the text node with the new divs
        newDivs.forEach(
          div => this.textArea.insertBefore(div, child)
        );
        this.textArea.removeChild(child);
      }
      // check if it's a <br>
      else if (child.nodeName === "BR") {
        // replace <br> with a div
        const div = document.createElement("div");
        div.className = "unicode-character";
        div.textContent = "\n"; // keep the line break
        this.textArea.insertBefore(div, child);
        this.textArea.removeChild(child);
      }
    }
  }
}

export {
  UnicodeTextAnalyzerPage
};
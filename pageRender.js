class UnicodeTextAnalyzer {
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
        for (let j = 0; j < text.length; j++) {
          const div = document.createElement("div");
          div.textContent = text[j];
          div.className = "unicode-character";
          
          const charCode = text.charCodeAt(j);
          div.style.backgroundColor = `hsl(${(charCode * 10) % 360}, 50%, 50%)`; // color based on char code
          
          div.contentEditable = false; // make the divs non-editable
          
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
  UnicodeTextAnalyzer
};
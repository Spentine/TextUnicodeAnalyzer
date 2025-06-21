# Unicode Text Analyzer
*Unicode Text Analyzer* will analyze the Unicode of a given text the user inputs. The user may change the text at any time, and the project should support the changes. There will be information about the code points and diacritic characters that may appear in the text.

## Interface
The analyzer should have left and right bars and a header for interaction. There should be a decent level of modification and analyzation. The program should be able to:

- Retrieve information about a particular character or code point
- Perform basic useful operations such as counting the number of characters in a text or the frequency
- Provide values for both UTF-16 and UTF-8 as they are the main encoding standards on the internet.
- Highlight characters based off of criterion, such as their designated character block or whether they are miscellaneous.

There should also be slices of information that can be accessed by highlighting a particular part of the input text.

## Text File Locations

- `UnicodeData.txt`: https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt
- `Blocks.txt`: https://www.unicode.org/Public/UCD/latest/ucd/Blocks.txt
- `entities.json`: https://html.spec.whatwg.org/entities.json
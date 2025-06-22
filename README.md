# Text Unicode Analyzer

This web application allows for a simple analysis of some particular Unicode text. It allows for various character properties to be seen and highlights characters according to various rules. It can be used for:

- Identifying the characters used in some text if it's miscellaneous (Character View)
- Checking over a small piece of text for any lookalike characters (Highlighting Mode)
- As a character counter both for regular UTF-16 code points and individual characters

This program runs best in Firefox-based browsers due to the high amount of elements used to highlight the text.

## View Menu

By default, the menu is set to the view menu. There are various options to view and interact with the text. If there are too many characters, it can cause the browser to lag.

- **Currently Viewing**: This button can be pressed to switch to *Edit Mode*.
- **Highlighting Mode**: The highlighting mode determines the function used to highlight each character in the text. This can help with idenfiying a particular character in a large amount of text.
  - **Rainbow**: It will color in each character according to its color on a color wheel. Very near  codepoints will have a similar color, while far codepoints will likely have different colors. For most texts, it essentially generates a random color for each character.
  - **Category**: It will color in each character according to its category. The number of categories are correspondent to the number of categories Unicode provides. Categories can include whitespace, uppercase letters, lowercase letters, digits, punctuation, etc.
  - **Block**: It will color in each character according to its Unicode block. This is most useful when identifying the script used for a particular text. It can also be used to distinguish lookalikes because similar-looking characters are likely to be in different blocks.
  - **None**: No highlighting will be used. *The character selection is also disabled.* This is only done for performance reasons.
- **Font Size**: The font size used to display the characters.
- **Min Char Width**: The minimum character width. It is by default set to 0.5 because most characters have a width of 0.5 and it allows for diacritic characters to not have zero width and stack on top of each other.
- **Char Text Align**: The character text alignment. It determines the alignment of a character in its highlight. This can be used to position characters to look better, or also to make diacritics take up the space inside of the highlight rather than interfering with the character before.
- **Selection**: The type of selection used.
  - **Hover**: When a character is hovered over, the program will display the character information.
  - **Hover Until Click**: Has the same functionality as the *Hover* option, but when a character is clicked, its information will stay on the character view and the selection mode will change to *Do Not Change*.
  - **Do Not Change**: The selection will not change.
- **Deselect Character**: Deselects the character.

The number of UTF-16 code points and characters is also displayed for convenience.

## Edit Menu

The edit mode of the program. It removes the highlighting and allows for the user to interact with the text area.

- **Currently Editing**: This button can be pressed to switch to *View Mode*.
- **Font Size**: The font size used to display the characters.
- **Insert Character**: Inserts the character corresponding to the *hexadecimal* code point specified by the input to the right of it.

The number of UTF-16 code points is displayed.

## Character View

The *Character View* is displayed on the right sidebar. It contains information about the character that is being selected.

- **Character Display**: A large view of the character being selected. Allows for both closer inspection, and also as verification that the right character is being selected.
  - **Copy to Clipboard**: A button that allows for the current character to be copied to the clipboard.

### Character Information Table

> *Important Note: Please refer to the [UNICODE CHARACTER DATABASE Standard Annex #44](https://www.unicode.org/reports/tr44/) when looking into the actual information. The descriptions are provided by yours truly, and may be oversimplified.*

- Binary values are written with **Y** for yes, and **N** for no. **T** for true and **F** for false may also be used.
- The values for some properties are not displayed directly. A mapping from codes to human-readable descriptions are used for convience.
- A forwards slash (`/`) indicates that the value was not marked. Usually this means that there is a generic default value.
- CJK characters (Chinese Hanzi, Japanese Kanji, Korean Hanja) do not have as much information. This is because the Unicode-provided database does not include information about them. It is instead located in the *Unihan* database. However, the information contained is in a different format, and may not properly align to the values on the table, so I didn't bother to implement support for it.

| Property            | Description |
| ------------------- | ----------- |
| `codePoint`         | The character's code point written in Decimal (base-10).
| `hexCodePoint`      | The character's code point written in Hexadecimal (base-16).
| `blockName`         | The name of the block (i.e., section) the character is in.
| `htmlEntity`        | The corresponding HTML entity of the character. Contains both a named entity (if applicable) and a numeric character reference.
| `name`              | The name of the character.
| `category`          | The type of character.
| `combiningClass`    | How the character combines with other characters, such as its positioning.
| `bidiClass`         | Bidirectional class. Decides the direction the character should be written in (ex. left-to-right, right-to-left)
| `decomposition`     | Uused when a specific character can be represented as a combination of other characters.
| `decimalDigitValue` | The value of a character that is written as a decimal digit.
| `digitValue`        | The value of the number as a digit.
| `numericValue`      | The numerical value of the symbol. Can be used for other number systems.
| `mirrored`          | Whether the character should be mirrored in bidirectional text, i.e., mirrored when the text is written in a different direction.
| `unicode1Name`      | The name given to the character from Unicode version 1.
| `isoComment`        | A comment from the ISO.
| `uppercaseMapping`  | The character as if it were uppercase.
| `lowercaseMapping`  | The character as if it were lowercase.
| `titlecaseMapping`  | The character as if it were title case.

## Links and Sources

I used quite a bit of resources and online databases to create this project and to make it as information-packed as it is. The files used will be listed below in case there is a future version of the information (please make a pull request if that happens) or if you are looking to use the information for your own projects.

- [Standard Annex #44](https://www.unicode.org/reports/tr44/): Documentation about `UnicodeData.txt`. It's quite important to read if you want to make anything with the file.
- [`UnicodeData.txt`](https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt): The main source of Unicode data.
- [`Blocks.txt`](https://www.unicode.org/Public/UCD/latest/ucd/Blocks.txt): The Unicode blocks allocated to character ranges.
- [`entities.json`](https://html.spec.whatwg.org/entities.json):An official list of all the HTML entities as per specification.
# Devlog

I have wanted a Unicode analyzer for a while. Ever since I was young, I would browse Unicode charts and admire the scripts it has. It also had a lot of interesting quirks, like how diacritics could be spammed onto characters or how some text supports different presentation formats. The Unicode analyzers online were subpar, as they certainly didn't provide much capability or information. Thus, I created this project to finally have some sort of web application to view it.

## Highlighting Text While Typed

My first idea was to have characters be highlighted based off of some criterion while being typed. I couldn't use a `flexbox`, as it does not support that. I decided to use a regular `div` element and allow the user to edit its contents. From there, I could work on the highlighting as if it was a regular program.

There were, of course, some issues that arose because of this. For one, HTML content could be pasted, which isn't necessarily good for something that should only hold text. I decided to use a custom pasting function that stopped the original paste action and instead inserted the characters from the clipboard. It worked well enough.

The highlighting was a bit more difficult to make. I used `span` tags so that each individual character could be highlighted. However, because the parent `div` element allowed for the user to edit its contents, it was possible to edit the information inside a `span` tag, which made the highlighting erroneously extend. I tried make the `span` elements not be content editable, which sort of worked, except for a few weird parts. For one, it a character was after a newline, it is impossible to move the cursor in between them. If the cursor is placed at the very end of a text, it will appear as if it's taking up the entire left side. The issues were even worse on Firefox, as it would place the cursor inside of the uneditable `span` elements, preventing from any text editing at all except near newlines.

So, I had to backtrack a bit. instead of live highlighting, I used two different modes; one to view with highlighting, and one to edit. It's a step down, but it's the best I can do.

## Retrieving Unicode Information

To get the Unicode information, I had to read quite a bit. I found where the main Unicode data file was hosted, but it was in an arbitrary format. I then made a quick parser for it, but the data is completely unreadable to an unspecialized human, so I wrote some mappings to convert codes into actual understandable phrases.

Turns out, there is a separate database for hanzi or kanji characters. That means, any hanzi that was selected would not have any information about it.

There is also a separate text file to store the Unicode blocks, which isn't as hard to understand. It was self-explanatory when I saw the file.
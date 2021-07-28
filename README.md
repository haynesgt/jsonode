# Jsonode

```
Usage:
  jsonode [(-r|--require) module] [--raw-in] [--raw-out] [-u|--ugly] [-i|--indent=2] ((-f|--file) <file.js> | <code>)
  jsonode <code> < <json file>
  jsonode --file <file.js> < <json file>

Runs the code as javascript, where `$` contains input parsed as json.
The output is converted to json by default.
If the output is a function, it is called with the input as the argument.
If the output is a promise, it is awaited. 

Options:
  --ugly	suppress indented output
  --raw-in	make `$` equal the input as a string rather than json
  --raw-out	print the output as a string rather than json
  --require	include a module and make it available by its name, with dashes converted to underscores (option is repeatable)
```

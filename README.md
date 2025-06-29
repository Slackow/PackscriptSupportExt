# PackScript Support

Highlight `.dps`, `.fps`, and `.rps` files with the PackScript language, an extension of Python designed to generate `.mcfunction` and `.json` files for Minecraft Datapacks.

[PackScript Repo](https://github.com/Slackow/PackScript)

## Auto Compile

If a `.packscript-ext.json` file is present at the workspace root with an `output` field,
the extension will run `packscript c` each time a file in the workspace is saved. The
command uses the workspace root as the input directory and the `output` value as the
destination. Example configuration:

```json
{
  "output": "build"
}
```

This results in the following command on save:

```
packscript c -i <workspace root> -o build
```

Any errors printed to standard error during compilation appear in the Problems view.


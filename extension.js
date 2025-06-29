const vscode = require('vscode');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

function activate(context) {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        return;
    }
    const rootPath = folders[0].uri.fsPath;
    const configPath = path.join(rootPath, '.packscript-ext.json');
    let outputDir;
    try {
        const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        outputDir = cfg.output;
    } catch (e) {
        console.error(`Failed to read ${configPath}:`, e);
        return;
    }
    if (!outputDir) {
        console.error('No "output" key found in .packscript-ext.json');
        return;
    }
    const outputChannel = vscode.window.createOutputChannel('PackScript');
    const diagnostics = vscode.languages.createDiagnosticCollection('packscript');

    function compile() {
        const cmd = `packscript c -i "${rootPath}" -o "${outputDir}"`;
        outputChannel.appendLine(`Running: ${cmd}`);
        cp.exec(cmd, { cwd: rootPath }, (err, stdout, stderr) => {
            if (stdout) {
                outputChannel.append(stdout);
            }
            if (stderr || err) {
                const message = stderr?.trim() || err?.message || 'Unknown error';
                outputChannel.append(stderr || '');
                const uri = vscode.Uri.file(rootPath);
                const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 1));
                const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
                diagnostics.set(uri, [diagnostic]);
            } else {
                diagnostics.clear();
            }
        });
    }

    const disposable = vscode.workspace.onDidSaveTextDocument(doc => {
        if (doc.uri.fsPath.startsWith(rootPath)) {
            compile();
        }
    });

    context.subscriptions.push(disposable, outputChannel, diagnostics);
}

function deactivate() {}

module.exports = { activate, deactivate };

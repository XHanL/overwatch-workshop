const vscode = acquireVsCodeApi()

function navigate(path) {
    vscode.postMessage(path)
}
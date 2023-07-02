const vscode = require('vscode')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

//32位密钥
const encryptionKey = 'overwatchworkshoplanguagesupport'

function generateError(name, summary, stack, detail) {
    vscode.window.showErrorMessage(summary, `创建报告`, `复制报告`).then((button) => {
        //制作文本
        let content = `[使用须知]:

    1. 请先导入游戏内工坊确保语法正确性。仅在插件本身错误的情况下向开发人员发送该报告。
    2. 为了定位具体问题，该报告包含了重要信息。例如源码片段。
    3. 为了保证数据安全性，敏感数据已加密。请勿改动该报告的任何部分。
    4. 该报告仅用于修复问题。开发人员不泄露，不保存，不利用其中的任何部分。

[错误原因]:

    ${summary}

[错误堆栈]:
`
        for (i in stack) {
            content += `
    ${stack[i]}`
        }

        content += `

`

        for (i in detail) {
            content += `[${i}]:

    ${encryptString(detail[i])}

`
        }
        //注册按钮
        if (button === '创建报告') {
            const document = vscode.window.activeTextEditor.document
            const workspacePath = vscode.workspace.getWorkspaceFolder(document.uri).uri.fsPath
            const filePath = path.join(workspacePath, name)
            fs.writeFile(filePath, content, (err) => {
                if (err) {
                    vscode.window.showErrorMessage('无法创建报告, 已复制到剪切板。')
                    vscode.env.clipboard.writeText(content)
                } else {
                    vscode.workspace.openTextDocument(filePath).then((doc) => {
                        vscode.window.showTextDocument(doc)
                    })
                }
            })  
        } else if (button === '复制报告') {
            vscode.env.clipboard.writeText(content)
        }
    })
}

function encryptString(str) {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv)
    let encrypted = cipher.update(str, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const tag = cipher.getAuthTag()
    return iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex')
}

function decryptString(data) {
    const parts = data.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = Buffer.from(parts[1], 'hex')
    const tag = Buffer.from(parts[2], 'hex')
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv)
    decipher.setAuthTag(tag)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}

module.exports = {
    generateError
}
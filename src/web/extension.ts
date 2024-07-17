// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const languageCodes = new Map<string, string>([
    [ "Arabic", "ar" ],     [ "Chinese", "zh" ],    [ "Chinese (Traditional)", "zt" ],
    [ "Czech", "cs" ],      [ "Danish", "da" ],     [ "Dutch", "nl" ],
    [ "English", "en" ],    [ "Finnish", "fi" ],    [ "French", "fr" ],
    [ "German", "de" ],     [ "Greek", "el" ],      [ "Hebrew", "he" ],
    [ "Hindi", "hi" ],      [ "Hungarian", "hu" ],  [ "Indonesian", "id" ],
    [ "Irish", "ga" ],      [ "Italian", "it" ],    [ "Japanese", "ja" ],
    [ "Korean", "ko" ],     [ "Persian", "fa" ],    [ "Polish", "pl" ],
    [ "Portuguese", "pt" ], [ "Russian", "ru" ],    [ "Slovak", "sk" ],
    [ "Spanish", "es" ],    [ "Swedish", "sv" ],    [ "Turkish", "tr" ],
    [ "Ukranian", "uk" ],   [ "Vietnamese", "vi" ],
]);

async function translate(text: string, to: string): Promise<string>
{
    const res = await fetch("http://127.0.0.1:5000/translate", {
        method : "POST",
        body : JSON.stringify({q : text, source : "auto", target : to, format : "text", alternatives : 0, api_key : ""}),
        headers : {"Content-Type" : "application/json"}
    });

    type LibreTranslateResponse = {alternatives : string[], detectedLanguage : string, translatedText : string};
    const response = await res.json() as LibreTranslateResponse;
    console.log(response);
    return response.translatedText;
}

export function activate(context: vscode.ExtensionContext)
{
    const replaceWithTranslation = vscode.commands.registerCommand('libretranslate-integration.replaceWithTranslation', () => {
        const editor = vscode.window.activeTextEditor;
        const selection = editor?.selection;

        if (selection && !selection.isEmpty)
        {
            const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
            const highlighted = editor.document.getText(selectionRange);

            vscode.window
                .showQuickPick(
                    Array.from(languageCodes.keys()),
                    )
                .then(languageChoice => {
                    if (languageChoice)
                    {
                        const code = languageCodes.get(languageChoice);
                        if (code)
                        {
                            translate(highlighted, code).then(data => {editor.edit(editBuilder => { editBuilder.replace(selectionRange, data); })});
                        }
                    }
                });
        }
    });

    const insertTranslationBelow = vscode.commands.registerCommand('libretranslate-integration.insertTranslationBelow', () => {
        const editor = vscode.window.activeTextEditor;
        const selection = editor?.selection;

        if (selection && !selection.isEmpty)
        {
            const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
            const highlighted = editor.document.getText(selectionRange);

            vscode.window
                .showQuickPick(
                    Array.from(languageCodes.keys()),
                    )
                .then(languageChoice => {
                    if (languageChoice)
                    {
                        const code = languageCodes.get(languageChoice);
                        if (code)
                        {
                            translate(highlighted, code).then(data => {editor.edit(editBuilder => { editBuilder.insert(selection.end, "\n" + data); })});
                        }
                    }
                });
        }
    });

    context.subscriptions.push(replaceWithTranslation);
    context.subscriptions.push(insertTranslationBelow);
}

// This method is called when your extension is deactivated
export function deactivate()
{
}

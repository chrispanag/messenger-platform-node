const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');

function attachmentUploadFactory(FB_PAGE_TOKEN) {
    return (filename, is_reusable = true, type = "image") => {
        const fileStream = fs.createReadStream(filename);
        fileStream.on('error', err => {
            throw new Error(`[Error] Error reading file Attachment Upload: ${err}`);
        });
        const config = {
            attachment: {
                type,
                payload: {
                    is_reusable
                }
            }
        }
        const form = new FormData();
        form.append('message', JSON.stringify(config));
        form.append('filedata', fileStream);
        return fetch(`https://graph.facebook.com/v2.11/me/message_attachments?access_token=${FB_PAGE_TOKEN}`, {
            method: 'POST',
            body: form
        })
            .then(res => res.json())
            .catch(err => {
                console.log('[Error] Uploading Attachment');
                console.log(err);
            });
    }

}

module.exports = {
    attachmentUploadFactory
}

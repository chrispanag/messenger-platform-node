const fetch = require('node-fetch');

const baseOptions = {
    method: 'POST',
    headers: {
        "Content-Type": 'application/json'
    }
}

function validateJson(json) {
    if (json.error && json.error.message) 
        throw new Error(json.error.message);
    return json;
}

function estimateBroadcast(qs, labelId) {
    const options = Object.assign({}, baseOptions);
    if(label) options.body = JSON.stringify({
        custom_label_id: labelId
    })
    return fetch(`https://graph.facebook.com/v2.11/me/broadcast_reach_estimations?${qs}}`, options)
    .then(rsp => rsp.json())
    .then(json => {
        validateJson(json);
        const { reach_estimation_id } = json;
        return fetch(`https://graph.facebook.com/v2.11/${reach_estimation_id}?${qs}`, baseOptions)
    })
    .then(rsp => rsp.json())
    .then(json => validateJson(json))
}

function createLabel(qs, name) {
    const options = Object.assign({}, baseOptions, {
        body: JSON.stringify({ name })
    });
    return fetch(`https://graph.facebook.com/v2.11/me/custom_labels?${qs}`, options)
    .then(rsp => rsp.json())
    .then(json => validateJson(json));
}

function associateToLabel(qs, PSID, labelId) {
    const options = Object.assign({}, baseOptions, {
        body: JSON.stringify({
            user: PSID
        })
    });
    return fetch(`https://graph.facebook.com/v2.11/${labelId}/label?${qs}`, options)
    .then(rsp => rsp.json())
    .then(json => validateJson(json));
}

function removeLabel(qs, PSID, labelId) {
    const options = Object.assign({}, baseOptions, {
        method: 'DELETE',
        body: JSON.stringify({
            user: PSID,
        })
    });
    return fetch(`https://graph.facebook.com/v2.11/${labelId}/label?${qs}`, options)
    .then(rsp => rsp.json())
    .then(json => validateJson(json)); 
}

function getUserLabels(qs, id) {
    return fetch(`https://graph.facebook.com/v2.11/${id}/custom_labels?${qs}`, {
        method: 'GET'
    })
    .then(rsp => rsp.json())
    .then(json => validateJson(json)); 
}

function getAllLabels(qs) {
    return fetch(`https://graph.facebook.com/v2.11/me/custom_labels?fields=name&${qs}`, {
        method: 'GET'
    })
    .then(rsp => rsp.json())
    .then(json => validateJson(json)); 
}

function createMessage(qs, message) {
    const options = Object.assign({}, baseOptions, {
        body: JSON.stringify({
            messages: [
                message
            ]
        })
    });
    return fetch(`https://graph.facebook.com/v2.11/me/message_creatives?${qs}`, options)
    .then(rsp => rsp.json())
    .then(json => validateJson(json));
}

function sendMessage(qs, message, label) {
    const options = Object.assign({}, baseOptions);
    if(label) options.body = JSON.stringify({
        custom_label_id: labelId
    });
    return fetch(`https://graph.facebook.com/v2.11/me/broadcast_messages?${qs}`, options)
    .then(rsp => rsp.json())
    .then(json => validateJson(json)); 
}

module.exports = {
    estimateBroadcast,
    createLabel,
    associateToLabel,
    removeLabel,
    getUserLabels,
    getAllLabels,
    createMessage,
    sendMessage
}
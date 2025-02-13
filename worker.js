const TELEGRAM_TOKEN = '7544054473:AAH38dih8OM-ii2_rSp-wJq5rjo2G0upE10';
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const WEBHOOK_PATH = '/endpoint';

async function registerWebhook(webhookUrl) {
    const response = await fetch(`${BASE_URL}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
    });
    return response;
}

async function unRegisterWebhook() {
    const response = await fetch(`${BASE_URL}/deleteWebhook`, {
        method: 'POST'
    });
    return response;
}

async function handleRequest(request) {
    const url = new URL(request.url);
    
    if (request.method === 'GET') {
        if (url.pathname === '/register') {
            const webhookUrl = `${url.origin}${WEBHOOK_PATH}`;
            await registerWebhook(webhookUrl);
            return new Response(`Webhook registered at: ${webhookUrl}`);
        }
        
        if (url.pathname === '/unregister') {
            await unRegisterWebhook();
            return new Response('Webhook unregistered');
        }
        
        return new Response('Send GET to /register or /unregister to manage webhook');
    }

    if (request.method === 'POST' && url.pathname === WEBHOOK_PATH) {
        const update = await request.json();
        return handleUpdate(update);
    }

    return new Response('Not Found', { status: 404 });
}

// Rest of your existing handlers remain the same
async function handleUpdate(update) {
    if (update.callback_query) {
        const data = update.callback_query.data;
        const chatId = update.callback_query.message.chat.id;
        const messageId = update.callback_query.message.message_id;
        
        if (data === '/Commands') {
            await deleteMessage(chatId, messageId);
            await sendCommandsMenu(chatId);
        }
        return new Response('OK');
    }

    if (update.message) {
        const text = update.message.text;
        const chatId = update.message.chat.id;
        const user = update.message.from;

        if (text === '/start') {
            await sendWelcomeMessage(chatId, user);
        }
        else if (text === '/Commands') {
            await deleteMessage(chatId, update.message.message_id);
            await sendCommandsMenu(chatId);
        }
        else if (text === '/about') {
            await sendAboutMessage(chatId, user);
        }
        return new Response('OK');
    }

    return new Response('OK');
}

async function sendWelcomeMessage(chatId, user) {
    const videoUrl = "https://t.me/kajal_developer/57";
    const buttons = [
        [{ text: "Commands", callback_data: "/Commands" }],
        [{ text: "DEV", url: "https://t.me/Teleservices_Api" }]
    ];

    const caption = `<b>👋 Welcome Back ${user.first_name}</b>\n\n🌥️ Bot Status: Alive 🟢\n\n💞 Dev: @LakshayDied`;

    await fetch(`${BASE_URL}/sendVideo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            video: videoUrl,
            caption: caption,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: buttons }
        })
    });
}

async function sendCommandsMenu(chatId) {
    const videoUrl = "https://t.me/kajal_developer/57"; 
    const buttons = [
        [
            { text: "Gateways", callback_data: "/black" },
            { text: "Tools", callback_data: "/tools" }
        ],
        [
            { text: "Channel", url: "https://t.me/Teleservices_Api" },
            { text: "DEV", url: "https://t.me/Teleservices_Bots" }
        ],
        [
            { text: "◀️ Go Back", callback_data: "/black" }
        ]
    ];

    const caption = `<b>[𖤐] XS developer :</b>\n\n<b>[ϟ] Current Gateways And Tools :</b>\n\n<b>[ᛟ] Charge - 0</b>\n<b>[ᛟ] Auth - 0</b>\n<b>[ᛟ] Tools - 2</b>`;

    await fetch(`${BASE_URL}/sendVideo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            video: videoUrl,
            caption: caption,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: buttons }
        })
    });
}

async function sendAboutMessage(chatId, user) {
    const aboutMessage = `
<b><blockquote>⍟───[ MY ᴅᴇᴛᴀɪʟꜱ ]───⍟</blockquote>

‣ ᴍʏ ɴᴀᴍᴇ : <a href="https://t.me/${user.username}">${user.first_name}</a>
‣ ᴍʏ ʙᴇsᴛ ғʀɪᴇɴᴅ : <a href='tg://settings'>ᴛʜɪs ᴘᴇʀsᴏɴ</a> 
‣ ᴅᴇᴠᴇʟᴏᴘᴇʀ : <a href='https://t.me/kingvj01'>ᴛᴇᴄʜ ᴠᴊ</a> 
‣ ʟɪʙʀᴀʀʏ : <a href=''></a> 
‣ ʟᴀɴɢᴜᴀɢᴇ : <a href=''></a> 
‣ ᴅᴀᴛᴀ ʙᴀsᴇ : <a href=''></a> 
‣ ʙᴏᴛ sᴇʀᴠᴇʀ : <a href=''></a> 
‣ ʙᴜɪʟᴅ sᴛᴀᴛᴜs : ᴠ [sᴛᴀʙʟᴇ]</b>
    `;

    await fetch(`${BASE_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: aboutMessage,
            parse_mode: 'HTML'
        })
    });
}

async function deleteMessage(chatId, messageId) {
    await fetch(`${BASE_URL}/deleteMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId
        })
    });
}

export default {
    async fetch(request) {
        return handleRequest(request);
    }
};

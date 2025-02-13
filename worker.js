const TOKEN = '7695029405:AAFRN2U5NRGYS-ZjpRc54xTxQdOSc0EeYtE';
const WEBHOOK = '/endpoint';
const SECRET = 'ENV_BOT_SECRE';

addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (url.pathname === WEBHOOK) {
    event.respondWith(handleWebhook(event))
  } else if (url.pathname === '/registerWebhook') {
    event.respondWith(registerWebhook(event, url, WEBHOOK, SECRET))
  } else if (url.pathname === '/unRegisterWebhook') {
    event.respondWith(unRegisterWebhook(event))
  } else {
    event.respondWith(new Response('No handler for this request'))
  }
})

async function handleWebhook (event) {
  if (event.request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== SECRET) {
    return new Response('Unauthorized', { status: 403 })
  }

  
  const update = await event.request.json()
  event.waitUntil(onUpdate(update))

  return new Response('Ok')
}


async function onUpdate (update) {
  if ('message' in update) {
    await onMessage(update.message)
  }
}


function onMessage (message) {
  return sendPlainText(message.chat.id, 'Echo:\n' + message.text)
}


async function sendPlainText (chatId, text) {
  return (await fetch(apiUrl('sendMessage', {
    chat_id: chatId,
    text
  }))).json()
}


async function registerWebhook (event, requestUrl, suffix, secret) {

  const webhookUrl = `${requestUrl.protocol}//${requestUrl.hostname}${suffix}`
  const r = await (await fetch(apiUrl('setWebhook', { url: webhookUrl, secret_token: secret }))).json()
  return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}


async function unRegisterWebhook (event) {
  const r = await (await fetch(apiUrl('setWebhook', { url: '' }))).json()
  return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}


function apiUrl (methodName, params = null) {
  let query = ''
  if (params) {
    query = '?' + new URLSearchParams(params).toString()
  }
  return `https://api.telegram.org/bot${TOKEN}/${methodName}${query}`
}

// ... (keep previous constants and event listener code)

async function onMessage(message) {
  if (message.text?.startsWith('/start')) {
    return sendWelcomeMessage(message.chat.id);
  } else if (message.text?.startsWith('/help')) {
    return sendHelpMessage(message.chat.id);
  } else if (message.text?.startsWith('/video')) {
    return sendVideoResponse(message.chat.id);
  }
  return sendPlainText(message.chat.id, 'Echo:\n' + message.text);
}

async function sendWelcomeMessage(chatId) {
  const welcomeText = `👋 Welcome Back\n\n🌥️ Bot Status : Alive 🟢\n\n💞 Dev : @LakshayDied`;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: 'Help', url: 'https://t.me/YourHelpBot' },
        { text: 'Channel', url: 'https://t.me/YourChannel' }
      ]
    ]
  };

  return sendMessageWithKeyboard(chatId, welcomeText, keyboard);
}

async function sendHelpMessage(chatId) {
  const helpText = "🆘 Help Section:\n\n/start - Start the bot\n/help - Show this help\n/video - Get a video";
  return sendPlainText(chatId, helpText);
}

async function sendVideoResponse(chatId) {
  const videoUrl = 'https://example.com/your-video.mp4'; // Replace with actual video URL
  return sendVideo(chatId, videoUrl);
}

async function sendMessageWithKeyboard(chatId, text, keyboard) {
  return (await fetch(apiUrl('sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: JSON.stringify(keyboard)
  }))).json();
}

async function sendVideo(chatId, video) {
  return (await fetch(apiUrl('sendVideo', {
    chat_id: chatId,
    video
  }))).json();
}

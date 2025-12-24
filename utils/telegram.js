// backend/utils/telegram.js
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'sizning_bot_tokeningiz';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'sizning_chat_id';

async function sendTelegramNotification(submission, user) {
    try {
        const message = `
🎯 <b>Yangi vazifa yuborildi!</b>

👤 <b>Talaba:</b> ${user.name} ${user.surname || ''}
📧 <b>Login:</b> ${user.login}
📝 <b>Tavsif:</b> ${submission.description || 'Yo\'q'}
🔗 <b>Havola:</b> ${submission.HwLink}
📅 <b>Sana:</b> ${submission.date}
📊 <b>Status:</b> ${submission.status}
        `.trim();

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });

        console.log('✅ Telegram xabar yuborildi');
        return true;
    } catch (error) {
        console.error('❌ Telegram xabar yuborishda xatolik:', error.message);
        return false;
    }
}

module.exports = { sendTelegramNotification };
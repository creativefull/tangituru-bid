const TelegramBot = require('node-telegram-bot-api');
const token = '362492499:AAHhsuMvtSKTi4jaHKwBfzKgyNYMho5Ss60';
const bot = new TelegramBot(token, {polling : true})
let chatId = 304746725

bot.on('message', (msg) => {
    // bot.sendPhoto(chatId, "https://telegram.org/img/t_logo.png");
})
bot.on('inline_query', (msg) => {
    // console.log("ada query", msg);
})

console.log("Bot berjalan");

exports.sendMessage = async (text) => {
	bot.sendMessage(chatId, text)
}
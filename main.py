from telegram import Update, Poll
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext
from payment import generate_payment_link
from utils import get_quote, get_tip, is_pro_user, upgrade_user

BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'

def start(update: Update, context: CallbackContext):
    update.message.reply_text("👋 Welcome! Use /poll to create a poll or /pro to become a professional developer.")

def auto_react(update: Update, context: CallbackContext):
    update.message.reply_text("🔥")

def create_poll(update: Update, context: CallbackContext):
    update.message.reply_poll(
        question="What's your favorite programming language?",
        options=["Python", "JavaScript", "C++", "Other"],
        is_anonymous=True,
        allows_multiple_answers=False
    )

def send_tip(update: Update, context: CallbackContext):
    tip = get_tip()
    update.message.reply_text(f"💡 Tip: {tip}")

def send_quote(update: Update, context: CallbackContext):
    quote = get_quote()
    update.message.reply_text(f"💬 Quote: {quote}")

def pro_access(update: Update, context: CallbackContext):
    user_id = update.effective_user.id
    if is_pro_user(user_id):
        update.message.reply_text("✅ You are already a Pro user!")
    else:
        link = generate_payment_link(user_id)
        update.message.reply_text(f"💸 Pay with Litecoin to become a Pro user: {link}")

def main():
    updater = Updater(BOT_TOKEN)
    dp = updater.dispatcher

    dp.add_handler(CommandHandler("start", start))
    dp.add_handler(CommandHandler("poll", create_poll))
    dp.add_handler(CommandHandler("tips", send_tip))
    dp.add_handler(CommandHandler("quote", send_quote))
    dp.add_handler(CommandHandler("pro", pro_access))
    dp.add_handler(MessageHandler(Filters.text & ~Filters.command, auto_react))

    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
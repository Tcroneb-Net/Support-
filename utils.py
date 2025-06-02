import random

TIPS = [
    "Write clean, readable code.",
    "Always comment complex logic.",
    "Use version control systems like Git.",
    "Test your code thoroughly.",
    "Practice regularly with coding problems."
]

QUOTES = [
    "Code is like humor. When you have to explain it, it’s bad. – Cory House",
    "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. – Martin Fowler",
    "Experience is the name everyone gives to their mistakes. – Oscar Wilde",
    "In order to be irreplaceable, one must always be different. – Coco Chanel"
]

PRO_USERS = set()

def get_tip():
    return random.choice(TIPS)

def get_quote():
    return random.choice(QUOTES)

def is_pro_user(user_id):
    return user_id in PRO_USERS

def upgrade_user(user_id):
    PRO_USERS.add(user_id)
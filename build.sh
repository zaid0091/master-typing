#!/usr/bin/env bash
set -o errexit

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files (includes frontend dist via STATICFILES_DIRS)
python manage.py collectstatic --noinput

# Seed shop items
python manage.py shell -c "
from shop.models import ShopItem
items = [
    {'item_id':'theme-nord','name':'Nordic Chill','category':'theme','price':300,'description':'Frost-blue palette'},
    {'item_id':'theme-sunset','name':'Desert Sunset','category':'theme','price':300,'description':'Warm gradient tones'},
    {'item_id':'aura-gold','name':'Gold Aura','category':'aura','price':500,'description':'Golden glow effect'},
    {'item_id':'pet-owl','name':'Wise Owl','category':'pet','price':400,'description':'A scholarly companion'},
    {'item_id':'pet-dragon','name':'Fire Drake','category':'pet','price':600,'description':'Breathes motivation'},
]
for item in items:
    ShopItem.objects.get_or_create(item_id=item['item_id'], defaults=item)
print('Shop items seeded.')
"

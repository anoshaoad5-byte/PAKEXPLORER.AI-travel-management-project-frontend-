"""
Run this once to populate the hotels table with sample data.
Place this file in your backend/ folder (same level as app.py) and run:
    python seed_hotels.py
"""

from app import app
from database import db
from models.hotel import Hotel

hotels_data = [
    # Punjab
    {
        "name": "Pearl Continental Lahore",
        "location": "Lahore, Punjab",
        "address": "Shahrah-e-Quaid-e-Azam, Lahore",
        "description": "A landmark 5-star hotel in the heart of Lahore, known for its grand architecture and hospitality.",
        "price_per_night": 35000,
        "rating": 4.6,
        "image_url": "https://picsum.photos/seed/pclahore/400/250",
        "amenities": "WiFi,Pool,Spa,Gym,Restaurant,Parking",
        "rooms_available": 12,
        "contact_number": "+92-42-111-505-505"
    },
    {
        "name": "Avari Lahore",
        "location": "Lahore, Punjab",
        "address": "87 Shahrah-e-Quaid-e-Azam, Lahore",
        "description": "A well-established 4-star hotel offering comfort and central access to Lahore's business district.",
        "price_per_night": 22000,
        "rating": 4.2,
        "image_url": "https://picsum.photos/seed/avarilahore/400/250",
        "amenities": "WiFi,Restaurant,Gym,Parking",
        "rooms_available": 18,
        "contact_number": "+92-42-111-282-747"
    },

    # Sindh
    {
        "name": "Pearl Continental Karachi",
        "location": "Karachi, Sindh",
        "address": "Club Road, Karachi",
        "description": "One of Karachi's most prestigious 5-star hotels, popular with business and leisure travelers alike.",
        "price_per_night": 38000,
        "rating": 4.5,
        "image_url": "https://picsum.photos/seed/pckarachi/400/250",
        "amenities": "WiFi,Pool,Spa,Gym,Restaurant,Business Center",
        "rooms_available": 15,
        "contact_number": "+92-21-111-505-505"
    },
    {
        "name": "Avari Towers Karachi",
        "location": "Karachi, Sindh",
        "address": "Fatima Jinnah Road, Karachi",
        "description": "A comfortable 4-star hotel located near Karachi's key commercial and shopping areas.",
        "price_per_night": 20000,
        "rating": 4.1,
        "image_url": "https://picsum.photos/seed/avarikarachi/400/250",
        "amenities": "WiFi,Restaurant,Gym,Parking",
        "rooms_available": 20,
        "contact_number": "+92-21-111-282-747"
    },

    # Khyber Pakhtunkhwa
    {
        "name": "Pearl Continental Peshawar",
        "location": "Peshawar, Khyber Pakhtunkhwa",
        "address": "University Road, Peshawar",
        "description": "A premier 5-star hotel set amid lush gardens, offering a peaceful stay near Peshawar's university area.",
        "price_per_night": 28000,
        "rating": 4.4,
        "image_url": "https://picsum.photos/seed/pcpeshawar/400/250",
        "amenities": "WiFi,Pool,Gym,Restaurant,Garden",
        "rooms_available": 10,
        "contact_number": "+92-91-111-505-505"
    },
    {
        "name": "Shelton's Rezidor Peshawar",
        "location": "Peshawar, Khyber Pakhtunkhwa",
        "address": "Saddar Road, Peshawar",
        "description": "A reliable 4-star option in central Peshawar, close to markets and historic sites.",
        "price_per_night": 15000,
        "rating": 3.9,
        "image_url": "https://picsum.photos/seed/sheltonpeshawar/400/250",
        "amenities": "WiFi,Restaurant,Parking",
        "rooms_available": 14,
        "contact_number": "+92-91-111-000-111"
    },

    # Balochistan
    {
        "name": "Serena Hotel Quetta",
        "location": "Quetta, Balochistan",
        "address": "Shahrah-e-Zarghoon, Quetta",
        "description": "A refined 5-star hotel offering traditional Baloch hospitality with modern comfort in Quetta.",
        "price_per_night": 26000,
        "rating": 4.5,
        "image_url": "https://picsum.photos/seed/serenaquetta/400/250",
        "amenities": "WiFi,Restaurant,Gym,Garden,Room Service",
        "rooms_available": 9,
        "contact_number": "+92-81-111-737-266"
    },
    {
        "name": "Bloom Star Hotel Quetta",
        "location": "Quetta, Balochistan",
        "address": "Jinnah Road, Quetta",
        "description": "A comfortable 4-star hotel in central Quetta, convenient for city exploration.",
        "price_per_night": 14000,
        "rating": 3.8,
        "image_url": "https://picsum.photos/seed/bloomquetta/400/250",
        "amenities": "WiFi,Restaurant,Parking",
        "rooms_available": 16,
        "contact_number": "+92-81-2820000"
    },

    # Gilgit-Baltistan
    {
        "name": "Serena Hunza",
        "location": "Hunza, Gilgit-Baltistan",
        "address": "Karimabad, Hunza Valley",
        "description": "A stunning 5-star retreat with panoramic views of the Hunza Valley's peaks, blending luxury with nature.",
        "price_per_night": 32000,
        "rating": 4.7,
        "image_url": "https://picsum.photos/seed/serenahunza/400/250",
        "amenities": "WiFi,Restaurant,Mountain View,Garden,Room Service",
        "rooms_available": 8,
        "contact_number": "+92-5813-457-651"
    },
    {
        "name": "Hunza Embassy Hotel",
        "location": "Hunza, Gilgit-Baltistan",
        "address": "Aliabad, Hunza Valley",
        "description": "A cozy 4-star hotel offering valley views and warm hospitality, popular among trekkers and tourists.",
        "price_per_night": 12000,
        "rating": 4.0,
        "image_url": "https://picsum.photos/seed/hunzaembassy/400/250",
        "amenities": "WiFi,Restaurant,Mountain View,Parking",
        "rooms_available": 11,
        "contact_number": "+92-5813-455-020"
    },
]

with app.app_context():
    added = 0
    for data in hotels_data:
        exists = Hotel.query.filter_by(name=data["name"]).first()
        if not exists:
            hotel = Hotel(**data)
            db.session.add(hotel)
            added += 1
    db.session.commit()
    print(f"Seeded {added} new hotels (skipped duplicates).")
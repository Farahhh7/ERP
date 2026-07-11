from pymongo import MongoClient
from datetime import datetime, timedelta
import random

# URI el sa7i7 directly
client = MongoClient('mongodb+srv://erp1_db_user:Icecream007@cluster0.tsjflia.mongodb.net/?appName=Cluster0')
db = client['test']

print('Collections:', db.list_collection_names())

# Jib el premier produit
product = db['products'].find_one()
if not product:
    print('Ma3andekch produits!')
    exit()

user = db['users'].find_one()
print(f"Produit: {product['nom']} ({product['_id']})")

# Na7i el mouvements el 9dim
db['stockmovements'].delete_many({'product': product['_id']})

# Zid 30 sorties b dates mokhtalfa
movements = []
base_qty = 15

for i in range(30):
    date = datetime.now() - timedelta(days=90) + timedelta(days=i*3)
    variation = random.randint(-5, 8)
    qty = max(1, base_qty + variation + int(i * 0.3))
    movements.append({
        'product': product['_id'],
        'type': 'sortie',
        'quantite': qty,
        'operateur': user['_id'] if user else None,
        'referenceDocument': f'BL-{str(i+1).zfill(3)}',
        'createdAt': date,
        'updatedAt': date
    })

db['stockmovements'].insert_many(movements)
print(f'✅ {len(movements)} mouvements ajoutés pour "{product["nom"]}"')
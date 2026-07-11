from pymongo import MongoClient

# 7ot el MONGO_URI el kamil hna directly (b el password el 7a9i9i)
MONGO_URI = "mongodb+srv://erp1_db_user:TON_PASSWORD@cluster0.tsjflia.mongodb.net/test?appName=Cluster0"

try:
    client = MongoClient(MONGO_URI)
    db = client['test']
    print('Collections:', db.list_collection_names())
    print('Connexion OK ✅')
except Exception as e:
    print('Erreur:', e)
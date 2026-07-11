from pymongo import MongoClient
import pandas as pd
from datetime import datetime
from bson import ObjectId

MONGO_URI = 'mongodb+srv://erp1_db_user:Icecream007@cluster0.tsjflia.mongodb.net/?appName=Cluster0'

def get_db():
    client = MongoClient(MONGO_URI)
    return client['test']

def get_stock_movements_for_product(product_id):
    db = get_db()
    movements = list(db['stockmovements'].find({
        'product': ObjectId(product_id),
        'type': 'sortie'
    }).sort('createdAt', 1))

    if len(movements) < 2:
        return None

    df = pd.DataFrame([{
        'ds': m['createdAt'].replace(hour=0, minute=0, second=0, microsecond=0),
        'y': float(m['quantite'])
    } for m in movements])

    df = df.groupby('ds').sum().reset_index()
    return df

def get_all_products():
    db = get_db()
    return list(db['products'].find({}, {'_id': 1, 'nom': 1, 'sku': 1}))

def save_forecast(product_id, j7, j30, j90, mape):
    db = get_db()
    db['forecasts'].update_one(
        {'product': ObjectId(product_id)},
        {'$set': {
            'product': ObjectId(product_id),
            'j7': round(float(j7), 2),
            'j30': round(float(j30), 2),
            'j90': round(float(j90), 2),
            'mape': round(float(mape), 2),
            'dateCalcul': datetime.now()
        }},
        upsert=True
    )
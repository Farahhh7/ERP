from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

# Print el URI bech nchouha
uri = os.getenv('MONGO_URI')
print('URI:', uri)

client = MongoClient(uri)
print('Databases:', client.list_database_names())
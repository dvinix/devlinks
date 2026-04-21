from app.db.mongo import mongo


def get_mongo_db():
    return mongo.getdb()
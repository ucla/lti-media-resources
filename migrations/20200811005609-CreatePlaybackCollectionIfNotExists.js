module.exports = {
  async up(db) {
    const collectionList = await db.listCollections().toArray();
    if (!collectionList.map(col => col.name).includes('playbacks')) {
      await db.createCollection('playbacks');
    }
  },

  async down(db) {
    db.collection('playbacks').drop();
  },
};

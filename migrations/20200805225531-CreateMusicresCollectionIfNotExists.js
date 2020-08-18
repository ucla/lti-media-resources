module.exports = {
  async up(db) {
    const collectionList = await db.listCollections().toArray();
    if (!collectionList.map(col => col.name).includes('musicreserves')) {
      await db.createCollection('musicreserves');
    }
  },
  async down(db) {
    db.collection('musicreserves').drop();
  },
};

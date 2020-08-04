module.exports = {
  async up(db, client) {
    const collectionList = await db.listCollections().toArray();
    if (!collectionList.map(col => col.name).includes('videoreserves')) {
      await db.createCollection('videoreserves');
    }
    if (!collectionList.map(col => col.name).includes('bruincastmedia')) {
      await db.createCollection('bruincastmedia');
    }
    if (!collectionList.map(col => col.name).includes('crosslists')) {
      await db.createCollection('crosslists');
    }
  },
};

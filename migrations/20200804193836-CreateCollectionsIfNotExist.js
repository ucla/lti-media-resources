module.exports = {
  async up(db) {
    const collectionList = await db.listCollections().toArray();
    if (!collectionList.map(col => col.name).includes('crosslists')) {
      await db.createCollection('crosslists');
    }
    if (!collectionList.map(col => col.name).includes('bruincastmedia')) {
      await db.createCollection('bruincastmedia');
    }
    if (!collectionList.map(col => col.name).includes('videoreserves')) {
      await db.createCollection('videoreserves');
    }
  },

  async down() {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};

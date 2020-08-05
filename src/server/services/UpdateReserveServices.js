class UpdateReserveServices {
  /**
   * Inserts an array of JSON-formatted entries into database's BruinCast collection.
   *
   * @param  {object} client A connected MongoClient
   * @param  {object} session A session started by client
   * @param  {string} collection Collection Name that Entries are Inserted Into
   * @param  {Array} entries An array of JSON-formatted objects for media entries
   * @returns {number} Number of records inserted into the collection
   */
  static async insertVideoResEntries(client, session, collection, entries) {
    const result = await client
      .db(process.env.DB_DATABASE)
      .collection(collection)
      .insertMany(entries, { session });
    return result.insertedCount;
  }

  /**
   * Deletes all media entries for a given term and Class ID
   *
   * @param  {object} client A connected MongoClient
   * @param  {object} session A session started by client
   * @param  {string} collection Collection Name that Entries are Deleted From
   * @param  {string} term Term of the Class
   * @param  {string} srs A 9-digit Class ID
   * @returns {number} Number of records deleted in the collection
   */
  static async deleteVideoResEntriesForClass(
    client,
    session,
    collection,
    term,
    srs
  ) {
    const query = {
      term,
      srs,
    };
    const result = await client
      .db(process.env.DB_DATABASE)
      .collection(collection)
      .deleteMany(query, { session });
    return result.deletedCount;
  }

  /**
   * For a given term and Class ID, delete all records and insert new entries
   *
   * @param {object} client A connected MongoClient
   * @param {string} collection Collection Name that Entries are Updated
   * @param {string} term Term of the Class
   * @param {string} srs A 9-digit Class ID
   * @param {Array} entries An array of JSON-formatted objects for media entries
   * @param {object} logger Object with functions that determines how logs are logged
   * @returns {number} Number of DB Entries Updated
   */
  static async updateRecordsForClass(
    client,
    collection,
    term,
    srs,
    entries,
    logger
  ) {
    const session = client.startSession();
    session.startTransaction();
    try {
      const numDeleted = await this.deleteVideoResEntriesForClass(
        client,
        session,
        collection,
        term,
        srs
      );
      const numInserted = await this.insertVideoResEntries(
        client,
        session,
        collection,
        entries
      );
      await session.commitTransaction();
      session.endSession();
      const numDiff = numInserted - numDeleted;
      if (logger) {
        if (numDiff === 0) {
          logger.log('verbose', 'No records added/deleted');
        } else if (numDiff > 0) {
          logger.info(
            `Added ${numDiff} record(s) for course ${srs} under term ${term}`
          );
        } else {
          logger.info(
            `Deleted ${-numDiff} record(s) for course ${srs} under term ${term}`
          );
        }
      }
      return numDiff;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  /**
   * Read a string into an array of video fields
   *
   * @param {string} str Fields of video entries in string format
   * @param {object} logger Object with functions that determines how logs are logged
   * @returns {Array} Array of video fields
   */
  static readStrIntoFields(str, logger) {
    const result = [];
    const medias = str.split('\r').filter((e, i) => i > 1);
    for (const media of medias) {
      const fields = media.split('\t');
      if (!this.checkFieldsFormat(fields)) {
        logger.warn(`The following media line has a wrong format: ${fields}`);
      }
      result.push({
        term: fields[0],
        srs: fields[1],
        startDate: fields[2],
        stopDate: fields[3],
        title: fields[4],
        instructor: fields[5],
        videoTitle: fields[6],
        videoUrl: fields[7],
        filename: fields[8],
        subtitle: fields[9],
        height: fields[10],
        width: fields[11],
      });
    }
    return result;
  }

  /**
   * Check if the format of fields is correct
   *
   * @param  {Array} fields Array of Fields to be Checked
   * @returns  {boolean} Boolean Indicating If Fields Have the Correct Format
   */
  static checkFieldsFormat(fields) {
    const numberFormat = /^[0-9]+$/;
    const termFormat = /^[0-9]{2,3}[A-Z]?$/;
    const slashedDate = /^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2}$/;
    if (fields.length < 12) {
      return false;
    }
    if (!termFormat.test(fields[0])) {
      return false;
    }
    if (
      !numberFormat.test(fields[1]) ||
      !numberFormat.test(fields[10]) ||
      !numberFormat.test(fields[11])
    ) {
      return false;
    }
    if (!slashedDate.test(fields[2]) || !slashedDate.test(fields[3])) {
      return false;
    }
    for (let i = 12; i < fields.length; i += 1) {
      if (fields[i] !== '') {
        return false;
      }
    }
    return true;
  }
}

module.exports = UpdateReserveServices;

module.exports.TABS = {
  BRUINCAST: 0,
  VIDEO_RESERVES: 1,
  DIGITAL_AUDIO_RESERVES: 2,
  MEDIA_GALLERY: 3,
  ADMIN_PANEL: 4,
};

module.exports.ADMIN_PANEL_TABS = {
  SETTINGS: 0,
  LISTINGS_BRUINCAST: 1,
  LISTINGS_VIDEORESERVES: 2,
  LISTINGS_DIGITALAUDIORESERVES: 3,
};

module.exports.MEDIA_TYPE = {
  BRUINCAST: 0,
  VIDEO_RESERVES: 1,
  DIGITAL_AUDIO_RESERVES: 2,
  MEDIA_GALLERY: 3,
};

module.exports.mediaTypeMap = new Map([
  [
    module.exports.MEDIA_TYPE.BRUINCAST,
    {
      api: 'bruincast',
      string: 'Bruincast',
    },
  ],
  [
    module.exports.MEDIA_TYPE.VIDEO_RESERVES,
    {
      api: 'videores',
      string: 'Video Reserves',
    },
  ],
  [
    module.exports.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES,
    {
      api: 'musicres',
      string: 'Digital Audio Reserves',
    },
  ],
  [
    module.exports.MEDIA_TYPE.MEDIA_GALLERY,
    {
      api: '',
      string: 'Media Gallery',
    },
  ],
]);

module.exports.COLLECTION_TYPE = {
  BRUINCAST: 0,
  VIDEO_RESERVES: 1,
  DIGITAL_AUDIO_RESERVES: 2,
  MEDIA_GALLERY: 3,
  CROSSLISTS: 4,
  PLAYBACKS: 5,
  NOTICE: 6,
};

module.exports.collectionMap = new Map([
  [module.exports.COLLECTION_TYPE.BRUINCAST, 'bruincastmedia'],
  [module.exports.COLLECTION_TYPE.VIDEO_RESERVES, 'videoreserves'],
  [module.exports.COLLECTION_TYPE.DIGITAL_AUDIO_RESERVES, 'musicreserves'],
  [module.exports.COLLECTION_TYPE.MEDIA_GALLERY, 'mediagallery'],
  [module.exports.COLLECTION_TYPE.CROSSLISTS, 'crosslists'],
  [module.exports.COLLECTION_TYPE.PLAYBACKS, 'playbacks'],
  [module.exports.COLLECTION_TYPE.NOTICE, 'notice'],
]);

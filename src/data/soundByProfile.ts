type SoundAsset = number;

type SoundsByProfile = {
  classic: SoundAsset[];
  crazy: SoundAsset[];
};

export const releaseSoundsByProfile: SoundsByProfile = {
  classic: [
    require('../../assets/audio/bounceletgo.mp3'),
    require('../../assets/audio/bounceletgo.mp3'),
  ],
  crazy: [
    require('../../assets/audio/bigbooty.wav'),
    require('../../assets/audio/hold.mp3'),
    require('../../assets/audio/bigbooty.wav'),
  ],
};

export const holdSoundsByProfile: SoundsByProfile = {
  classic: [
    require('../../assets/audio/hold.mp3'),
  ],
  crazy: [
    require('../../assets/audio/hold.mp3'),
    require('../../assets/audio/bigbooty.wav'),
  ],
};

export const dismissSoundsByProfile: SoundsByProfile = {
  classic: [
    require('../../assets/audio/bounceletgo.mp3'),
  ],
  crazy: [
    require('../../assets/audio/bigbooty.wav'),
  ],
};

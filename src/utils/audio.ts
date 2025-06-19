import { Howl } from 'howler';
import { useSettingsStore } from '../stores/settingsStore';

// Sound file URLs - using free sounds from public domain
const SOUNDS = {
  select: 'https://assets.codepen.io/21542/click2.mp3',
  place: 'https://assets.codepen.io/21542/pop-down.mp3',
  erase: 'https://assets.codepen.io/21542/pop-up.mp3',
  error: 'https://assets.codepen.io/21542/negative-guitar.mp3',
  complete: 'https://assets.codepen.io/21542/success-1.mp3',
  navigate: 'https://assets.codepen.io/21542/click.mp3',
  toggle: 'https://assets.codepen.io/21542/switch-on.mp3'
};

// Cache for loaded sounds
const soundCache: Record<string, Howl> = {};

// Get a sound from the cache or create a new one
function getSound(soundName: keyof typeof SOUNDS): Howl {
  if (!soundCache[soundName]) {
    soundCache[soundName] = new Howl({
      src: [SOUNDS[soundName]],
      volume: 0.5,
      preload: true
    });
  }
  return soundCache[soundName];
}

export function playSound(soundName: keyof typeof SOUNDS): void {
  const { soundEnabled } = useSettingsStore.getState();
  
  if (soundEnabled) {
    const sound = getSound(soundName);
    sound.play();
  }
}

// Background music (ambient Japanese traditional music)
let bgMusic: Howl | null = null;

export function playBackgroundMusic(): void {
  const { musicEnabled } = useSettingsStore.getState();
  
  if (musicEnabled && !bgMusic) {
    bgMusic = new Howl({
      src: ['https://assets.codepen.io/21542/ambient-japanese.mp3'],
      loop: true,
      volume: 0.3,
      preload: true
    });
    bgMusic.play();
  }
}

export function stopBackgroundMusic(): void {
  if (bgMusic) {
    bgMusic.stop();
    bgMusic = null;
  }
}

export function toggleBackgroundMusic(enabled: boolean): void {
  if (enabled) {
    playBackgroundMusic();
  } else {
    stopBackgroundMusic();
  }
}

// Preload all sounds
export function preloadSounds(): void {
  Object.keys(SOUNDS).forEach(sound => {
    getSound(sound as keyof typeof SOUNDS);
  });
}
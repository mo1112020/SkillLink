class Sound {
  private static instances: { [key: string]: Sound } = {}
  private audio: HTMLAudioElement | null = null
  private loop: boolean = false

  private constructor(src: string, loop: boolean = false) {
    if (typeof window !== 'undefined') {
      this.audio = new Audio(src)
      this.loop = loop
      this.audio.loop = loop
    }
  }

  static create(key: string, src: string, loop: boolean = false): Sound {
    if (!Sound.instances[key]) {
      Sound.instances[key] = new Sound(src, loop)
    }
    return Sound.instances[key]
  }

  play() {
    if (this.audio) {
      // If it's already playing and we want to restart it
      if (!this.audio.paused) {
        this.audio.currentTime = 0
      } else {
        // Start playing
        this.audio.play().catch(error => {
          console.error('Error playing sound:', error)
        })
      }
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
    }
  }

  setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume))
    }
  }
}

// Create instances for different sounds
export const callRingSound = Sound.create(
  'callRing',
  '/sounds/call-ring.mp3',
  true
)

export const callEndSound = Sound.create(
  'callEnd',
  '/sounds/call-end.mp3',
  false
)

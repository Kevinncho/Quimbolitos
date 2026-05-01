import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PlaylistAudioState {
  src: string;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistAudioService {
  private readonly audioPlayer = new Audio();
  private readonly stateSubject = new BehaviorSubject<PlaylistAudioState>({
    src: '',
    isPlaying: false,
    duration: 0,
    currentTime: 0
  });

  readonly state$ = this.stateSubject.asObservable();

  constructor() {
    this.audioPlayer.ontimeupdate = () => {
      this.updateState({
        currentTime: this.audioPlayer.currentTime || 0
      });
    };

    this.audioPlayer.onloadedmetadata = () => {
      this.updateState({
        duration: this.audioPlayer.duration || 0
      });
    };

    this.audioPlayer.onplay = () => {
      this.updateState({
        isPlaying: true
      });
    };

    this.audioPlayer.onpause = () => {
      this.updateState({
        isPlaying: false
      });
    };

    this.audioPlayer.onended = () => {
      this.updateState({
        isPlaying: false,
        currentTime: 0
      });
    };
  }

  get snapshot(): PlaylistAudioState {
    return this.stateSubject.value;
  }

  setSource(src: string): void {
    if (!src) {
      this.stop();
      return;
    }

    if (this.audioPlayer.src === src) {
      return;
    }

    const wasPlaying = !this.audioPlayer.paused;
    this.audioPlayer.pause();
    this.audioPlayer.src = src;
    this.audioPlayer.load();
    this.updateState({
      src,
      duration: 0,
      currentTime: 0
    });

    if (wasPlaying) {
      void this.play();
    }
  }

  play(): Promise<void> {
    return this.audioPlayer.play().then(() => {
      this.updateState({
        isPlaying: true
      });
    });
  }

  pause(): void {
    this.audioPlayer.pause();
    this.updateState({
      isPlaying: false
    });
  }

  stop(): void {
    this.audioPlayer.pause();
    this.audioPlayer.src = '';
    this.audioPlayer.load();
    this.stateSubject.next({
      src: '',
      isPlaying: false,
      duration: 0,
      currentTime: 0
    });
  }

  private updateState(partial: Partial<PlaylistAudioState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...partial
    });
  }
}

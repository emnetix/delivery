import { ENT } from './ent'
import type { DeviceInfoMediaENT } from './types'

export class MediaENT {
  private ent: ENT | null = null

  private cameraId: string | null = null
  private microphoneId: string | null = null

  private stream: MediaStream | null = null

  public onStream: ((stream: MediaStream) => void) | null = null

  private isVideoMuted: boolean = false
  private isMicMuted: boolean = false  // 마이크 음소거 상태를 저장할 변수 추가

  constructor() {
    console.log('ENT Media( MediaENT ) 인스턴스 생성')
  }

  public setEnt(ent: ENT) {
    this.ent = ent
  }

  public async createStream(videoId?: string, audioId?: string): Promise<MediaStream> {
    // 기존 스트림이 있다면 모든 트랙을 중지합니다.
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      if (this.ent) {
        this.stream.getTracks().forEach((track) => this.ent!.removeTrack(track))
      }
    }

    const constraints: MediaStreamConstraints = {
      video: videoId ? { deviceId: videoId } : true,
      audio: audioId ? { deviceId: audioId } : true
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      this.stream = stream

      if (this.onStream) {
        this.onStream(stream)
      }

      stream.getTracks().forEach((track) => {
        if (this.ent) {
          this.ent.addTrack(track, stream)
          console.error('미디어 트랙 추가됨 stream.id', stream.id)
          console.error('미디어 트랙 추가됨', track)
        }
      })

      return stream
    } catch (error) {
      console.error('미디어 접근 오류:', error)
      throw error
    }
  }

  public async start() {
    return this.createStream()
  }

  public async getMicrophones(): Promise<DeviceInfoMediaENT[]> {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices
      .filter((device) => device.kind === 'audioinput')
      .map((device) => ({ id: device.deviceId, name: device.label }))
  }

  public async getSpeakers(): Promise<DeviceInfoMediaENT[]> {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices
      .filter((device) => device.kind === 'audiooutput')
      .map((device) => ({ id: device.deviceId, name: device.label }))
  }

  public async getCameras(): Promise<DeviceInfoMediaENT[]> {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices
      .filter((device) => device.kind === 'videoinput')
      .map((device) => ({ id: device.deviceId, name: device.label }))
  }

  public async selectCamera(deviceId: string) {
    if (this.cameraId === deviceId) {
      return this.stream
    }
    this.cameraId = deviceId
    return this.createStream(deviceId)
  }

  public async selectMicrophone(deviceId: string) {
    if (this.microphoneId === deviceId) {
      return this.stream
    }
    this.microphoneId = deviceId
    return this.createStream(undefined, deviceId)
  }

  public muteVideo(mute: boolean): void {
    if (this.stream) {
      const videoTrack = this.stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !mute
        this.isVideoMuted = mute
      }
    }
  }

  public getVideoMutedStatus(): boolean {
    return this.isVideoMuted
  }

  public muteMic(mute: boolean): void {
    if (this.stream) {
      const audioTrack = this.stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !mute
        this.isMicMuted = mute
      }
    }
  }

  public getMicMutedStatus(): boolean {
    return this.isMicMuted
  }
}

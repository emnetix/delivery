import { io, Socket } from 'socket.io-client'
import type { SignalingMessage } from './types'

const isProd = process.env.NODE_ENV === 'production'
const wsProtocol = isProd ? 'wss' : 'ws'
const socketUrl = `${wsProtocol}://${window.location.host}`

export class ENT {
  public Id: string | null = null
  public peerId: string | null = null

  private ws: Socket | null = null
  public peerConnection: RTCPeerConnection | null = null
  private offer: any = null
  private dataChannel: RTCDataChannel | null = null

  public onWebsocketConnected: ((ws: Socket) => void) | null = null
  public onWebsocketMessage: ((message: SignalingMessage) => void) | null = null
  public onWebsocketDisconnected: ((ws: Socket) => void) | null = null

  public onOffered: ((offer: any) => void) | null = null
  public onAnswer: ((answer: any) => void) | null = null
  public onIceCandidate: ((candidate: any) => void) | null = null

  public onTrackOnPC: ((event: RTCTrackEvent) => void) | null = null
  public onIceCandidateOnPC: ((candidate: any) => void) | null = null

  public onDataChannelOpen: (() => void) | null = null
  public onDataChannelClose: (() => void) | null = null
  public onDataChannelMessage: ((event: MessageEvent) => void) | null = null

  constructor() {
    console.log('ENT 인스턴스 생성')
  }

  public setId(id: string) {
    this.Id = id
    if (this.ws) {
      this.ws?.emit('set-id', JSON.stringify({ type: 'set-id', id: id }))
    }
  }

  public setPeerId(id: string) {
    this.peerId = id
  }

  public handleSignalingMessage = async (message: SignalingMessage) => {
    const data = message
    if (data.to !== this.Id) return

    switch (data.type) {
      case 'offer': {
        if (this.onOffered) {
          this.onOffered(data.offer)
        }
        await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(data.offer))
        const answer = await this.peerConnection?.createAnswer()
        await this.peerConnection?.setLocalDescription(answer)
        this.ws?.emit(
          'message',
          JSON.stringify({ type: 'answer', answer, to: data.from, from: this.Id })
        )
        break
      }
      case 'answer': {
        if (this.onAnswer) {
          this.onAnswer(data.answer)
        }
        await this.peerConnection?.setLocalDescription(this.offer)
        await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(data.answer))
        break
      }
      case 'ice-candidate': {
        if (this.onIceCandidate) {
          this.onIceCandidate(data.candidate)
        }
        if (data.candidate) {
          if (this.peerConnection?.remoteDescription) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
          }
        }
        break
      }
    }
  }

  private connectSocket() {
    this.ws = io(socketUrl, {
      path: '/api/v1/ws/echo',
      transports: ['websocket']
    })

    this.ws?.on('connect', () => {
      if (this.onWebsocketConnected && this.ws) {
        this.onWebsocketConnected(this.ws as Socket)
      }
    })

    this.ws?.on('message', (data: SignalingMessage) => {
      if (this.onWebsocketMessage) {
        this.onWebsocketMessage(data)
      }
      this.handleSignalingMessage(data)
    })

    this.ws?.on('disconnect', () => {
      if (this.onWebsocketDisconnected) {
        this.onWebsocketDisconnected(this.ws as Socket)
      }
      console.log('소켓 연결이 닫혔습니다.')
    })
  }

  private createPeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })

    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      if (this.onTrackOnPC) {
        this.onTrackOnPC(event)
      }
    }

    this.peerConnection.onicecandidate = (event) => {
      if (this.onIceCandidateOnPC) {
        this.onIceCandidateOnPC(event)
      }

      if (event.candidate) {
        this.ws?.emit(
          'message',
          JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate,
            to: this.peerId,
            from: this.Id
          })
        )
      }
    }

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel
      this.setupDataChannel()
    }
  }

  private setupDataChannel() {
    if (this.dataChannel) {
      this.dataChannel.onmessage = (event) => {
        if (this.onDataChannelMessage) {
          this.onDataChannelMessage(event.data)
        }
      }
      this.dataChannel.onopen = () => {
        if (this.onDataChannelOpen) {
          this.onDataChannelOpen()
        }
      }
      this.dataChannel.onclose = () => {
        if (this.onDataChannelClose) {
          this.onDataChannelClose()
        }
      }
    }
  }

  public addTrack(track: MediaStreamTrack, stream: MediaStream) {
    console.error('ENT 미디어 트랙 추가됨 stream.id', stream.id)
    this.peerConnection?.addTrack(track, stream)
  }

  public removeTrack(track: MediaStreamTrack) {
    const sender = this.peerConnection?.getSenders().find((s) => s.track === track)
    if (sender) {
      this.peerConnection?.removeTrack(sender)
    }
  }

  public createDataChannel() {
    if (this.peerConnection) {
      this.dataChannel = this.peerConnection.createDataChannel('dataChannel')
      this.setupDataChannel()
    }
  }

  public sendMessage(message: string) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(message)
    } else {
      console.error('데이터 채널이 열려있지 않습니다.')
    }
  }

  public async createOffer() {
    if (!this.peerId) {
      console.error('상대방 ID를 입력해주세요.')
      return
    }
    this.offer = await this.peerConnection?.createOffer()
    this.ws?.emit(
      'message',
      JSON.stringify({
        type: 'offer',
        offer: this.offer,
        to: this.peerId,
        from: this.Id
      })
    )
  }

  public async connect() {
    this.connectSocket()
    this.createPeerConnection()
    this.createDataChannel()
  }

  public async disconnect() {
    this.peerConnection?.close()
    this.ws?.disconnect()
  }
}

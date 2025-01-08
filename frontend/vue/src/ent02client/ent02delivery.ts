import { io, Socket } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'

import type { ENT02DeliveryDelivery, ENT02DeliveryError } from './types'

const isProd = process.env.NODE_ENV === 'production'
// const wsProtocol = isProd ? 'wss' : 'ws'
// const socketUrl = `${wsProtocol}://${window.location.host}`
const socketUrl = `wss://delivery.emnetix.net`
const socketPath = '/api/v1/ws/ent02delivery'

export class ENT02Delivery {
  public Id: string | null = null

  public peerId: string | null = null

  public peerConnection: RTCPeerConnection | null = null

  private ws: Socket | null = null

  public onConnected: () => void = () => {}
  public onDisconnected: () => void = () => {}
  public onDelivery: (data: ENT02DeliveryDelivery) => void = () => {}
  public onError: (data: ENT02DeliveryError) => void = () => {}

  constructor() {}

  private connectSocket() {
    if (this.ws) {
      this.ws.disconnect()
    }

    this.ws = io(socketUrl, {
      path: socketPath,
      transports: ['websocket']
    })

    this.ws?.on('connect', () => {
      if (this.Id) {
        this.ws?.emit('set-id', JSON.stringify({ type: 'set-id', id: this.Id }))
      }
      this.onConnected()
    })
    this.ws?.on('disconnect', () => {
      this.onDisconnected()
    })

    this.ws?.on('delivery', (data: ENT02DeliveryDelivery) => {
      this.onDelivery(data)
    })

    this.ws?.on('error', (data: ENT02DeliveryError) => {
      this.onError(data)
    })
  }

  public createID() {
    const newID = uuidv4()
    return newID
  }

  public setId(id: string) {
    this.Id = id
  }

  public setPeerId(id: string) {
    this.peerId = id
  }

  public async registerDevice() {
    this.connectSocket()
  }

  public sendData(data: any) {
    this.ws?.emit('delivery', JSON.stringify({ from: this.Id, to: this.peerId, payload: data }))
  }
}

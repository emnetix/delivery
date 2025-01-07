export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate'
  to: string
  from: string
  offer?: any
  answer?: any
  candidate?: any
}

export interface DeviceInfoMediaENT {
  id: string
  name: string
}

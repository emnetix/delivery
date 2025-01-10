import { UseXTermProps } from "react-xtermjs";

export type MessageBuffer = {
  message: string|Uint8Array,
  prefix?: string,
  color?: string
} | string

export const XTERM_OPTIONS = {
  cursorBlink: true,
  fontSize: 14,
  cols: 100,
  rows: 23,
} as UseXTermProps['options'];

export const XTERM_COLOR: Record<string, number> = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  brightBlack: 90,
  brightRed: 91,
  brightGreen: 92,
  brightYellow: 93,
  brightBlue: 94,
  brightMagenta: 95,
  brightCyan: 96,
  brightWhite: 97
}

export const printToTerminal = (data: Uint8Array|string, prefix: string = '', color: string = 'white'): Array<string> => {
  const colorCode = XTERM_COLOR[color] ?? XTERM_COLOR.white;
  prefix = prefix ? `${prefix} ` : '';
  if (typeof data === 'string') 
    return [`\x1b[${colorCode}m${prefix}${data}\x1b[0m`.replace(/\n/g, '\r\n')];

  const hexData = Array.from(data).map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())

  const asciiData = Array.from(data)
    .map((byte) => {
      if (byte >= 32 && byte <= 126) {
        return String.fromCharCode(byte)
      }
      return '.'
    })
    .join('')

  const arr = [];
  arr.push(`\x1b[${colorCode}m${prefix}`.replace(/\n/g, '\r\n'));

  for (let i = 0; i < hexData.length; i += 16) {
    const chunk = hexData.slice(i, i + 16)
    const asciiChunk = asciiData.slice(i, i + 16)
    const hexLine = chunk.join(' ').padEnd(48, ' ')
    arr.push(`\x1b[${colorCode}m${hexLine} | ${asciiChunk}`)
  }

  arr.push('\x1b[0m'.replace(/\n/g, '\r\n'));

  return arr;
}
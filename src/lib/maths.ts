export function clamp(min: number, input: number, max: number) {
  return Math.max(min, Math.min(input, max))
}

export function mapRange(
  in_min: number,
  in_max: number,
  input: number,
  out_min: number,
  out_max: number
) {
  return ((input - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}

export function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end
}

export function truncate(value: number, decimals: number) {
  return parseFloat(value.toFixed(decimals))
}

export function random(min: number, max: number) {
  // return Math.random() * max + min
  return mapRange(0, 1, Math.random(), min, max)
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * Math.round(max)) + Math.round(min)
}

const Maths = { lerp, clamp, mapRange, truncate, randomInt }

export default Maths

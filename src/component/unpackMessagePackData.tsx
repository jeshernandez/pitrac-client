import { decode } from '@msgpack/msgpack';

// Define a TypeScript interface to hold unpacked data
interface GsIPCResult {
  carry_meters: number;
  speed_mpers: number;
  launch_angle_deg: number;
  side_angle_deg: number;
  back_spin_rpm: number;
  side_spin_rpm: number;
  confidence: number;
  club_type: number;       // you can map this to enum if desired
  result_type: number;     // you can map this to enum if desired
  message?: string;
  log_messages?: string[];
}

export function unpackMessagePackData(buffer: Uint8Array): GsIPCResult | null {
  try {
    // Decode the buffer to an array (assuming the payload is an array)
    const unpackedArray = decode(buffer) as any[];

    // Defensive extraction with type checks
    return {
      carry_meters: Number(unpackedArray[0]),
      speed_mpers: Number(unpackedArray[1]),
      launch_angle_deg: Number(unpackedArray[2]),
      side_angle_deg: Number(unpackedArray[3]),
      back_spin_rpm: Number(unpackedArray[4]),
      side_spin_rpm: Number(unpackedArray[5]),
      confidence: Number(unpackedArray[6]),
      club_type: Number(unpackedArray[7]),
      result_type: Number(unpackedArray[8]),
      message: unpackedArray[9] ?? undefined,
      log_messages: unpackedArray[10] ?? undefined,
    };
  } catch (error) {
    console.error('Failed to unpack MessagePack data:', error);
    return null;
  }
}
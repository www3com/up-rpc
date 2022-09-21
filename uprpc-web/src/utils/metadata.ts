import {ParseType} from "../types/types";

export function encode(value: any, parseType: number) {
    let buffer = new ArrayBuffer(16);
    let view = new DataView(buffer);

    switch (parseType) {
        case ParseType.IntLE:
        case ParseType.IntBE:
        case ParseType.Int8:
            view.setInt8(0, value);
            break;
        case ParseType.Int16LE:
            view.setInt16(0, value, true);
            break;
        case ParseType.Int16BE:
            view.setInt16(0, value, false);
            break;
        case ParseType.Int32LE:
            view.setInt32(0, value, true);
            break;
        case ParseType.Int32BE:
            view.setInt32(0, value, false);
            break;
        case ParseType.FloatLE:
            view.setFloat32(0, value, true);
            break;
        case ParseType.FloatBE:
            view.setFloat32(0, value, false);
            break;
        case ParseType.DoubleLE:
            view.setFloat64(0, value, true);
            break;
        case ParseType.DoubleBE:
            view.setFloat64(0, value, false);
            break;
        case ParseType.UintLE:
        case ParseType.UintBE:
        case ParseType.Uint8:
            view.setUint8(0, value);
            break;
        case ParseType.Uint16LE:
            view.setUint16(0, value, true);
            break;
        case ParseType.Uint16BE:
            view.setUint16(0, value, false);
            break;
        case ParseType.Uint32LE:
            view.setUint32(0, value, true);
            break;
        case ParseType.Uint32BE:
            view.setUint32(0, value, false);
            break;
        case ParseType.BigInt64LE:
            view.setBigInt64(0, value, true);
            break;
        case ParseType.BigInt64BE:
            view.setBigInt64(0, value, false);
            break;
        case ParseType.BigUint64LE:
            view.setBigUint64(0, value, true);
            break;
        case ParseType.BigUint64BE:
            view.setBigInt64(0, value, false);
            break;
    }
    return view;
}

export function decode(value: any, parseType: number): any {
    const view = new DataView(value.buffer, value.byteOffset, value.length);
    switch (parseType) {
        case ParseType.IntLE:
        case ParseType.IntBE:
        case ParseType.Int8:
            return view.getInt8(0);
        case ParseType.Int16LE:
            return view.getInt16(0, true);
        case ParseType.Int16BE:
            return view.getInt16(0, false);
        case ParseType.Int32LE:
            return view.getInt32(0, true);
        case ParseType.Int32BE:
            return view.getInt32(0, false);
        case ParseType.FloatLE:
            return view.getFloat32(0, true);
        case ParseType.FloatBE:
            return view.getFloat32(0, false);
        case ParseType.DoubleLE:
            return view.getFloat64(0, true);
        case ParseType.DoubleBE:
            return view.getFloat64(0, false);
        case ParseType.UintLE:
        case ParseType.UintBE:
        case ParseType.Uint8:
            return view.getUint8(0);
        case ParseType.Uint16LE:
            return view.getUint16(0, true);
        case ParseType.Uint16BE:
            return view.getUint16(0, false);
        case ParseType.Uint32LE:
            return view.getUint32(0, true);
        case ParseType.Uint32BE:
            return view.getUint32(0, false);
        case ParseType.BigInt64LE:
            return view.getBigInt64(0, true);
        case ParseType.BigInt64BE:
            return view.getBigInt64(0, false);
        case ParseType.BigUint64LE:
            return view.getBigUint64(0, true);
        case ParseType.BigUint64BE:
            return view.getBigInt64(0, false);
        default:
            return '[Buffer ... ' + value.length + ' bytes]';
    }
}

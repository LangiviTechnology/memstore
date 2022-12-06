import {
    ensureDir,
    existsSync
} from "https://deno.land/std@0.129.0/fs/mod.ts";
const VERSION = "0.0.5"
let libSuffix = "";

function toCString(string:string):Uint8Array {
    //@ts-ignore
    return new Uint8Array([...Deno.core.encode(string), 0])
}

switch (Deno.build.os) {
    case "windows":
        libSuffix = "dll";
        break;
    case "darwin":
        libSuffix = "dylib";
        break;
    default:
        libSuffix = "so";
        break;
}
const libname = `./lib/libmemstore.${libSuffix}`;
if (!existsSync(libname)){
    const file = await fetch(`https://deno.land/x/memory_store@${VERSION}/memstore/lib/libmemstore.${libSuffix}`);
    ensureDir("lib");
    Deno.writeFile(libname, new Uint8Array(await file.arrayBuffer()));
}

const lib = Deno.dlopen(libname, {
    "add_kv": {parameters: ["buffer", "buffer", "usize"], result: "void"},
    "get_kv": {parameters: ["buffer"], result: "buffer"},
    "delete_kv": {parameters: ["buffer"], result: "u8"}
});

export function add(name: string, value: string | Uint8Array) {
    const strVal = typeof value == "string" ? toCString(value) : value;
    const strName = toCString(name);
    return lib.symbols.add_kv(strName, strVal, strVal.length);
}

export function get(name: string): string | null {
    const strName = toCString(name);
    const value = lib.symbols.get_kv(strName);
    if (value.value == 0n)
        return null;
    const stringPtrview1 = new Deno.UnsafePointerView(value);
    return stringPtrview1.getCString();
}

export function getBuf(name: string): Uint8Array | null {
    const strName = toCString(name);
    const value = lib.symbols.get_kv(strName);
    if (value.value == 0n)
        return null;
    const stringPtrview1 = new Deno.UnsafePointerView(value);
    console.log(stringPtrview1.getCString().length);
    const buf = new Uint8Array(stringPtrview1.getCString().length);
    stringPtrview1.copyInto(buf);
    return buf;
}

export function deleteKey(name: string): boolean {
    const strName = toCString(name);
    const value = lib.symbols.delete_kv(strName);
    return value != 0;
}

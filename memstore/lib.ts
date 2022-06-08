import {
    ensureDir,
    existsSync
} from "https://deno.land/std@0.129.0/fs/mod.ts";
const libname = "./lib/libmemstore.dylib";
if (!existsSync(libname)){
    console.log("hello");
    const file = await fetch("https://deno.land/x/memory_store@0.0.1/memstore/lib/libmemstore.dylib");
    ensureDir("lib");
    Deno.writeFile(libname, new Uint8Array(await file.arrayBuffer()));

}
const lib = Deno.dlopen(libname, {
    "add_kv": {parameters: ["pointer", "pointer", "usize"], result: "void"},
    "get_kv": {parameters: ["pointer"], result: "pointer"},
    "delete_kv": {parameters: ["pointer"], result: "u8"}
});
console.log(lib);
export function add(name: string, value: string | Uint8Array) {
    //@ts-ignore
    const strVal = typeof value == "string" ? new Uint8Array([...Deno.core.encode(value), 0]) : value;
    //@ts-ignore
    const strName = new Uint8Array([...Deno.core.encode(name), 0]);
    return lib.symbols.add_kv(Deno.UnsafePointer.of(strName), Deno.UnsafePointer.of(strVal), strVal.length);
}

export function get(name: string): string | null {
    //@ts-ignore
    const strName = new Uint8Array([...Deno.core.encode(name), 0]);
    const value = lib.symbols.get_kv(strName);
    if (value.value == 0n)
        return null;
    const stringPtrview1 = new Deno.UnsafePointerView(value);
    return stringPtrview1.getCString();
}

export function getBuf(name: string): Uint8Array | null  {
    //@ts-ignore
    const strName = new Uint8Array([...Deno.core.encode(name), 0]);
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
    //@ts-ignore
    const strName = new Uint8Array([...Deno.core.encode(name), 0]);
    const value = lib.symbols.delete_kv(strName);
    return value == 0 ? false : true;

}

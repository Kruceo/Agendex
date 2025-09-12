import { readFileSync, existsSync, writeFileSync } from "fs";

export const Types = {
    ID: "ID",
    string: "string",
    number: "number"
} as const

type valuesOf<T> = T[keyof T]

export type TypesType = valuesOf<typeof Types>

type DefaultEntrie = Record<string, string | number>

// type PossibleReadOutput = Record<string, string | number | Record<string, number | string>[]>

export interface Table {
    data: { [x: string]: DefaultEntrie },
    meta: {
        lastID: number,
        format: Record<string, TypesType>
    }
}

export type DB = Record<string, Table>
export type WhereOperation = "EQ" | "MT" | "LT" | "EMT" | "ELT" | "LIKE" | "ILIKE"
export type Where<T = Record<string, string>> = ([keyof T, WhereOperation, number | string] | ("&" | "|"))[]

export class KruceoDB {
    filepath: string;
    constructor(filepath: string) {
        this.filepath = filepath
        if (!existsSync(filepath)) {
            writeFileSync(filepath, "{}")
        }
    }

    createTableIfNotExists(table: string, format: Record<string, TypesType>) {
        const obj: Table = { meta: { lastID: 0, format: format }, data: {} }
        const all: DB = JSON.parse(readFileSync(this.filepath, "utf-8"))
        if (all[table]) return;
        all[table] = obj
        writeFileSync(this.filepath, JSON.stringify(all, null, 2))
    }

    read<T>(table: string, options?: { useOpenedDB?: DB, where?: Where<T>, include?: { tableName: string, key: string, compareToKey: keyof T | "ID" }[], limit?: number }) {
        const data: DB = options?.useOpenedDB ? options.useOpenedDB : JSON.parse(readFileSync(this.filepath, "utf-8"))
        let dataArray = Object.values(data[table].data) as T[]

        let reducedIncludes: any = {}

        if (options) {
            //prepare to include
            if (options.include)
                for (const includer of options.include) {
                    const reduced = this.read<T & { [x: string]: string }>(includer.tableName)
                        .reduce((ac, next) => {
                            if (!ac[next[includer.key]]) {
                                ac[next[includer.key]] = []
                            }
                            ac[next[includer.key]].push(next)
                            return ac
                        }, {} as any)
                    reducedIncludes[includer.tableName] = reduced
                }
            let comparers: ((v: any) => boolean)[][] = [[]]
            if (options.where) {
                for (const operation of options.where) {
                    if (typeof operation == "object") {
                        comparers[comparers.length - 1].push(
                            (value: T) => {
                                const [key, op, compareValue] = operation
                                switch (op) {
                                    case "EQ":
                                        return value[key] == compareValue
                                    case "EMT":
                                        return value[key] >= compareValue
                                    case "ELT":
                                        return value[key] <= compareValue
                                    case "LT":
                                        return value[key] < compareValue
                                    case "MT":
                                        return value[key] > compareValue
                                    case "LIKE":
                                        return (`${value[key]}`).includes(compareValue.toString())
                                    case "ILIKE":
                                        return (`${value[key]}`.toLowerCase()).includes(compareValue.toString().toLowerCase())
                                    default:
                                        return false
                                }
                            }
                        )
                    } else if (operation == "|") {
                        comparers.push([])
                    }

                }
            }
            const newDataArray: (T & { [x: string]: Object })[] = []

            for (const dit of dataArray) {
                let element: any = { ...dit }

                // include
                if (options.include) {
                    for (const includer of options.include) {
                        element[includer.tableName] = reducedIncludes[includer.tableName][element[includer.compareToKey]] ?? []
                    }
                }

                // operators
                for (const group of comparers) {
                    let groupResult = true
                    for (const comparer of group) {
                        if (!comparer(element)) {
                            groupResult = false
                            break
                        }
                    }
                    if (groupResult) {
                        newDataArray.push(element)
                        break
                    }
                }
                // limit
                if (options.limit && newDataArray.length >= options.limit) {
                    break;
                }
            }

            dataArray = newDataArray
        }

        return dataArray as (T & { [x: string]: object })[]
    }

    readByID<T = DefaultEntrie>(table: string, id: string): T | null {
        const data: DB = JSON.parse(readFileSync(this.filepath, "utf-8"))
        return data[table].data[id] as T
    }
    write<T = DefaultEntrie>(table: string, items: T[]) {
        const all: DB = JSON.parse(readFileSync(this.filepath, "utf-8"))
        let result: (T & { ID: number })[] = []
        for (const item of items) {

            const id = all[table].meta.lastID + 1
            if (all[id]) {
                throw new Error(`ID ${id} already exists`)
            }
            let obj: { ID: number, [x: string]: any } = { ID: id }

            for (const key in all[table].meta.format) {
                if (key == "ID") {
                    continue
                };
                const keyFormat = all[table].meta.format[key]
                const userProvidedKeyFormat = typeof item[key as keyof T]
                if (keyFormat != userProvidedKeyFormat) {
                    throw new Error(key + " type is not equal: " + keyFormat + " vs " + userProvidedKeyFormat)
                }
                obj[key] = item[key as keyof T]
            }
            all[table].data[id] = obj
            all[table].meta.lastID++
            result.push(obj as T & { ID: number })
        }
        writeFileSync(this.filepath, JSON.stringify(all, null, 2))
        return result
    }

    delete(table: string, ids: number[]) {
        const data: DB = JSON.parse(readFileSync(this.filepath, "utf-8"))
        for (const id of ids) {
            delete data[table].data[id]
        }
        writeFileSync(this.filepath, JSON.stringify(data, null, 2))
    }

    edit<T = DefaultEntrie>(table: string, id: number, item: Partial<T>) {
        const data: DB = JSON.parse(readFileSync(this.filepath, "utf-8"))
        data[table].data[id] = Object.assign(data[table].data[id], item)
        writeFileSync(this.filepath, JSON.stringify(data, null, 2))
    }
}
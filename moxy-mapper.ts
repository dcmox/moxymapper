const fs = require('fs')
const levenshtein = require('string-dist').levenshtein
const MoxyAddress = require('moxy-address').MoxyAddress

interface IJson { [key: string]: any }

export class MoxyMapper {
    private _srcSample: IJson = {}
    private _destSample: IJson = {}
    private _mappedData: string
    public constructor(srcSample?: IJson, destSample?: IJson) {
        if (srcSample) {
            this._srcSample = srcSample
        }
        if (destSample) {
            this._destSample = destSample
        }
        if (srcSample && destSample) {
            this._mappedData = this.buildMap(srcSample, destSample)
        } else {
            this._mappedData = ''
        }
    }

    public map(src: IJson, mapFile?: string): IJson {
        if (mapFile) {
            this._mappedData = fs.readFileSync(mapFile).toString()
            return eval(this._mappedData)
        } else if (this._mappedData) {
            // tslint:disable-next-line: no-eval
            return eval(this._mappedData)
        }
        return {}
    }

    public save = (dest: string): boolean => {
        fs.writeFileSync(dest, this._mappedData)
        return true
    }

    public buildMap = (srcSample: IJson, destSample: IJson): string => {
        let srcKeys = Object.keys(srcSample)
        srcKeys.forEach((key: string) => {
            if (typeof srcSample[key] === 'object') {
                const tmpKeys = this._getKeys(srcSample[key], key)
                srcKeys = srcKeys.concat(tmpKeys)
            }
        })
        let output: string = `let dest = {}\n`
        const destKeys = Object.keys(destSample)

        destKeys.forEach((key: string) => {
            if (typeof destSample[key] === 'object') {
                output += `dest.${key} = {}\n`
                const out = this._getSubsetOutput(destSample[key], key, srcSample, srcKeys)
                output += out
            } else {
                const idx = srcKeys.indexOf(key) > -1
                if (idx && srcSample[key] === destSample[key]) {
                    output += `dest.${key} = src.${key}\n`
                } else {
                    // Name split
                    if (key.toLowerCase().indexOf('name') > - 1
                        && srcKeys.indexOf('name') > -1) {
                        if (srcSample.name.indexOf(' ') > -1) {
                            const [firstName, lastName] = srcSample.name.split(' ')
                            if (destSample[key] === firstName) {
                                output += `dest.${key} = src.name.split(' ')[0]\n`
                            }
                            if (destSample[key] === lastName) {
                                output += `dest.${key} = src.name.split(' ')[1]\n`
                            }
                        }
                    }
                }
            }
        })
        return output + '\ndest'
    }
    private _getKeys = (o: IJson, key: string): string[] => Object.keys(o).map((k: string) => key + '.' + k)
    private _getSubsetOutput = (dest: IJson, path: string, src: IJson, srcKeys: string[]): string => {
        const destKeys = Object.keys(dest)
        let output: string = ''
        let oo: any = {}
        destKeys.forEach((key: string) => {
            if (typeof dest[key] === 'object') {
                output += `dest.${path}.${key} = {}\n`
                const out: string = this._getSubsetOutput(dest[key], `${path}.${key}`, src, srcKeys)
                if (out) { output += out }
            } else {
                const idx = srcKeys.indexOf(key) > -1
                if (idx && src[key] === dest[key]) {
                    output += `dest.${path}.${key} = src.${key}\n`
                } else {
                    const keyPossibilities = srcKeys.filter((k: string) => {
                        if (k.indexOf('.') === -1
                            && src[k] === dest[key]
                            && levenshtein(k.toLowerCase(), key.toLowerCase()) <= 1) {
                            return true
                        } else {
                            const nodes = k.split('.')
                            let node = src
                            nodes.forEach((n) => {
                                node = node[n]
                                k = n
                            })
                            if (node === dest[key] && levenshtein(k.toLowerCase(), key.toLowerCase()) <= 1) {
                                return true
                            }
                        }
                        return false
                    })
                    if (keyPossibilities.length === 1) {
                        output += `dest.${path}.${key} = src.${keyPossibilities[0]}\n`
                    } else {
                        // Custom logic for addresses and other data types
                        const kp = srcKeys.filter((k: string) => {
                            if (k.indexOf('.') === -1 && levenshtein(k.toLowerCase(), key.toLowerCase()) <= 1) {
                                return true
                            }
                        })
                        if (kp.length === 1) {
                            if (key.replace(/[0-9]/g, '') === kp[0]) {
                                if (['street', 'street1', 'address', 'zip'].indexOf(kp[0]) > -1) {
                                    const address = MoxyAddress.parse(src[kp[0]])
                                    if (address[key] === dest[key].replace(/\./g, '')) {
                                        if (!oo[`${path}.${kp[0]}`]) {
                                            oo[`${path}.${kp[0]}`] = `const address = MoxyAddress.parse(src.${kp[0]})\n`
                                        }
                                        output += `dest.${path}.${key} = address.${key}\n`
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        let headers: string = ''
        Object.keys(oo).forEach((k: string) => headers += oo[k] + '\n')
        return headers + output
    }
}

export default MoxyMapper

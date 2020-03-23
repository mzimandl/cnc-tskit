/*
 * Copyright 2018 Tomas Machalek <tomas.machalek@gmail.com>
 * Copyright 2018 Institute of the Czech National Corpus,
 *                Faculty of Arts, Charles University
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Dict } from './dict';

// NOTE: please note that these functions in general may mutate their
// arguments as we rely on Immer.js working for us when reducing states.


/**
 * List namespace contains functions for array creating
 * and manipulation. For easier composition, the functions
 * are defined as "data-last" (this applies even for functions
 * like concat!).
 */
export namespace List {

    /**
     * Create an array of size 'size' filled in by values created
     * by factory function fn. The parameter idx passed to fn
     * describes order of the item (0-based).
     */
    export function repeat<T>(fn:(idx?:number)=>T, size:number):Array<T> {
        const ans:Array<T> = [];
        for (let i = 0; i < size; i += 1) {
            ans.push(fn(i));
        }
        return ans;
    }

    /**
     *
     * @param from lower limit (inclusive)
     * @param to upper limit (exclusive)
     * @param step either positive or negative number
     */
    export function range(from:number, to:number, step:number = 1):Array<number> {
        const ans:Array<number> = [];
        const cmp = step >= 0 ? (i:number) => i < to : (i:number) => i > to;
        for (let i = from; cmp(i); i += step) {
            ans.push(i);
        }
        return ans;
    }

    export function zip<T, U>(incoming:Array<U>, data:Array<T>):Array<[T, U]>;
    export function zip<T, U>(incoming:Array<U>):(data:Array<T>)=>Array<[T, U]>;
    export function zip<T, U>(incoming:Array<U>, data?:Array<T>):any {
        const fn = (data2:Array<T>):Array<[T, U]> => {
            const ans:Array<[T, U]> = [];
            for (let i = 0; i < Math.min(data2.length, incoming.length); i++) {
                ans.push([data2[i], incoming[i]]);
            }
            return ans;
        }
        return data ? fn(data) : fn;
    }


    export function map<T, U>(fn:(v:T, i:number)=>U):(data:Array<T>)=>Array<U>;
    export function map<T, U>(fn:(v:T, i:number)=>U, data:Array<T>):Array<U>;
    export function map<T, U>(fn:(v:T, i:number)=>U, data?:Array<T>):any {
        const partial = (data2:Array<T>):Array<U> => data2.map(fn);
        return data ? partial(data) : partial;
    }

    export function get<T>(idx:number, data:Array<T>):T;
    export function get<T>(idx:number):(data:Array<T>)=>T;
    export function get<T>(idx:number, data?:Array<T>):any {
        const fn = (data2:Array<T>):T => idx >= 0 ? data2[idx] : data2[data2.length + idx];
        return data ? fn(data) : fn;
    }

    /**
     * Get min and max items
     * @param cmp
     */
    export function findRange<T>(cmp:(v1:T, v2:T)=>number):(data:Array<T>)=>[T, T];
    export function findRange<T>(cmp:(v1:T, v2:T)=>number, data:Array<T>):[T, T];
    export function findRange<T>(cmp:(v1:T, v2:T)=>number, data?:Array<T>):any {
        const partial = (data2:Array<T>):[T, T] => {
            let min:T = data2[0];
            let max:T = data2[0];
            data2.forEach(v => {
                if (cmp(v, min) < 0) {
                    min = v;
                }
                if (cmp(v, max) > 0) {
                    max = v;
                }
            });
            return [min, max];
        };
        return data ? partial(data) : partial;
    }

    export function toDict<T>(data:Array<T>):{[key:string]:T};
    export function toDict<T>():(data:Array<T>)=>{[key:string]:T};
    export function toDict<T>(data?:Array<T>):any {
        const fn = (data2:Array<T>):{[key:string]:T} => {
            const ans:{[key:string]:T} = {};
            data2.forEach((v, i) => {
                ans[i.toFixed()] = v;
            });
            return ans;
        };
        return data ? fn(data) : fn;
    }

    export function maxItem<T>(mapper:(v:T)=>number, data:Array<T>):T;
    export function maxItem<T>(mapper:(v:T)=>number):(data:Array<T>)=>T;
    export function maxItem<T>(mapper:(v:T)=>number, data?:Array<T>):any {
        const fn = (data2:Array<T>):T => {
            let max = data2[0];
            for (let i = 1; i < data2.length; i++) {
                if (mapper(max) < mapper(data2[i])) {
                    max = data2[i];
                }
            }
            return max;
        };
        return data ? fn(data) : fn;
    }

    export function flatMap<T, U>(mapper:(v:T, i:number) => Array<U>, data:Array<T>):Array<U>;
    export function flatMap<T, U>(mapper:(v:T, i:number) => Array<U>):(data:Array<T>)=>Array<U>;
    export function flatMap<T, U>(mapper:(v:T, i:number) => Array<U>, data?:Array<T>):any {
        const fn = (data2:Array<T>):Array<U> => data2.reduce(
            (acc, curr, i) => acc.concat(mapper(curr, i)),
            [] as Array<U>
        );
        return data ? fn(data) : fn;
    }

    export function reverse<T>(data:Array<T>):Array<T>;
    export function reverse<T>():(data:Array<T>)=>Array<T>;
    export function reverse<T>(data?:Array<T>):any {
        const fn = (data2:Array<T>):Array<T> => data2.reverse();
        return data ? fn(data) : fn;
    }

    export function reduce<T, U>(reducer:(acc:U, V:T, i:number)=>U, initial:U, data:Array<T>):U;
    export function reduce<T, U>(reducer:(acc:U, V:T, i:number)=>U, initial:U):(data:Array<T>)=>U;
    export function reduce<T, U>(reducer:(acc:U, V:T, i:number)=>U, initial:U, data?:Array<T>):any {
        const fn = (data2:Array<T>):U => data2.reduce((acc, curr, i, _) => reducer(acc, curr, i), initial);
        return data ? fn(data) : fn;
    }

    export function foldl<T, U>(reducer:(acc:U, v:T)=>U, initial:U, data:Array<T>):U;
    export function foldl<T, U>(reducer:(acc:U, v:T)=>U, initial:U):(data:Array<T>)=>U;
    export function foldl<T, U>(reducer:(acc:U, v:T)=>U, initial:U, data?:Array<T>):any {
        const fn = (data2:Array<T>):U => data2.reduce((acc, curr) => reducer(acc, curr), initial);
        return data ? fn(data) : fn;
    }

    export function foldr<T, U>(reducer:(acc:U, v:T)=>U, initial:U, data:Array<T>):U;
    export function foldr<T, U>(reducer:(acc:U, v:T)=>U, initial:U):(data:Array<T>)=>U;
    export function foldr<T, U>(reducer:(acc:U, v:T)=>U, initial:U, data?:Array<T>):any {
        const fn = (data2:Array<T>):U => {
            let ans:U = initial;
            for (let i = data2.length - 1; i >= 0; i--) {
                ans = reducer(ans, data2[i]);
            }
            return ans;
        };
        return data ? fn(data) : fn;
    }


    export function groupBy<T>(mapper:(v:T, i:number)=>string, data:Array<T>):Array<[string, Array<T>]>
    export function groupBy<T>(mapper:(v:T, i:number)=>string):(data:Array<T>)=>Array<[string, Array<T>]>
    export function groupBy<T>(mapper:(v:T, i:number)=>string, data?:Array<T>):any {
        const fn = (data2:Array<T>):Array<[string, Array<T>]> => {
            const ans = {} as {[k:string]:Array<T>};
            data2.forEach((v, i) => {
                const k = mapper(v, i);
                if (ans[k] === undefined) {
                    ans[k] = [];
                }
                ans[mapper(v, i)].push(v);
            });
            return Dict.toEntries(ans);
        };
        return data ? fn(data) : fn;
    }


    export function sortBy<T>(map:(v:T) => number, data:Array<T>):Array<T>;
    export function sortBy<T>(map:(v:T) => number):(data:Array<T>)=>Array<T>;
    export function sortBy<T>(map:(v:T) => number, data?:Array<T>):any {
        const fn = (data2:Array<T>):Array<T> => data2.sort((v1, v2) => map(v1) - map(v2));
        return data ? fn(data) : fn;
    }

    export function sort<T>(cmp:(v1:T, v2:T) => number, data:Array<T>):Array<T>;
    export function sort<T>(cmp:(v1:T, v2:T) => number):(data:Array<T>)=>Array<T>;
    export function sort<T>(cmp:(v1:T, v2:T) => number, data?:Array<T>):any {
        const fn = (data2:Array<T>):Array<T> => data2.sort(cmp);
        return data ? fn(data) : fn;
    }

    export function filter<T>(pred:(v:T)=>boolean, data:Array<T>):Array<T>;
    export function filter<T>(pred:(v:T)=>boolean):(data:Array<T>)=>Array<T>;
    export function filter<T>(pred:(v:T)=>boolean, data?:Array<T>):any {
        const fn = (data2:Array<T>):Array<T> => data2.filter(pred);
        return data ? fn(data) : fn;
    }

    export function slice<T>(start:number, end:number, data:Array<T>):Array<T>;
    export function slice<T>(start:number, end:number):(data:Array<T>)=>Array<T>;
    export function slice<T>(start:number):(data:Array<T>)=>Array<T>;
    export function slice<T>(start:number, end?:number, data?:Array<T>):any {
        const fn = (data2:Array<T>) => data2.slice(start, end);
        return data ? fn(data) : fn;
    }

    export function forEach<T>(effect:(v:T, i:number)=>void, data:Array<T>):Array<T>;
    export function forEach<T>(effect:(v:T, i:number)=>void):(data:Array<T>)=>Array<T>;
    export function forEach<T>(effect:(v:T, i:number)=>void, data?:Array<T>):any {
        const fn = (data2:Array<T>):Array<T> => {
            data2.forEach((v, i) => effect(v, i));
            return data2;
        }
        return data ? fn(data) : fn;
    }

    /**
     * zipByMappedKey zips multiple arrays containing the same datatype T
     * tranforming them into type U and deciding which items belong together using
     * 'map' function. Because the type U is independent of T also a factory
     * for type U must be provided (dfltFact()). Items of type T are merged into U
     * using importer() function.
     * @param data
     * @param map
     * @param dfltFact
     * @param importer
     */
    export function zipByMappedKey<T, U>(map:(v:T)=>string, dfltFact:()=>U, importer:(dest:U, incom:T, datasetIdx:number)=>U, data:Array<Array<T>>):Array<U>;
    export function zipByMappedKey<T, U>(map:(v:T)=>string, dfltFact:()=>U, importer:(dest:U, incom:T, datasetIdx:number)=>U):(data:Array<Array<T>>)=>Array<U>;
    export function zipByMappedKey<T, U>(map:(v:T)=>string, dfltFact:()=>U, importer:(dest:U, incom:T, datasetIdx:number)=>U, data?:Array<Array<T>>):any {
        const fn = (data2:Array<Array<T>>):Array<U> => {
            const ans:Array<U> = [];
            const index:{[key:string]:number} = {};

            data2.forEach((itemList, datasetIdx) => {
                itemList.forEach(item => {
                    const key = map(item);
                    if (index[key] === undefined) {
                        ans.push(importer(dfltFact(), item, datasetIdx));
                        index[key] = ans.length - 1;

                    } else {
                        ans[index[key]] = importer(ans[index[key]], item, datasetIdx);
                    }
                });
            });
            return ans;
        };
        return data ? fn(data) : fn;
    }

    export function shift<T>(data:Array<T>):Array<T>;
    export function shift<T>():(data:Array<T>)=>Array<T>;
    export function shift<T>(data?:Array<T>):any {
        const fn = (data2:Array<T>):Array<T> => {
            data2.splice(0, 1);
            return data2;
        };
        return data ? fn(data) : fn;
    }


    export function addUnique<T>(v:T, data:Array<T>):Array<T>;
    export function addUnique<T>(v:T):(data:Array<T>)=>Array<T>;
    export function addUnique<T>(v:T, data?:Array<T>):any {
        const fn = (data2:Array<T>):Array<T> => {
            const idx = data2.findIndex(item => item === v);
            if (idx < 0) {
                data2.push(v);
            }
            return data2;
        };
        return data ? fn(data) : fn;
    }

    export function removeValue<T>(v:T, data:Array<T>):Array<T>;
    export function removeValue<T>(v:T):(data:Array<T>)=>Array<T>;
    export function removeValue<T>(v:T, data?:Array<T>):any {
        const fn = (data2:Array<T>):Array<T> => {
            const idx = data2.findIndex(item => item === v);
            if (idx > -1) {
                data2.splice(idx, 1);
            }
            return data2;
        };
        return data ? fn(data) : fn;
    }

    export function find<T>(pred:(v:T, i:number)=>boolean, data:Array<T>):T|undefined;
    export function find<T>(pred:(v:T, i:number)=>boolean):(data:Array<T>)=>T|undefined;
    export function find<T>(pred:(v:T, i:number)=>boolean, data?:Array<T>):any {
        const fn = (data2:Array<T>):T|undefined => data2.find(pred);
        return data ? fn(data) : fn;
    }

    export function findIndex<T>(pred:(v:T, i:number)=>boolean, data:Array<T>):number;
    export function findIndex<T>(pred:(v:T, i:number)=>boolean):(data:Array<T>)=>number;
    export function findIndex<T>(pred:(v:T, i:number)=>boolean, data?:Array<T>):any {
        const fn = (data2:Array<T>):number => data2.findIndex(pred);
        return data ? fn(data) : fn;
    }

    export function some<T>(pred:(v:T)=>boolean, data:Array<T>):boolean;
    export function some<T>(pred:(v:T)=>boolean):(data:Array<T>)=>boolean;
    export function some<T>(pred:(v:T)=>boolean, data?:Array<T>):any {
        const fn = (data2:Array<T>):boolean => data2.some(pred);
        return data ? fn(data) : fn;
    }

    export function every<T>(pred:(v:T)=>boolean, data:Array<T>):boolean;
    export function every<T>(pred:(v:T)=>boolean):(data:Array<T>)=>boolean;
    export function every<T>(pred:(v:T)=>boolean, data?:Array<T>):any {
        const fn = (data2:Array<T>):boolean => data2.every(pred);
        return data ? fn(data) : fn;
    }

    export function concat<T>(incoming:Array<T>, data:Array<T>):Array<T>;
    export function concat<T>(incoming:Array<T>):(data:Array<T>)=>Array<T>;
    export function concat<T>(incoming:Array<T>, data?:Array<T>):any {
        const fn = (data2:Array<T>):Array<T> => data2.concat(incoming);
        return data ? fn(data) : fn;
    }
}
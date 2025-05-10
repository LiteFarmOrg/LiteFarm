/*
 *  Copyright 2024 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */


/**
 * Check if environment variable is set
 * @param key name of the environment variable
 */
export function hasEnv(key: string): boolean {
    return key in process.env;
}


export function getEnv(key: string): string|undefined;
export function getEnv(key: string, def: string): string;
/**
 * Get environment variable or default value if variable is not set
 * @param key name of the environment variable
 * @param def default value
 */
export function getEnv(key: string, def?: any): string|undefined {
    if(key in process.env) {
        const value=process.env[key];
        if(typeof(value)!=='undefined') return value;
    }
    return def;
}

export function getEnvInt(key: string, def: number): number;
export function getEnvInt(key: string): number|undefined;

/**
 * Get environment variable as integer or default value if variable is not set or not an integer
 * @param key name of the environment variable
 * @param def default value
 */
export function getEnvInt(key: string, def?: number): number|undefined {
    if(key in process.env) {
        const value=process.env[key];
        if(value) {
            const int=parseInt(value);
            if(!isNaN(int)) return int;
        }
    }
    return def;
}

export function getEnvBool(key: string, def: boolean): boolean;
export function getEnvBool(key: string): boolean|undefined;

/**
 * Get environment variable as boolean or default value if variable is not set or not a boolean
 * @param key name of the environment variable
 * @param def default value
 */
export function getEnvBool(key: string, def?: boolean): boolean|undefined {
    if(key in process.env) {
        let value=process.env[key];
        if(value) {
            value=value.toLowerCase().trim();
            if(value==="true" || value==="1" || value==="yes" || value==="on" || value==="enabled" || value==="enable") return true;
            if(value==="false" || value==="0" || value==="no" || value==="off" || value==="disabled" || value==="disable") return false;
        }
    }
    return def;
}
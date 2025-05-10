import { getEnv, getEnvBool, getEnvInt, hasEnv } from '../src/util/env.ts';

describe('Environmental utils tests', () => {
    beforeAll(() => {
        process.env.TEST_INT='509';
        process.env.TEST_BOOL_TRUE='true';
        process.env.TEST_BOOL_FALSE='Disabled';
        process.env.TEST_STRING='AbCd';
    })

    afterAll(() => {
        delete process.env.TEST_INT;
        delete process.env.TEST_BOOL_TRUE;
        delete process.env.TEST_BOOL_FALSE;
        delete process.env.TEST_STRING;
    })

    test('hasEnv', () => {
        expect(hasEnv('NODE_ENV')).toBeTruthy();
        expect(hasEnv('NOT_EXIST')).toBeFalsy();
        expect(hasEnv('TEST_STRING')).toBeTruthy();
    })
    test('getEnv', () => {
        expect(getEnv('NODE_ENV')).toBe('test');
        expect(getEnv('NOT_EXIST')).toBeUndefined();
        expect(getEnv('TEST_STRING')).toBe('AbCd');
        expect(getEnv('TEST_INT')).toBe('509');
        expect(getEnv('TEST_BOOL_TRUE')).toBe('true');

        expect(getEnv('NON_EXISTS', 'default')).toBe('default');
    })
    test('getEnvInt', () => {
        expect(getEnvInt('NODE_ENV')).toBeUndefined();
        expect(getEnvInt('NOT_EXIST')).toBeUndefined();
        expect(getEnvInt('TEST_STRING')).toBeUndefined();
        expect(getEnvInt('TEST_INT')).toBe(509);
        expect(getEnvInt('TEST_BOOL_TRUE')).toBeUndefined();

        expect(getEnvInt('NOT_EXIST', 5)).toBe(5);
    })

    test('getEnvBool', () => {
        expect(getEnvBool('NODE_ENV')).toBeUndefined();
        expect(getEnvBool('NOT_EXIST')).toBeUndefined();
        expect(getEnvBool('TEST_STRING')).toBeUndefined();
        expect(getEnvBool('TEST_INT')).toBeUndefined();
        expect(getEnvBool('TEST_BOOL_TRUE')).toBe(true);
        expect(getEnvBool('TEST_BOOL_FALSE')).toBe(false);

        expect(getEnvBool('NOT_EXIST', true)).toBe(true);
    })

})

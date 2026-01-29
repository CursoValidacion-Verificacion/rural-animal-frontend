/** @type {import('jest').Config} */
const config = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
    globalSetup: 'jest-preset-angular/global-setup',
    moduleNameMapper: {
        '@app/(.*)': '<rootDir>/src/app/$1',
        'src/environments/(.*)': '<rootDir>/src/environments/$1'
    },
    transform: {
        '^.+\\.(ts|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.html$',
            },
        ],
    },
    testEnvironment: 'jsdom',
    transformIgnorePatterns: ['node_modules/(?!@angular|@ng-bootstrap|rxjs)']
};

module.exports = config;
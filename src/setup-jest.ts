import 'jest-preset-angular/setup-jest';
import '@angular/localize/init';
import { ngMocks } from 'ng-mocks';

ngMocks.autoSpy('jest');

Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(document, 'doctype', {
    value: '<!DOCTYPE html>'
});
Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
        display: 'none',
        appearance: ['-webkit-appearance'],
        getPropertyValue: (prop: string) => ''
    })
});

Object.defineProperty(document.body.style, 'transform', {
    value: () => ({
        enumerable: true,
        configurable: true
    })
});
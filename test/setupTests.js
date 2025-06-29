import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

expect.extend(matchers); 

import { configure } from '@testing-library/react';

configure({
  testIdAttribute: 'data-testid',
  getElementError: (message) => {
    const error = new Error(message);
    error.name = 'TestingLibraryElementError';
    return error;
  },
});

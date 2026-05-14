import { render } from '@testing-library/react';
import { test } from 'vitest';
import { GlobalHeader } from '../components/layout/GlobalHeader';

test('renders GlobalHeader without crashing', () => {
    try {
        const {  } = render(<GlobalHeader />);
        console.log('SUCCESS: Rendered correctly');
    } catch (e) {
        console.error('CRASH DURING RENDER:', e);
        throw e;
    }
});

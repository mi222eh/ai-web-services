import { describe, it, expect } from 'vitest';
import Button from './button';

describe('Button component', () => {
	it('renders correctly', () => {
		const button = shallow(<Button label="Click me" />);
		expect(button.text()).toBe('Click me');
	});

	it('handles click events', async () => {
		const handleClick = vi.fn();
		const button = shallow(<Button label="Click me" onClick={handleClick} />);
		await button.simulate('click');
		expect(handleClick).toHaveBeenCalled();
	});
});
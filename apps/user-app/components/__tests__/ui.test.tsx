import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Button, ProgressBar, StatusPill } from '@sarira/ui';

describe('komponen inti SARIRA', () => {
  const consoleError = console.error;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
      if (String(message).includes('react-test-renderer is deprecated')) return;
      consoleError(message, ...args);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('menjalankan primary action dan menyediakan label aksesibel', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(<Button label="Catat hari ini" onPress={onPress} variant="lime" />);

    fireEvent.press(getByLabelText('Catat hari ini'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('mengumumkan nilai progress tanpa bergantung pada warna', () => {
    const { getByRole } = render(<ProgressBar label="Protein minimum" value={48} max={72} />);

    expect(getByRole('progressbar')).toHaveAccessibilityValue({ min: 0, max: 72, now: 48 });
  });

  it('menampilkan arti status safety sebagai teks', () => {
    const { getByText, rerender } = render(<StatusPill status="unknown" />);
    expect(getByText('Belum dapat ditentukan')).toBeTruthy();

    rerender(<StatusPill status="red" />);
    expect(getByText('Merah · perlu bantuan')).toBeTruthy();
  });
});

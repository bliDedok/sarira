import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AgePicker, Button, ConsentCard, ProgressBar, SelectionCard, StatusPill, TimePicker } from '@sarira/ui';

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

  it('menyediakan stepper usia dengan bounds dan input terstruktur', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<AgePicker label="Usia saat ini" value={12} onChange={onChange} />);
    expect(getByLabelText('Kurangi Usia saat ini')).toBeDisabled();
    fireEvent.press(getByLabelText('Tambah Usia saat ini'));
    expect(onChange).toHaveBeenCalledWith(13);
  });

  it('menyediakan pilihan besar dengan state selected dan disabled', () => {
    const onPress = jest.fn();
    const { getByLabelText, rerender } = render(<SelectionCard title="Menjaga kebiasaan sehat" selected onPress={onPress} />);
    expect(getByLabelText('Menjaga kebiasaan sehat').props.accessibilityState).toEqual({ checked: true, disabled: false });
    rerender(<SelectionCard title="Menjaga kebiasaan sehat" disabled onPress={onPress} />);
    expect(getByLabelText('Menjaga kebiasaan sehat').props).toMatchObject({ disabled: true, onPress: undefined, accessibilityState: { disabled: true } });
  });

  it('mengubah waktu tanpa keyboard QWERTY dan menampilkan consent secara utuh', () => {
    const onTimeChange = jest.fn();
    const onConsent = jest.fn();
    const { getByLabelText, getByText } = render(<><TimePicker label="Waktu tidur" value="23:00" onChange={onTimeChange} /><ConsentCard title="Kebijakan Privasi" summary="Ringkasan yang mudah dibaca." details="Penjelasan lengkap kebijakan privasi." required checked={false} onChange={onConsent} /></>);
    fireEvent.press(getByLabelText('Tambah Jam'));
    expect(onTimeChange).toHaveBeenCalledWith('00:00');
    fireEvent.press(getByText('Baca penjelasan'));
    expect(getByText('Penjelasan lengkap kebijakan privasi.')).toBeTruthy();
    fireEvent.press(getByLabelText('Saya menyetujui Kebijakan Privasi'));
    expect(onConsent).toHaveBeenCalledWith(true);
  });
});

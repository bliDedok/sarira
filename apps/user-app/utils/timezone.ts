export function localDateTimeToIso(localDate: string, time: string, timezone: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) throw new Error('Gunakan format waktu HH:mm.');
  const [year, month, day] = localDate.split('-').map(Number);
  const hour = Number(match[1]); const minute = Number(match[2]);
  if (!year || !month || !day || hour > 23 || minute > 59) throw new Error('Tanggal atau waktu tidak valid.');
  const targetAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  let guess = targetAsUtc;
  for (let iteration = 0; iteration < 2; iteration += 1) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(guess)).map((part) => [part.type, part.value]));
    const represented = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
    guess -= represented - targetAsUtc;
  }
  return new Date(guess).toISOString();
}

export function isoToLocalTime(value: string | undefined, timezone: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat('id-ID', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(value)).replace('.', ':');
}

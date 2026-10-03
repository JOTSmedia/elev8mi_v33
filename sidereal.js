// sidereal.js — ELEV8MI v33 extra (drop-in ES module, no dependencies).
//
// siderealAngle(date, lonDeg = -74.006) -> local sidereal angle in RADIANS, 0..2π.
//   The rotation angle of the sky about the celestial pole for an observer at
//   east longitude lonDeg (west negative; -74.006 = New York City).
//   Degrees: siderealAngleDeg(date, lonDeg) -> 0..360.  Hours: divide degrees by 15.
//
// Formula: IAU 1982 GMST (Meeus, Astronomical Algorithms, eq. 12.4), from the
// Julian date of the instant (UT; JS Date is UTC, UT1-UTC < 0.9 s is ignored):
//   GMST° = 280.46061837 + 360.98564736629·(JD − 2451545.0)
//           + 0.000387933·T² − T³/38 710 000,   T = (JD − 2451545.0)/36525
//   LST°  = GMST° + lonDeg   (normalized to 0..360, then radians)
// Accuracy ~0.1 s of time over 1900–2100, far beyond what the scene needs.
//
// Node check:  node sidereal.js   (compares against Meeus examples 12.a/12.b)

const TAU = Math.PI * 2;

export function julianDate(date) {
  return (date instanceof Date ? date.getTime() : +date) / 86400000 + 2440587.5;
}

export function gmstDeg(date) {
  const d = julianDate(date) - 2451545.0, T = d / 36525;
  const g = 280.46061837 + 360.98564736629 * d + 0.000387933 * T * T - (T * T * T) / 38710000;
  return ((g % 360) + 360) % 360;
}

export function siderealAngleDeg(date = new Date(), lonDeg = -74.006) {
  return (((gmstDeg(date) + lonDeg) % 360) + 360) % 360;
}

export function siderealAngle(date = new Date(), lonDeg = -74.006) {
  const r = siderealAngleDeg(date, lonDeg) * Math.PI / 180;
  return r >= TAU ? r - TAU : r;
}

export default siderealAngle;

// ---- quick self-check when run directly with node ----
if (typeof process !== 'undefined' && process.argv?.[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const hms = deg => { const h = deg / 15, H = Math.floor(h), m = Math.floor((h - H) * 60), s = ((h - H) * 60 - m) * 60; return `${H}h${String(m).padStart(2, '0')}m${s.toFixed(4)}s`; };
  const cases = [
    // Meeus Example 12.a: 1987-04-10 0h UT  -> GMST 13h10m46.3668s = 197.693195°
    ['Meeus 12.a', new Date(Date.UTC(1987, 3, 10, 0, 0, 0)), 197.693195],
    // Meeus Example 12.b: 1987-04-10 19:21:00 UT -> GMST 8h34m57.0896s = 128.7378734°
    ['Meeus 12.b', new Date(Date.UTC(1987, 3, 10, 19, 21, 0)), 128.7378734],
    // J2000.0 epoch: 2000-01-01 12:00 UT -> GMST 280.46061837°
    ['J2000.0', new Date(Date.UTC(2000, 0, 1, 12, 0, 0)), 280.46061837],
  ];
  let ok = true;
  for (const [label, date, ref] of cases) {
    const g = siderealAngleDeg(date, 0), err = Math.abs(((g - ref + 540) % 360) - 180) * 240; // seconds of time
    ok &&= err < 0.05;
    console.log(`${label}: GMST ${g.toFixed(6)}° (${hms(g)}) ref ${ref}°  err ${err.toFixed(4)} s  ${err < 0.05 ? 'OK' : 'FAIL'}`);
  }
  const now = new Date();
  console.log(`Now ${now.toISOString()} New York City (-74.006°) LST ${siderealAngleDeg(now).toFixed(4)}° = ${siderealAngle(now).toFixed(6)} rad (${hms(siderealAngleDeg(now))})`);
  console.log(ok ? 'ALL OK' : 'CHECK FAILED');
  process.exitCode = ok ? 0 : 1;
}

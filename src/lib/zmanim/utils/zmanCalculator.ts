export function calculateIntermediateValues(day: Date, longitude: number) {
  const lon = -longitude;
  const averageMidday = lon * 4;

  const epoch = new Date(2000, 0, 1);
  const diffMs = day.getTime() - epoch.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const numberOfDays = Math.trunc(diffDays);

  const totalHours  = averageMidday / 60;
  const hour        = Math.round(totalHours);
  const minute      = Math.round((totalHours - hour) * 60);
  const second      = Math.round(((totalHours - hour) * 60 - minute) * 60);

  const avgMidFrac = hour/24 + minute/1440 + second/86400;
  const daysSince  = numberOfDays - avgMidFrac;

  const l0 = 280.461 + 0.9856474 * daysSince;
  const L  = l0 % 360;

  const g0 = 357.528 + 0.9856003 * daysSince;
  const G  = g0 % 360;

  const lambda0 = L
    + 1.915 * Math.sin(G * Math.PI/180)
    + 0.02  * Math.sin(2 * G * Math.PI/180);
  const lambda  = lambda0 % 360;

  const epsilon = 23.44;

  let alpha = Math.atan(
    Math.tan(lambda * Math.PI/180) * Math.cos(epsilon * Math.PI/180)
  ) * 180/Math.PI;
  if (alpha > 0) alpha = alpha % 180;
  while (alpha < 0) alpha += 180;

  let E = (alpha - L) * 4;
  E = E % 60
  while (E < -20) E += 60;

  const delta = Math.asin(
    Math.sin(lambda * Math.PI/180) * Math.sin(epsilon * Math.PI/180)
  ) * 180/Math.PI;

  return { E, G, L, alpha, delta, epsilon, lambda, averageMidday };
}

export function calculateMidday(day: Date, shift: number, longitude: number): Date {
  const { averageMidday, E } = calculateIntermediateValues(day, longitude);
  const hatzotOffsetMin = (12 * 60 - averageMidday) + shift * 60 + E;
  const hatzotOffsetMs = Math.trunc(hatzotOffsetMin * 60 * 1000);
  return new Date(day.getTime() + hatzotOffsetMs);
}

export function calculateOffsetOfAngle(angle: number, day: Date, latitude: number, longitude: number): number {
  const { delta } = calculateIntermediateValues(day, longitude);

  const sinDeg = (d: number) => Math.sin(d * Math.PI/180);
  const cosDeg = (d: number) => Math.cos(d * Math.PI/180);

  const numerator   = sinDeg(angle) - sinDeg(latitude) * sinDeg(delta);
  const denominator = cosDeg(latitude) * cosDeg(delta);
  const arcRad      = Math.acos(numerator / denominator);
  const arcDeg      = arcRad * 180 / Math.PI;
  const hoursOffset = arcDeg / 15;

  return Math.trunc(hoursOffset * 60 * 60 * 1000);
}

export function calculateZmanInputs(day: Date, shift: number, latitude: number, longitude: number) {
  const chatzot = calculateMidday(day, shift, longitude);
  const chatzotHaLayla = new Date(chatzot.getTime() + 12 * 60 * 60 * 1000);  

  const alot90OffsetMs      = calculateOffsetOfAngle(-19.75, day, latitude, longitude);
  const alot90 = new Date(chatzot.getTime() - alot90OffsetMs);

  const alot72OffsetMs = calculateOffsetOfAngle(-15.99, day, latitude, longitude);
  const alot72 = new Date(chatzot.getTime() - alot72OffsetMs);

  const talitTefillinOffsetMs = calculateOffsetOfAngle(-11.5, day, latitude, longitude);
  const talitTefillin = new Date(chatzot.getTime() - talitTefillinOffsetMs);

  const zrichaOffsetMs = calculateOffsetOfAngle(-0.8333, day, latitude, longitude);
  const zricha = new Date(chatzot.getTime() - zrichaOffsetMs);
  
  const shkiyaMs = chatzot.getTime() + (chatzot.getTime() - zricha.getTime());
  const shkiya   = new Date(shkiyaMs);
  
  const tzaitOffsetMs = calculateOffsetOfAngle(-4.65, day, latitude, longitude);
  const tzait           = new Date(chatzot.getTime() + tzaitOffsetMs);
  const tzait90         = new Date(chatzot.getTime() + (chatzot.getTime() - alot72.getTime()));
  
  const shaaZmanitGra = (chatzot.getTime() - zricha.getTime()) / 6;
  const shaaZmanitMagenAvraham = (chatzot.getTime() - alot72.getTime()) / 6;
  
  const sofZmanShemaMGA  = new Date(alot72.getTime() + shaaZmanitMagenAvraham * 3);
  const sofZmanShemaGRA  = new Date(zricha.getTime()   + shaaZmanitGra            * 3);
  const sofZmanTefilaMGA = new Date(alot72.getTime() + shaaZmanitMagenAvraham * 4);
  const sofZmanTefilaGRA = new Date(zricha.getTime()   + shaaZmanitGra            * 4);
  const musafGRA = new Date(zricha.getTime() + shaaZmanitGra * 7);
  const startOfTenthHourGRA = new Date(zricha.getTime() + shaaZmanitGra * 9);
  const startOfTenthHourMGA = new Date(alot72.getTime() + shaaZmanitMagenAvraham * 9);
  const fourthHourGRA = new Date(zricha.getTime() + shaaZmanitGra * 4);
  const fourthHourMGA = new Date(alot72.getTime() + shaaZmanitMagenAvraham * 4);
  const fifthHourGRA = new Date(zricha.getTime() + shaaZmanitGra * 5);
  const fifthHourMGA = new Date(alot72.getTime() + shaaZmanitMagenAvraham * 5);
  
  const minchaGedola = new Date(zricha.getTime() + shaaZmanitGra * 6.5);
  const minchaKetana = new Date(zricha.getTime() + shaaZmanitGra * 9.5); 
  const plagMincha = new Date(shkiya.getTime() - shaaZmanitGra * 1.25);

  return { 
    alot90, 
    alot72,
    talitTefillin,
    zricha,
    sofZmanTefilaGRA,
    sofZmanShemaMGA,
    sofZmanShemaGRA,
    sofZmanTefilaMGA,
    musafGRA,
    startOfTenthHourGRA,
    startOfTenthHourMGA,
    fourthHourGRA,
    fourthHourMGA,
    fifthHourGRA,
    fifthHourMGA,
    minchaGedola,
    minchaKetana,
    shkiya,
    chatzot,
    plagMincha,
    tzait,
    tzait90,
    chatzotHaLayla,          
  };
}


const tgl = document.getElementById('temp-toggle');
let isC = true;

const tVals = {
  main: 26,
  high: 27,
  low: 10,
  feels: 26,
  hourly: [20, 21, 20, 19, 18, 18],
  tmr: 14
};

tgl.addEventListener('change', () => {
  isC = tgl.checked;
  updateTemps();
});

function updateTemps() {
  const unit = isC ? 'C' : 'F';
  
  const tv = document.querySelector('.temp-value');
  const tu = document.querySelector('.temp-unit');
  const mainT = isC ? tVals.main : Math.round((tVals.main * 9/5) + 32);
  tv.textContent = mainT;
  tu.textContent = unit;

  const hl = document.querySelector('.hi-low');
  const h = isC ? tVals.high : Math.round((tVals.high * 9/5) + 32);
  const l = isC ? tVals.low : Math.round((tVals.low * 9/5) + 32);
  hl.textContent = `High: ${h}° Low: ${l}°`;

  const fl = document.querySelector('.feels-like');
  const f = isC ? tVals.feels : Math.round((tVals.feels * 9/5) + 32);
  fl.textContent = `Feels like ${f}°`;

  const hTemps = document.querySelectorAll('.hour-pill .temp');
  hTemps.forEach((el, i) => {
    const t = isC ? tVals.hourly[i] : Math.round((tVals.hourly[i] * 9/5) + 32);
    el.textContent = t + '°';
  });

  const tmrT = document.querySelector('.tomorrow-right span:first-child');
  const tmr = isC ? tVals.tmr : Math.round((tVals.tmr * 9/5) + 32);
  tmrT.textContent = tmr + '°';
}

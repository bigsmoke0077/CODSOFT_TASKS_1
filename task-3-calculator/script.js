// Simple calculator: no eval(), just state + event listeners.
const screen = document.getElementById('screen');
const historyEl = document.getElementById('history');
const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

let current = '0';      // number being typed (string)
let previous = null;    // stored first operand (number)
let operator = null;    // pending operator
let justEvaluated = false;
let error = false;

function format(value) {
  // Round to avoid 0.1 + 0.2 = 0.30000000000000004
  return String(parseFloat(Number(value).toPrecision(12)));
}

function update() {
  screen.textContent = current;
  historyEl.textContent = previous !== null && operator ? `${format(previous)} ${symbols[operator]}` : '';
  document.querySelectorAll('.op').forEach(b => b.classList.toggle('active', b.dataset.op === operator && !justEvaluated && current === '0' && previous !== null));
}

function calculate(a, b, op) {
  if (op === '+') return a + b;
  else if (op === '-') return a - b;
  else if (op === '*') return a * b;
  else if (op === '/') return b === 0 ? NaN : a / b;
  return b;
}

function showError() {
  current = 'Cannot divide by 0';
  previous = null; operator = null; error = true;
}

function inputNumber(n) {
  if (error) clearAll();
  if (justEvaluated) { current = '0'; justEvaluated = false; }
  if (current === '0') current = n;
  else if (current.replace(/[-.]/g, '').length < 14) current += n;
  update();
}

function inputDecimal() {
  if (error) clearAll();
  if (justEvaluated) { current = '0'; justEvaluated = false; }
  if (!current.includes('.')) current += '.';
  update();
}

function chooseOperator(op) {
  if (error) return;
  if (operator && previous !== null && !justEvaluated && current !== '') {
    const result = calculate(previous, parseFloat(current), operator);
    if (Number.isNaN(result)) { showError(); update(); return; }
    previous = result;
  } else {
    previous = parseFloat(current);
  }
  operator = op;
  current = '0';
  justEvaluated = false;
  update();
}

function equals() {
  if (error || operator === null || previous === null) return;
  const result = calculate(previous, parseFloat(current), operator);
  if (Number.isNaN(result)) { showError(); update(); return; }
  historyEl.textContent = `${format(previous)} ${symbols[operator]} ${current} =`;
  current = format(result);
  previous = null; operator = null; justEvaluated = true;
  screen.textContent = current;
  document.querySelectorAll('.op').forEach(b => b.classList.remove('active'));
}

function clearAll() {
  current = '0'; previous = null; operator = null; justEvaluated = false; error = false;
  update();
}

function deleteLast() {
  if (error || justEvaluated) return clearAll();
  current = current.length > 1 ? current.slice(0, -1) : '0';
  update();
}

function percent() {
  if (error) return;
  current = format(parseFloat(current) / 100);
  update();
}

// Button clicks (event delegation)
document.querySelector('.keys').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.dataset.num !== undefined) inputNumber(btn.dataset.num);
  else if (btn.dataset.op) chooseOperator(btn.dataset.op);
  else if (btn.dataset.action === 'decimal') inputDecimal();
  else if (btn.dataset.action === 'equals') equals();
  else if (btn.dataset.action === 'clear') clearAll();
  else if (btn.dataset.action === 'delete') deleteLast();
  else if (btn.dataset.action === 'percent') percent();
});

// Keyboard support
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') inputNumber(e.key);
  else if (['+', '-', '*', '/'].includes(e.key)) { e.preventDefault(); chooseOperator(e.key); }
  else if (e.key === '.') inputDecimal();
  else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); equals(); }
  else if (e.key === 'Backspace') deleteLast();
  else if (e.key === 'Escape') clearAll();
  else if (e.key === '%') percent();
});

update();

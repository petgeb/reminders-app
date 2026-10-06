const KEY = 'reminders.v1';
let items = load();
let filter = 'all';

const $ = (id) => document.getElementById(id);

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
}

function fmt(due) {
  return new Date(due).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function render() {
  const list = $('list');
  list.replaceChildren();
  const shown = items
    .filter((i) => filter === 'all' || (filter === 'done') === i.done)
    .sort((a, b) => (a.done - b.done) || (a.due || '9').localeCompare(b.due || '9'));
  for (const i of shown) {
    const li = document.createElement('li');
    li.className = (i.done ? 'done ' : '') + (!i.done && i.due && new Date(i.due) < new Date() ? 'overdue' : '');

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = i.done;
    cb.onchange = () => { i.done = cb.checked; save(); render(); };

    const body = document.createElement('div');
    body.className = 'body';
    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = i.text;
    body.append(title);
    if (i.due) {
      const due = document.createElement('span');
      due.className = 'due';
      due.textContent = fmt(i.due);
      body.append(due);
    }

    const del = document.createElement('button');
    del.className = 'del';
    del.textContent = '×';
    del.title = 'Delete';
    del.onclick = () => { items = items.filter((x) => x !== i); save(); render(); };

    li.append(cb, body, del);
    list.append(li);
  }
  $('empty').hidden = shown.length > 0;
}

$('add-form').onsubmit = (e) => {
  e.preventDefault();
  items.push({ id: Date.now(), text: $('text').value.trim(), due: $('due').value || null, done: false, notified: false });
  e.target.reset();
  save();
  render();
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
};

$('filters').onclick = (e) => {
  if (!e.target.dataset.filter) return;
  filter = e.target.dataset.filter;
  document.querySelectorAll('#filters button').forEach((b) => b.classList.toggle('active', b === e.target));
  render();
};

// Notify once when a reminder comes due while the page is open.
function checkDue() {
  const now = new Date();
  let changed = false;
  for (const i of items) {
    if (i.done || i.notified || !i.due || new Date(i.due) > now) continue;
    i.notified = true;
    changed = true;
    if ('Notification' in window && Notification.permission === 'granted') new Notification('Reminder', { body: i.text });
  }
  if (changed) { save(); render(); }
}
setInterval(checkDue, 15000);

render();
checkDue();

const header = document.querySelector('.header');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const TELEGRAM_USERNAME = 'Trifon_Koss_W';

document.querySelectorAll('[data-telegram-link]').forEach((link) => {
  link.href = `https://t.me/${TELEGRAM_USERNAME}`;
  link.hidden = false;
});

const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  navToggle.setAttribute('aria-label', open ? 'Открыть меню' : 'Закрыть меню');
  nav.classList.toggle('is-open', !open);
});

nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Открыть меню');
  }
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px' });
  revealItems.forEach((item) => observer.observe(item));
}

const form = document.querySelector('#request-form');
const modal = document.querySelector('#request-result');
const output = document.querySelector('#request-text');
const copyButton = document.querySelector('#copy-request');
const copyStatus = document.querySelector('#copy-status');
const submitButton = document.querySelector('#submit-request');
const submitButtonContent = submitButton.innerHTML;
let previouslyFocused = null;
let isSubmitting = false;

function resetSubmitState() {
  isSubmitting = false;
  submitButton.disabled = false;
  submitButton.removeAttribute('aria-busy');
  submitButton.innerHTML = submitButtonContent;
}

function validateForm() {
  let valid = true;
  form.querySelectorAll('.field').forEach((field) => {
    const control = field.querySelector('input[required], textarea[required]');
    if (!control) return;
    const isValid = control.value.trim().length > 0;
    field.classList.toggle('invalid', !isValid);
    control.setAttribute('aria-invalid', String(!isValid));
    if (!isValid) valid = false;
  });

  return valid;
}

form.addEventListener('input', (event) => {
  const field = event.target.closest('.field');
  if (field && event.target.value.trim()) {
    field.classList.remove('invalid');
    event.target.setAttribute('aria-invalid', 'false');
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (isSubmitting) return;
  if (!validateForm()) {
    form.querySelector('.invalid input, .invalid textarea')?.focus();
    return;
  }

  isSubmitting = true;
  submitButton.disabled = true;
  submitButton.setAttribute('aria-busy', 'true');
  submitButton.textContent = 'Открываю Telegram…';

  const data = new FormData(form);
  const lines = [
    'Здравствуйте! Хочу обсудить задачу.',
    '',
    `Имя: ${data.get('name')}`,
    'Описание задачи:',
    data.get('task'),
    '',
    `Желаемый срок: ${data.get('deadline') || 'не указан'}`,
    `Исходные материалы: ${data.get('files') || 'не указано'}`
  ];
  output.value = lines.join('\n');
  const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(output.value)}`;
  let telegramWindow = null;
  try {
    telegramWindow = window.open(telegramUrl, '_blank');
  } catch {
    telegramWindow = null;
  }
  if (telegramWindow) telegramWindow.opener = null;
  if (!telegramWindow) {
    previouslyFocused = submitButton;
    resetSubmitState();
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('.modal__close').focus();
  } else {
    window.setTimeout(resetSubmitState, 1200);
  }
});

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  previouslyFocused?.focus();
}

modal.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModal));

copyButton.addEventListener('click', async () => {
  let copied = false;
  try {
    await navigator.clipboard.writeText(output.value);
    copied = true;
  } catch {
    output.select();
    copied = document.execCommand('copy');
  }
  const oldText = copyButton.innerHTML;
  copyButton.disabled = true;
  copyButton.textContent = copied ? 'Обращение скопировано' : 'Не удалось скопировать';
  copyStatus.textContent = copied ? 'Обращение скопировано в буфер обмена.' : 'Не удалось скопировать обращение. Выделите текст вручную.';
  setTimeout(() => {
    copyButton.innerHTML = oldText;
    copyButton.disabled = false;
  }, 1800);
});

document.querySelector('#year').textContent = new Date().getFullYear();

const caseModal = document.querySelector('#case-modal');
const caseTitle = document.querySelector('#case-title');
const caseDescription = document.querySelector('#case-description');
const caseDetail = document.querySelector('#case-detail');
const caseResultText = document.querySelector('#case-result-text');

const cases = {
  table: {
    title: 'Таблица: до и после',
    description: 'Демонстрация обработки условного списка заказов без использования клиентских данных.',
    result: 'Единый формат, понятные статусы, итоговые суммы и таблица, которую удобно фильтровать.',
    detail: `<div class="compare"><div><b>До</b><div class="demo-sheet demo-sheet--messy"><span>12.07 / Анна / 3500</span><span>иван; 900; ждет</span><span>14-7 Мария 1 200 ₽</span><span>?? / Пётр / готово</span></div></div><div><b>После</b><table class="demo-table"><thead><tr><th>Клиент</th><th>Сумма</th><th>Статус</th></tr></thead><tbody><tr><td>Анна</td><td>3 500 ₽</td><td><i>Готово</i></td></tr><tr><td>Иван</td><td>900 ₽</td><td>В работе</td></tr><tr><td>Мария</td><td>1 200 ₽</td><td>В работе</td></tr></tbody></table></div></div>`
  },
  doc: {
    title: 'Оформление документа',
    description: 'Пример превращения неструктурированного текста в аккуратный документ для отправки и печати.',
    result: 'Настроены заголовки, поля, интервалы, нумерация и единое оформление. Подготовлены Word и PDF.',
    detail: `<div class="compare"><div><b>До</b><div class="demo-doc demo-doc--before"><h4>ОТЧЕТ ЗА МЕСЯЦ</h4><p>результаты работы</p><p>В этом месяце были выполнены основные задачи проекта далее приводится список выполненных работ...</p><p>1) документы 2) таблицы 3) каталог</p></div></div><div><b>После</b><div class="demo-doc demo-doc--after"><small>ЕЖЕМЕСЯЧНЫЙ ОТЧЁТ</small><h4>Результаты работы</h4><i></i><p>Краткое резюме выполненных задач и результатов за отчётный период.</p><ol><li>Документы</li><li>Таблицы</li><li>Каталог</li></ol></div></div></div>`
  },
  slides: {
    title: 'Переработка презентации',
    description: 'Демонстрационный слайд: исходный материал разделён на смысловые уровни и собран в ясную композицию.',
    result: 'Один слайд — одна мысль, читаемая типографика и единая визуальная система.',
    detail: `<div class="compare compare--slides"><div><b>До</b><div class="demo-slide demo-slide--before"><h4>НАШИ ПРЕИМУЩЕСТВА И РЕЗУЛЬТАТЫ</h4><p>Качество Надежность Скорость Индивидуальный подход Большой опыт Работа в срок</p></div></div><div><b>После</b><div class="demo-slide demo-slide--after"><small>Почему мы</small><h4>Порядок<br>в каждой задаче</h4><div><span>01</span><p>Понятный процесс</p></div><div><span>02</span><p>Результат в срок</p></div></div></div></div>`
  },
  folders: {
    title: 'Организация файлов',
    description: 'Пример структуры для небольшого проекта с документами, визуальными материалами и итоговыми версиями.',
    result: 'Понятные названия, единая логика папок и отдельное место для актуальных финальных файлов.',
    detail: `<div class="compare"><div><b>До</b><div class="demo-files demo-files--before"><span>новая папка 2</span><span>финал.docx</span><span>финал2.docx</span><span>IMG_4839.jpg</span><span>точно_финал.pdf</span></div></div><div><b>После</b><div class="demo-files demo-files--after"><span>📁 01_Исходники</span><span>　📁 Документы</span><span>　📁 Изображения</span><span>📁 02_Рабочие</span><span>📁 03_Готово</span><span>　✓ Отчёт_2026-07.pdf</span></div></div></div>`
  }
};

document.querySelectorAll('[data-case]').forEach((button) => {
  button.addEventListener('click', () => {
    const item = cases[button.dataset.case];
    if (!item) return;
    caseTitle.textContent = item.title;
    caseDescription.textContent = item.description;
    caseDetail.innerHTML = item.detail;
    caseResultText.textContent = item.result;
    previouslyFocused = button;
    caseModal.hidden = false;
    document.body.classList.add('modal-open');
    caseModal.querySelector('.modal__close').focus();
  });
});

function closeCaseModal() {
  caseModal.hidden = true;
  document.body.classList.remove('modal-open');
  previouslyFocused?.focus();
}

caseModal.querySelectorAll('[data-close-case]').forEach((button) => button.addEventListener('click', closeCaseModal));

function trapFocus(event, activeModal) {
  const focusable = [...activeModal.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hidden && element.offsetParent !== null);
  if (!focusable.length) {
    event.preventDefault();
    activeModal.querySelector('.modal__card').focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!caseModal.hidden) closeCaseModal();
    else if (!modal.hidden) closeModal();
    else if (nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Открыть меню');
      navToggle.focus();
    }
    return;
  }
  if (event.key === 'Tab') {
    if (!caseModal.hidden) trapFocus(event, caseModal);
    else if (!modal.hidden) trapFocus(event, modal);
  }
});

const mobileCta = document.querySelector('#mobile-cta');
const requestSection = document.querySelector('#request');
if (mobileCta && requestSection) {
  let requestVisible = false;
  const updateMobileCta = () => {
    mobileCta.classList.toggle('is-hidden', window.scrollY < 480 || requestVisible);
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      requestVisible = entry.isIntersecting;
      updateMobileCta();
    }, { threshold: 0.05 }).observe(requestSection);
  }
  updateMobileCta();
  window.addEventListener('scroll', updateMobileCta, { passive: true });
}

/* ---------- Склонение и форматирование ---------- */
const plural = (n, forms) => {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
};
const formatRub = (n) => n.toLocaleString('ru-RU').replace(/ |,/g, ' ');

/* ---------- Логотип: покачивание по клику ---------- */
document.querySelectorAll('.brand').forEach((brand) => {
  const logo = brand.querySelector('.brand__logo');
  if (!logo) return;
  brand.addEventListener('click', (event) => {
    const href = brand.getAttribute('href');
    if (href === '#top') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    }
    logo.classList.remove('is-wiggle');
    void logo.getBoundingClientRect();
    logo.classList.add('is-wiggle');
  });
  logo.addEventListener('animationend', () => logo.classList.remove('is-wiggle'));
});

/* ---------- Счётчик рутины ---------- */
const routine = document.querySelector('[data-routine]');
if (routine) {
  const range = routine.querySelector('input[type="range"]');
  const value = routine.querySelector('[data-routine-value]');
  const result = routine.querySelector('[data-routine-result]');
  const updateRoutine = () => {
    const perWeek = Number(range.value);
    const perYear = perWeek * 52;
    const days = Math.round(perYear / 8);
    value.textContent = `${perWeek} ч`;
    range.style.setProperty('--fill', `${((perWeek - range.min) / (range.max - range.min)) * 100}%`);
    result.innerHTML = `Это около <strong>${perYear} ${plural(perYear, ['часа', 'часов', 'часов'])}</strong> в год — примерно <strong>${days} ${plural(days, ['рабочий день', 'рабочих дня', 'рабочих дней'])}</strong>.`;
  };
  range.addEventListener('input', updateRoutine);
  updateRoutine();
}

/* ---------- Калькулятор стоимости ---------- */
const calc = document.querySelector('[data-calc]');
if (calc) {
  const boxes = [...calc.querySelectorAll('input[type="checkbox"]')];
  const sumEl = calc.querySelector('[data-calc-sum]');
  const send = calc.querySelector('[data-calc-send]');
  const updateCalc = () => {
    const picked = boxes.filter((box) => box.checked);
    const total = picked.reduce((sum, box) => sum + Number(box.dataset.price), 0);
    if (!picked.length) {
      sumEl.textContent = 'Выберите задачи';
      sumEl.classList.add('is-empty');
      send.setAttribute('aria-disabled', 'true');
      send.href = `https://t.me/${TELEGRAM_USERNAME}`;
      return;
    }
    sumEl.textContent = `от ${formatRub(total)} ₽`;
    sumEl.classList.remove('is-empty', 'is-bump');
    void sumEl.offsetWidth;
    sumEl.classList.add('is-bump');
    send.setAttribute('aria-disabled', 'false');
    const message = [
      'Здравствуйте! Посчитал(а) на сайте примерную стоимость.',
      '',
      'Что нужно:',
      ...picked.map((box) => `— ${box.value}`),
      '',
      `Ориентир по прайсу: от ${formatRub(total)} ₽`,
      'Хочу уточнить точную цену и срок.'
    ].join('\n');
    send.href = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
  };
  boxes.forEach((box) => box.addEventListener('change', updateCalc));
  updateCalc();
}

/* ---------- Живая доска задач ---------- */
const board = document.querySelector('[data-live-board]');
if (board && !reducedMotion) {
  const list = board.querySelector('[data-board-list]');
  const count = board.querySelector('[data-board-count]');
  const pool = [
    ['i-slides', 'Подготовить презентацию', 'Единый стиль и логика слайдов'],
    ['i-table', 'Из фотографий в таблицу', 'Данные перенесены и проверены'],
    ['i-search', 'Собрать список конкурентов', 'Открытые источники, сравнение'],
    ['i-brief', 'Оформить прайс', 'Аккуратный PDF для клиентов'],
    ['i-doc', 'Оформить документ', 'Готово в Word и PDF'],
    ['i-folder', 'Рассортировать файлы', 'Понятная система папок'],
    ['i-table', 'Привести таблицу в порядок', 'Структура, формулы, оформление']
  ];
  let poolIndex = 0;
  let visible = true;
  let slot = 92;
  const GAP = 10;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const whenVisible = async () => { while (!visible || document.hidden) await sleep(300); };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(board);
  }

  // Переводим список в режим абсолютного позиционирования: дальше двигаем только transform и opacity
  let cards = [...list.querySelectorAll('.task-card')];
  const place = (card, index, extra = '') => {
    card.style.transform = `translate3d(0, ${index * slot}px, 0)${extra}`;
  };
  const measure = () => {
    list.classList.remove('is-live');
    cards.forEach((card) => { card.style.transform = ''; });
    slot = cards[0].offsetHeight + GAP;
    list.style.setProperty('--list-h', `${slot * 3 - GAP}px`);
    list.classList.add('is-live');
    cards.forEach((card, index) => place(card, index));
  };
  measure();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 150);
  });

  const progressParts = (card) => ({
    label: card.querySelector('.task-card__progress'),
    bar: card.querySelector('.task-card__bar')
  });

  // Полоса двигается CSS-переходом (на видеокарте), цифры обновляются только при смене значения
  const runProgress = (card, from, duration) => new Promise((resolve) => {
    const { label, bar } = progressParts(card);
    bar.style.transition = 'none';
    bar.style.setProperty('--s', from / 100);
    void bar.offsetWidth;
    bar.style.transition = `transform ${duration}ms cubic-bezier(.33,0,.25,1)`;
    bar.style.setProperty('--s', 1);
    const start = performance.now();
    let shown = -1;
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 2.2);
      const value = Math.round(from + (100 - from) * eased);
      if (value !== shown) { label.textContent = `${value}%`; shown = value; }
      if (t < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });

  const markDone = (card) => {
    const { label, bar } = progressParts(card);
    label.remove();
    bar.remove();
    card.classList.replace('task-card--muted', 'task-card--done');
    card.insertAdjacentHTML('beforeend', '<span class="task-card__check"><svg><use href="#i-check"/></svg></span>');
  };

  const makeCard = ([icon, title, note]) => {
    const card = document.createElement('article');
    card.className = 'task-card task-card--muted';
    card.innerHTML = `<span class="task-card__icon"><svg><use href="#${icon}"/></svg></span><span><strong>${title}</strong><small>${note}</small></span><span class="task-card__progress">0%</span><span class="task-card__bar" style="--s:0"></span>`;
    return card;
  };

  const run = async () => {
    let active = cards[0];
    active.insertAdjacentHTML('beforeend', '<span class="task-card__bar"></span>');
    progressParts(active).bar.style.setProperty('--s', .6);
    await sleep(1400);
    let from = 60;
    for (;;) {
      await whenVisible();
      await runProgress(active, from, from === 0 ? 3400 : 1700);
      markDone(active);
      count.textContent = '3 из 3 готово';
      await sleep(1800);
      await whenVisible();

      // Новая карточка появляется сверху, остальные съезжают вниз, нижняя растворяется
      const next = makeCard(pool[poolIndex++ % pool.length]);
      next.style.transition = 'none';
      next.style.opacity = '0';
      place(next, 0, ' scale(.96)');
      next.style.transform = `translate3d(0, -14px, 0) scale(.96)`;
      list.prepend(next);
      await nextFrame();
      next.style.transition = '';

      const leaving = cards[cards.length - 1];
      cards = [next, ...cards.slice(0, -1)];
      cards.forEach((card, index) => place(card, index));
      next.style.opacity = '1';
      leaving.style.zIndex = '0';
      leaving.style.opacity = '0';
      leaving.style.transform = `translate3d(0, ${2 * slot + 16}px, 0) scale(.96)`;
      setTimeout(() => leaving.remove(), 750);

      count.textContent = '2 из 3 готово';
      active = next;
      from = 0;
      await sleep(900);
    }
  };
  run();
}

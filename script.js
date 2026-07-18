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
let previouslyFocused = null;

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
  if (field && event.target.value.trim()) field.classList.remove('invalid');
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validateForm()) {
    form.querySelector('.invalid input, .invalid textarea, .consent.invalid input')?.focus();
    return;
  }

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
  const telegramWindow = window.open(telegramUrl, '_blank');
  if (telegramWindow) telegramWindow.opener = null;
  if (!telegramWindow) {
    previouslyFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('.modal__close').focus();
  }
});

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  previouslyFocused?.focus();
}

modal.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModal));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) closeModal();
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(output.value);
  } catch {
    output.select();
    document.execCommand('copy');
  }
  const oldText = copyButton.innerHTML;
  copyButton.textContent = 'Текст скопирован';
  setTimeout(() => { copyButton.innerHTML = oldText; }, 1800);
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
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !caseModal.hidden) closeCaseModal();
});

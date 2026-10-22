import { createConceptMap } from '/prototypes/shared/map.js';
const params = new URLSearchParams(location.search);
const locale = params.get('lang') === 'ar' ? 'ar' : 'en';
const theme = params.get('theme') === 'light' ? 'light' : 'dark';
const ar = locale === 'ar';
document.documentElement.lang = locale;
document.documentElement.dir = ar ? 'rtl' : 'ltr';
document.documentElement.dataset.theme = theme;
const translations = {
  arrival: 'البداية',
  explore: 'استكشف الخريطة',
  private: 'مكتبك العقاري الخاص',
  eyebrow: 'آفاق واسعة. اختيارات تشبهك.',
  headline1: 'حياتك.',
  headline2: 'في مكان يشبهك.',
  intro: 'بين حياتك اليوم وما تتطلع إليه،<br>مكان يستحق أن تجده.',
  discover: 'لنكتشفه معاً',
  looking: 'وجهتك الأولى',
  coast: 'دبي · الخليج العربي',
  concierge: 'مستشارك العقاري الخاص',
  mapTitle: 'لنبدأ بما<br>يعني لك الكثير.',
  userMessage: 'حياة أهدأ، على البحر.<br>ومكان يجمعنا كلنا.',
  response: 'لنبدأ بالساحل. أمامك ثلاث وجهات على الخريطة، لكل منها طابعها الخاص.',
  brief: 'ملامح اختيارك',
  family: 'حياة العائلة',
  waterfront: 'قرب البحر',
  quiet: 'خصوصية وهدوء',
  briefNote: 'هذه المحادثة لك وحدك.',
  story: 'اكتشف الساحل',
  palm: 'نخلة جميرا',
  saadiyat: 'جزيرة السعديات',
  sahel: 'الساحل الشمالي',
  perspective: 'وجهة تستحق التأمل',
  project: 'دار الموج',
  projectPlace: 'مسكن افتراضي · نخلة جميرا',
  fit: 'مساحة تجمع العائلة.<br>وحياة أقرب إلى البحر.',
  consider: 'ما يستحق الانتباه',
  tradeoff: 'السكن على الجزيرة يعني رحلة أطول إلى قلب المدينة.',
  closer: 'لنلقِ نظرة أقرب',
  demoNote: 'دراسة تصميمية · موقع تقريبي للتوضيح',
  label: 'صف لنا الحياة التي تتطلع إليها',
  discreet: 'خصوصيتك أولاً. والاختيار لك.',
  try: 'جرّب',
  example: '«صيف على الساحل الشمالي»',
  concept: 'التصوّر ٠١ / نوير السينمائي',
  markets: 'دبي · أبوظبي · مصر',
};
if (ar)
  document
    .querySelectorAll('[data-i18n]')
    .forEach((el) => (el.innerHTML = translations[el.dataset.i18n] || el.innerHTML));
document.querySelector('#intent').placeholder = ar
  ? 'حدّثنا عن الحياة التي تتطلع إليها…'
  : "Tell us about the life you're looking for…";
document.querySelector('#language').textContent = ar ? 'English' : 'العربية';
document.querySelector('#language').ariaLabel = ar ? 'Switch to English' : 'التبديل إلى العربية';
document.querySelector('#theme').ariaLabel = ar
  ? theme === 'dark'
    ? 'المظهر الفاتح'
    : 'المظهر الداكن'
  : theme === 'dark'
    ? 'Switch to light theme'
    : 'Switch to dark theme';
document.querySelector('#voice').ariaLabel = ar ? 'الإدخال الصوتي' : 'Voice input';
document.querySelector('.submit').ariaLabel = ar ? 'ابدأ المحادثة' : 'Begin conversation';
document.querySelector('.skip').textContent = ar ? 'انتقل إلى المحادثة' : 'Skip to conversation';
document.querySelector('#map').ariaLabel = ar ? 'خريطة جغرافية' : 'Geographic map';
document.querySelectorAll('.demo').forEach((el) => (el.textContent = ar ? 'تجريبي' : 'DEMO'));
let map;
let selectedPlace = 'dubai';
const marker = document.querySelector('.location-marker');
marker.style.visibility = 'hidden';
const places = {
  dubai: {
    center: [55.139, 25.1124],
    zoom: 11.8,
    pitch: 48,
    name: ar ? 'نخلة جميرا' : 'Palm Jumeirah',
    detail: ar ? 'دبي · الخليج العربي' : 'Dubai · Arabian Gulf',
  },
  saadiyat: {
    center: [54.434, 24.538],
    zoom: 11.7,
    pitch: 45,
    name: ar ? 'جزيرة السعديات' : 'Saadiyat Island',
    detail: ar ? 'أبوظبي · الخليج العربي' : 'Abu Dhabi · Arabian Gulf',
  },
  sahel: {
    center: [27.91, 31.12],
    zoom: 9.9,
    pitch: 35,
    name: ar ? 'الساحل الشمالي' : 'North Coast',
    detail: ar ? 'مصر · البحر المتوسط' : 'Egypt · Mediterranean Sea',
  },
};
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
function notice(text) {
  const node = document.querySelector('#notice');
  node.textContent = text;
  node.classList.add('visible');
  clearTimeout(window.noticeTimer);
  window.noticeTimer = setTimeout(() => node.classList.remove('visible'), 4200);
}
function setView(view) {
  document.body.dataset.view = view === 'map' ? 'map' : 'home';
  document
    .querySelectorAll('.nav-link')
    .forEach((el) => el.classList.toggle('active', el.dataset.view === view));
  params.set('view', view);
  history.replaceState({}, '', `?${params}`);
  map?.resize();
}
function selectPlace(key) {
  selectedPlace = key;
  const place = places[key];
  map?.flyTo({
    ...place,
    duration: reduced ? 0 : 1400,
    essential: false,
    bearing: key === 'dubai' ? -20 : 0,
  });
  document.querySelector('#place-name').textContent = place.name;
  document.querySelector('.place-detail').textContent = place.detail;
  document.querySelector('.project-location').textContent = ar
    ? `مسكن افتراضي · ${place.name}`
    : `A fictional residence · ${place.name}`;
  document
    .querySelectorAll('[data-place]')
    .forEach((el) => el.classList.toggle('selected', el.dataset.place === key));
  notice(
    ar
      ? `الخريطة: ${place.name} · مثال تجريبي`
      : `Map focused on ${place.name} · Concept demonstration`,
  );
}
document.querySelectorAll('[data-view]').forEach((el) => {
  if (el.tagName === 'BUTTON') el.addEventListener('click', () => setView(el.dataset.view));
});
document
  .querySelectorAll('[data-place]')
  .forEach((el) => el.addEventListener('click', () => selectPlace(el.dataset.place)));
document.querySelector('#language').addEventListener('click', () => {
  params.set('lang', ar ? 'en' : 'ar');
  location.search = params.toString();
});
document.querySelector('#theme').addEventListener('click', () => {
  params.set('theme', theme === 'dark' ? 'light' : 'dark');
  location.search = params.toString();
});
document.querySelector('#composer').addEventListener('submit', (event) => {
  event.preventDefault();
  const text = document.querySelector('#intent').value.trim();
  setView('map');
  if (text) {
    document.querySelector('.user-bubble').textContent = text;
    selectPlace(
      /coast|sahel|مصر|الساحل|مصر/i.test(text)
        ? 'sahel'
        : /saadiyat|سعديات/i.test(text)
          ? 'saadiyat'
          : 'dubai',
    );
  } else
    notice(
      ar
        ? 'اختر وجهة أو حدّثنا عما يهمك.'
        : 'Choose a perspective, or tell us what matters to you.',
    );
  document.querySelector('#intent').value = '';
});
document.querySelector('[data-prompt]').addEventListener('click', () => {
  document.querySelector('#intent').value = ar
    ? 'بيت للصيف على الساحل الشمالي'
    : 'A summer home on the North Coast';
  document.querySelector('#composer').requestSubmit();
});
document
  .querySelector('#voice')
  .addEventListener('click', () =>
    notice(
      ar
        ? 'الإدخال الصوتي جزء من التصوّر. اكتب طلبك لتجربة الخريطة.'
        : 'Voice is part of this concept. Type your request to try the map interaction.',
    ),
  );
document
  .querySelector('#project-open')
  .addEventListener('click', () =>
    notice(
      ar
        ? 'هذا مسكن افتراضي لدراسة التصميم، وليس عرضاً للبيع.'
        : 'This fictional residence is a design study, not an available listing.',
    ),
  );
let storyStep = 0;
document.querySelector('#story').addEventListener('click', () => {
  const sequence = ['dubai', 'saadiyat', 'sahel'];
  selectPlace(sequence[storyStep % 3]);
  document.querySelector('.story-count').textContent = `0${(storyStep % 3) + 1} — 03`;
  storyStep++;
});
setView(params.get('view') === 'map' ? 'map' : 'home');
createConceptMap(document.querySelector('#map'), {
  theme,
  locale,
  center: places.dubai.center,
  zoom: 11.3,
  pitch: 48,
})
  .then((result) => {
    map = result;
    const positionMarker = () => {
      const point = map.project(places[selectedPlace].center);
      marker.style.cssText = `visibility:visible;inset:auto;left:${point.x - 20}px;top:${point.y - marker.offsetHeight + 35}px`;
      document.querySelector('.marker-caption').innerHTML =
        `${places[selectedPlace].center[1].toFixed(4)}° N<br>${places[selectedPlace].center[0].toFixed(4)}° E`;
    };
    map.on('render', positionMarker);
    map.flyTo({
      center: places.dubai.center,
      zoom: 11.8,
      pitch: 48,
      bearing: -20,
      duration: reduced ? 0 : 1800,
    });
    window.conceptMapReady = true;
  })
  .catch((error) => {
    console.warn(error);
    notice(
      ar
        ? 'تعذّر تحميل الخريطة. تبقى الوجهات متاحة من الأزرار.'
        : 'The map could not load. Destinations remain available through the controls.',
    );
    window.conceptMapReady = false;
  });

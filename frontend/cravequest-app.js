(function startCraveQuestApp() {
  'use strict';

  const api = window.CraveQuestApi;
  if (!api) return;
  const paths = {
    home: '/stitch_cravequest_food_discovery_interface/cravequest_home_discovery/code.html',
    quiz: '/stitch_cravequest_food_discovery_interface/cravequest_flavor_quiz/code.html',
    feed: '/stitch_cravequest_food_discovery_interface/cravequest_recommendation_feed/code.html',
    detail: '/stitch_cravequest_food_discovery_interface/cravequest_dish_detail_quest/code.html',
  };
  const outletKey = 'cravequest.outletId';
  const requestKey = 'cravequest.recommendationRequest';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  let outlets = [];
  let currentOutletId = '';
  let requestSequence = 0;

  const css = document.createElement('style');
  css.textContent = `
    .cq-panel{background:#fff;border:2px solid #1b4332;border-radius:16px;box-shadow:4px 4px 0 #1b4332;padding:20px;margin:18px 0;color:#181d19}
    .cq-panel h2,.cq-panel h3{color:#012d1d;margin:0 0 8px;font-weight:700}
    .cq-panel p{margin:6px 0;color:#414844}
    .cq-toolbar,.cq-fields,.cq-card-grid{display:grid;gap:12px}
    .cq-toolbar{grid-template-columns:repeat(auto-fit,minmax(170px,1fr));align-items:end;margin:14px 0}
    .cq-fields{grid-template-columns:repeat(auto-fit,minmax(190px,1fr));margin:14px 0}
    .cq-control{display:flex;flex-direction:column;gap:5px;font:600 13px 'Space Grotesk',sans-serif;color:#012d1d}
    .cq-control input,.cq-control select{box-sizing:border-box;width:100%;padding:9px 10px;border:2px solid #1b4332;border-radius:9px;background:#fff;color:#181d19;font:14px 'Plus Jakarta Sans',sans-serif}
    .cq-button,.cq-link{display:inline-flex;align-items:center;justify-content:center;border:2px solid #012d1d;border-radius:10px;padding:10px 14px;background:#006c48;color:#fff;font:700 14px 'Space Grotesk',sans-serif;text-decoration:none;cursor:pointer}
    .cq-button:disabled{opacity:.6;cursor:wait}.cq-link{background:#ffdf96;color:#251a00}
    .cq-card-grid{grid-template-columns:repeat(auto-fit,minmax(235px,1fr));margin-top:14px}
    .cq-card{border:2px solid #1b4332;border-radius:13px;padding:14px;background:#f6fbf4;display:flex;flex-direction:column;gap:8px}
    .cq-card-title{font-size:18px;font-weight:700;color:#012d1d}.cq-price{font-weight:700;color:#006c48}
    .cq-note{padding:10px 12px;border-radius:9px;background:#f0f5ee;border-left:4px solid #e7c268}
    .cq-error{background:#ffdad6;color:#93000a;border-left-color:#ba1a1a}.cq-status{min-height:20px;font-size:13px;color:#414844}
    .cq-tags{display:flex;flex-wrap:wrap;gap:6px}.cq-tag{padding:3px 8px;border-radius:999px;background:#ebefe8;font-size:12px}
    .cq-muted{font-size:12px;color:#414844}.cq-detail{max-width:900px;margin:24px auto}.cq-detail h1{font-size:clamp(28px,4vw,42px);color:#012d1d}
    .cq-detail section{padding:14px 0;border-top:1px solid #c1c8c2}.cq-inline{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  `;
  document.head.append(css);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function notice(parent, text, error = false) {
    let node = $('.cq-status', parent);
    if (!node) {
      node = el('p', `cq-status${error ? ' cq-note cq-error' : ''}`);
      node.setAttribute('role', 'status');
      node.setAttribute('aria-live', 'polite');
      parent.prepend(node);
    }
    node.className = `cq-status${error ? ' cq-note cq-error' : ''}`;
    node.textContent = text;
    return node;
  }

  function label(text, input) {
    const wrapper = el('label', 'cq-control', text);
    wrapper.append(input);
    return wrapper;
  }

  function makeSelect(id, title, items, value) {
    const select = document.createElement('select');
    select.id = id;
    const placeholder = new Option(items.length ? `Choose ${title.toLowerCase()}` : `No ${title.toLowerCase()} available`, '');
    select.add(placeholder);
    for (const item of items) select.add(new Option(item.label, String(item.value)));
    if (value) select.value = String(value);
    return select;
  }

  function mountPanel(title, description) {
    const main = $('main');
    const panel = el('section', 'cq-panel');
    panel.setAttribute('aria-label', title);
    panel.append(el('h2', '', title));
    if (description) panel.append(el('p', '', description));
    const select = makeSelect('cq-outlet', 'outlet', [], '');
    const selectLabel = label('Browse this outlet', select);
    const toolbar = el('div', 'cq-toolbar');
    toolbar.append(selectLabel);
    panel.append(toolbar);
    main.prepend(panel);
    return { panel, select, toolbar };
  }

  function selectedOutlet() {
    return outlets.find((outlet) => String(outlet.id) === String(currentOutletId));
  }

  function updateHeaderOutlet(outlet) {
    const button = $$('header button').find((candidate) => candidate.textContent.includes('location_on'));
    if (button && outlet) {
      const spans = $$('span', button);
      const display = spans.find((span) => span.textContent.trim() && span.textContent.trim() !== 'location_on' && span.textContent.trim() !== 'expand_more');
      if (display) display.textContent = `${outlet.address.city}, ${outlet.address.region}`;
      button.setAttribute('aria-label', `Selected outlet: ${outlet.name}`);
    }
  }

  function fillOutletSelect(select) {
    const chosen = currentOutletId;
    select.replaceChildren(new Option(outlets.length ? 'Choose an outlet' : 'No active outlets available', ''));
    select.options[0].disabled = true;
    outlets.forEach((outlet) => select.add(new Option(`${outlet.name} - ${outlet.address.city}`, String(outlet.id))));
    select.value = chosen;
  }

  function setOutlet(id) {
    if (!outlets.some((outlet) => String(outlet.id) === String(id))) return false;
    if (String(id) === String(currentOutletId)) return false;
    currentOutletId = String(id);
    sessionStorage.setItem(outletKey, currentOutletId);
    const outlet = selectedOutlet();
    updateHeaderOutlet(outlet);
    $$('select#cq-outlet').forEach((select) => { select.value = currentOutletId; });
    return true;
  }

  function wireOutlet(panel, select) {
    fillOutletSelect(select);
    const outlet = selectedOutlet();
    if (outlet) updateHeaderOutlet(outlet);
  }

  function entriesFrom(response) {
    if (!response || !Array.isArray(response.data)) throw new Error('The menu response did not contain a dish list.');
    return response.data;
  }

  function renderWarnings(parent, warnings) {
    $('[data-cq-warnings]', parent)?.remove();
    const items = [...new Set(warnings || [])];
    const text = items.length
      ? `Data quality: ${items.map((item) => item.replaceAll('_', ' ')).join('; ')}. Missing or unverified food data does not establish allergy safety.`
      : 'Ingredient, allergen, and dietary information is not a guarantee of medical safety.';
    const warning = el('p', 'cq-note cq-muted', text);
    warning.dataset.cqWarnings = 'true';
    parent.append(warning);
  }

  function makeDishCard(entry, recommendation = false) {
    const dish = entry.dish;
    const card = el('article', 'cq-card');
    card.append(el('div', 'cq-card-title', dish.name));
    const place = selectedOutlet();
    card.append(el('p', 'cq-muted', `${place ? place.name : 'Selected outlet'} - ${dish.category}`));
    if (dish.description) card.append(el('p', '', dish.description));
    card.append(el('p', 'cq-price', `${entry.price} ${entry.currencyCode}`));
    if (recommendation) {
      card.append(el('p', 'cq-muted', `Recommendation score ${entry.score} - ${entry.reasons.map((reason) => reason.replaceAll('_', ' ')).join(', ')}`));
    }
    card.append(el('p', 'cq-muted', `Ingredient data: ${dish.ingredientData.status}; availability: ${entry.availabilityStatus}.`));
    if (dish.dataWarnings?.length) renderWarnings(card, dish.dataWarnings);
    const link = el('a', 'cq-link', 'View dish details');
    link.href = `${paths.detail}?dishId=${encodeURIComponent(dish.id)}`;
    card.append(link);
    return card;
  }

  function renderMenu(parent, entries, recommendation = false) {
    const old = $('.cq-results', parent);
    if (old) old.remove();
    const grid = el('div', 'cq-card-grid cq-results');
    if (!entries.length) {
      grid.append(el('p', 'cq-note', 'No dishes match these filters at this outlet right now.'));
    } else {
      entries.forEach((entry) => grid.append(makeDishCard(entry, recommendation)));
    }
    parent.append(grid);
  }

  function categoryChoices(entries) {
    return [...new Set(entries.map((entry) => entry.dish.category))].sort().map((value) => ({ value, label: value.replaceAll('_', ' ') }));
  }

  function selectedBudgetMaximum() {
    const selected = $$('.budget-pill').find((pill) => pill.className.includes('bg-primary-container'));
    const caps = ['15', '25', '45'];
    const index = $$('.budget-pill').indexOf(selected);
    return caps[index] || '25';
  }

  function removePrototypeIdentity() {
    $$('header span').forEach((span) => {
      if (span.textContent.includes('Sam P.')) span.textContent = 'Guest';
      if (span.textContent.includes('Lvl 4 Scout')) span.parentElement.hidden = true;
    });
    $$('footer span').forEach((span) => {
      if (span.textContent.includes('100% Verified Taste Quests')) span.textContent = 'Ingredient and dietary data may be incomplete';
      if (span.textContent.includes('Field Notes Dispatched Hourly')) span.textContent = 'Current outlet menu data';
      if (span.textContent.includes('Trending Flavor:')) span.textContent = 'No sales or trend data shown';
    });
  }

  async function loadMenu(outletId, filters = {}) {
    const response = await api.getMenu(outletId, { limit: 100, ...filters });
    return entriesFrom(response);
  }

  async function initHome() {
    const { panel, select } = mountPanel('Browse current menus', 'Select an outlet to search its published, currently available dishes.');
    wireOutlet(panel, select);
    const sections = $$('main > div > section');
    [sections[1], sections[2], sections[4]].filter(Boolean).forEach((section) => { section.hidden = true; });
    const heroCopy = $$('main p').find((node) => node.textContent.includes('Our AI food compass'));
    if (heroCopy) heroCopy.textContent = 'Browse published menus from the selected outlet, then narrow currently available dishes by name, category, and price.';
    $$('main span').forEach((span) => {
      if (span.textContent.includes('1,420+ Verified Scouts')) span.textContent = 'Outlet menu data';
      if (span.textContent.trim() === '99.4% Sync') span.textContent = 'Live menu';
      if (span.textContent.includes('Live Food Compass Active')) span.textContent = 'Published menus';
      if (span.textContent.includes('TASTE COMPASS v4.2')) span.textContent = 'TASTE PREVIEW (not used for ranking)';
    });
    $$('main button').forEach((button) => {
      if (button.textContent.includes('Top 20')) button.textContent = 'Browse available dishes';
    });
    const oldArticles = $$('article', $('main'));
    if (oldArticles.length) oldArticles[0].closest('section').hidden = true;
    const filters = el('div', 'cq-toolbar');
    const search = document.createElement('input'); search.type = 'search'; search.maxLength = 100; search.placeholder = 'Search dish name or description'; search.setAttribute('aria-label', 'Search menu');
    const category = makeSelect('cq-category', 'category', [], '');
    const maxPrice = document.createElement('input'); maxPrice.type = 'number'; maxPrice.min = '0'; maxPrice.step = '0.01'; maxPrice.placeholder = 'Any price'; maxPrice.setAttribute('aria-label', 'Maximum price');
    const availability = makeSelect('cq-availability', 'availability', [
      { value: 'available', label: 'Available now' }, { value: 'sold_out', label: 'Sold out' }, { value: 'paused', label: 'Paused' },
    ], 'available');
    filters.append(label('Search', search), label('Category', category), label('Maximum price', maxPrice), label('Availability', availability));
    panel.append(filters);
    const status = notice(panel, 'Loading outlets...');
    search.value = sessionStorage.getItem('cravequest.search') || '';
    sessionStorage.removeItem('cravequest.search');
    let timer;
    let categoryOutlet = '';
    const refresh = async () => {
      const sequence = ++requestSequence;
      if (!currentOutletId) return notice(panel, 'Choose an outlet to load its menu.', true);
      status.textContent = 'Loading available dishes...';
      $('.cq-results', panel)?.remove();
      try {
        let allEntries;
        if (categoryOutlet !== currentOutletId) {
          allEntries = await loadMenu(currentOutletId);
          if (sequence !== requestSequence) return;
          const selectedCategory = category.value;
          category.replaceChildren(new Option('All categories', ''));
          categoryChoices(allEntries).forEach((item) => category.add(new Option(item.label, item.value)));
          if (categoryChoices(allEntries).some((item) => item.value === selectedCategory)) category.value = selectedCategory;
          categoryOutlet = currentOutletId;
        }
        const filters = {
          search: search.value.trim() || undefined,
          category: category.value || undefined,
          maxPrice: maxPrice.value || undefined,
          availability: availability.value || 'available',
        };
        const hasFilters = filters.search || filters.category || filters.maxPrice || filters.availability !== 'available';
        const entries = allEntries && !hasFilters ? allEntries : await loadMenu(currentOutletId, filters);
        if (sequence !== requestSequence) return;
        status.textContent = `${entries.length} menu entr${entries.length === 1 ? 'y' : 'ies'} returned by the selected outlet API.`;
        renderMenu(panel, entries);
      } catch (error) {
        if (sequence !== requestSequence) return;
        notice(panel, error.message, true);
      }
    };
    select.addEventListener('change', () => { if (setOutlet(select.value)) void refresh(); });
    [search, category, maxPrice, availability].forEach((control) => control.addEventListener(control === search ? 'input' : 'change', () => {
      clearTimeout(timer); timer = setTimeout(refresh, 250);
    }));
    $('#cta-quiz')?.addEventListener('click', () => { window.location.href = paths.quiz; });
    $('#cta-matches')?.addEventListener('click', () => { window.location.href = paths.feed; });
    if (currentOutletId) await refresh();
    else status.textContent = outlets.length ? 'Choose an outlet to load its menu.' : 'No active outlets are available from the API.';
  }

  function parseList(value) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  async function initQuiz() {
    const { panel, select } = mountPanel('Build a recommendation request', "Budget maps to the API's soft maximum price. Allergy and ingredient exclusions are hard restrictions. Sensory and distance controls below are prototype-only and are not sent to the API.");
    wireOutlet(panel, select);
    const textureClaim = $$('main p').find((node) => node.textContent.includes('Food psychology proves'));
    if (textureClaim) textureClaim.textContent = 'Texture and spice are visual prototype controls. The current recommendation API does not accept or save them.';
    const radiusDescription = $$('main p').find((node) => node.textContent.includes('Within brisk 15-minute'));
    if (radiusDescription) radiusDescription.textContent = 'Distance filtering is not supported by the current outlet and menu data.';
    const form = document.createElement('form');
    const fields = el('div', 'cq-fields');
    const category = makeSelect('cq-preference-category', 'category', [], '');
    const allergens = document.createElement('input'); allergens.placeholder = 'Example: peanuts, milk'; allergens.maxLength = 400;
    const ingredients = document.createElement('input'); ingredients.placeholder = 'Example: sesame, shellfish'; ingredients.maxLength = 400;
    const tagSelect = document.createElement('select'); tagSelect.multiple = true; tagSelect.size = 4; tagSelect.setAttribute('aria-label', 'Verified dietary tag requirements');
    const tagLabel = label('Dietary tags the dish must satisfy (verified tags only)', tagSelect);
    fields.append(label('Soft category preference', category), label('Exclude allergens (comma-separated)', allergens), label('Exclude ingredients (comma-separated)', ingredients), tagLabel);
    form.append(fields);
    const budget = document.createElement('input'); budget.type = 'number'; budget.min = '0'; budget.step = '0.01'; budget.value = selectedBudgetMaximum(); budget.setAttribute('aria-label', 'Maximum price preference');
    fields.append(label('Soft maximum price', budget));
    const submit = el('button', 'cq-button', 'Find eligible dishes'); submit.type = 'submit';
    form.append(submit);
    const status = notice(panel, 'Loading outlet and menu choices...');
    panel.append(form);

    const refreshChoices = async () => {
      if (!currentOutletId) return;
      const seq = ++requestSequence;
      status.textContent = 'Loading categories and verified tag choices...';
      try {
        const entries = await loadMenu(currentOutletId);
        if (seq !== requestSequence) return;
        category.replaceChildren(new Option('No category preference', ''));
        categoryChoices(entries).forEach((item) => category.add(new Option(item.label, item.value)));
        const verified = new Map();
        for (const entry of entries) for (const tag of entry.dish.dietaryTags.tags) {
          if (tag.verificationStatus === 'verified') verified.set(tag.slug, tag.label);
        }
        tagSelect.replaceChildren();
        for (const [slug, text] of verified) tagSelect.add(new Option(`${text} (${slug})`, slug));
        status.textContent = verified.size
          ? 'Only dietary tags marked verified by this outlet are offered as requirements.'
          : 'No verified dietary tags are available in this menu. No tag requirements can be selected.';
      } catch (error) { if (seq === requestSequence) notice(panel, error.message, true); }
    };
    select.addEventListener('change', () => {
      if (setOutlet(select.value)) {
        category.replaceChildren(new Option('No category preference', ''));
        tagSelect.replaceChildren();
        void refreshChoices();
      }
    });
    if (currentOutletId) await refreshChoices();
    else status.textContent = outlets.length ? 'Choose an outlet before setting recommendation preferences.' : 'No active outlets are available from the API.';
    $$('.budget-pill').forEach((pill, index) => pill.addEventListener('click', () => {
      const caps = ['15', '25', '45'];
      budget.value = caps[index] || '';
    }));
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!currentOutletId) return notice(panel, 'Choose an outlet before requesting recommendations.', true);
      const maxPrice = budget.value.trim();
      if (maxPrice && (!/^\d+(?:\.\d{1,2})?$/.test(maxPrice) || Number(maxPrice) < 0)) return notice(panel, 'Enter a nonnegative maximum price with up to two decimal places.', true);
      const payload = {
        outletId: currentOutletId,
        preferences: { categories: category.value ? [category.value] : [], maxPrice: maxPrice || undefined },
        hardRestrictions: {
          allergens: parseList(allergens.value),
          ingredients: parseList(ingredients.value),
          dietaryTags: [...tagSelect.selectedOptions].map((option) => option.value),
        },
      };
      sessionStorage.setItem(requestKey, JSON.stringify(payload));
      submit.disabled = true; submit.textContent = 'Opening recommendations...';
      notice(panel, 'Your request is in this browser session. Restrictions will be checked against the selected outlet menu on the next screen.');
      window.location.href = paths.feed;
    });
  }

  async function initFeed() {
    const { panel, select } = mountPanel('Outlet recommendations', "Ranked dishes come only from this outlet's current, published and available menu.");
    wireOutlet(panel, select);
    const status = notice(panel, 'Loading outlet menu...');
    const staticDishes = $$('article', $('main'));
    const grid = staticDishes[0]?.parentElement;
    if (grid && staticDishes.length) grid.replaceChildren();
    const fakeHeader = $('main > div > section');
    if (fakeHeader) fakeHeader.hidden = true;
    const oldTitle = $('main h1');
    if (oldTitle) oldTitle.textContent = 'Recommendations from your selected outlet';
    const display = async () => {
      if (!currentOutletId) return notice(panel, 'Choose an outlet to load recommendations.', true);
      const seq = ++requestSequence;
      $('.cq-results', panel)?.remove();
      $('[data-cq-warnings]', panel)?.remove();
      try {
        const raw = sessionStorage.getItem(requestKey);
        const savedRequest = raw ? JSON.parse(raw) : null;
        let entries; let isRecommendation = false; let warnings = [];
        if (savedRequest) {
          savedRequest.outletId = currentOutletId;
          status.textContent = 'Checking current menu availability and restrictions...';
          const result = await api.recommend(savedRequest);
          entries = result.data; warnings = result.warnings || []; isRecommendation = true;
          sessionStorage.setItem(requestKey, JSON.stringify(savedRequest));
          status.textContent = `${result.eligibleCount} eligible, ${result.excludedCount} excluded from ${result.totalAvailableCount} available menu entries.`;
        } else {
          status.textContent = 'Loading current available menu...';
          entries = await loadMenu(currentOutletId);
          status.textContent = `${entries.length} currently available menu entr${entries.length === 1 ? 'y' : 'ies'}.`;
        }
        if (seq !== requestSequence) return;
        renderMenu(panel, entries, isRecommendation);
        renderWarnings(panel, warnings);
      } catch (error) {
        if (seq === requestSequence) notice(panel, error.message, true);
      }
    };
    select.addEventListener('change', () => { if (setOutlet(select.value)) void display(); });
    if (currentOutletId) await display();
    else status.textContent = outlets.length ? 'Choose an outlet to load recommendations.' : 'No active outlets are available from the API.';
  }

  function showDetails(data) {
    const main = $('main');
    [...main.children].forEach((node) => { node.hidden = true; });
    const view = el('article', 'cq-panel cq-detail');
    view.append(el('p', 'cq-muted', `${data.outlet.name} - ${data.outlet.cuisineType}`));
    view.append(el('h1', '', data.dish.name));
    if (data.dish.description) view.append(el('p', '', data.dish.description));
    for (const entry of data.menuEntries) view.append(el('p', 'cq-price', `${entry.price} ${entry.currencyCode} - ${entry.menu.name} - ${entry.availabilityStatus}`));
    renderWarnings(view, data.dish.dataWarnings);
    const ingredients = el('section'); ingredients.append(el('h2', '', 'Ingredient information'));
    ingredients.append(el('p', 'cq-muted', `Status: ${data.dish.ingredientData.status}.`));
    if (data.dish.ingredients.length) {
      const list = el('ul');
      for (const ingredient of data.dish.ingredients) list.append(el('li', '', `${ingredient.name}: ${ingredient.presenceStatus}; ${ingredient.verificationStatus}`));
      ingredients.append(list);
    } else ingredients.append(el('p', '', 'No ingredient rows are available. This is unknown information, not evidence of absence.'));
    view.append(ingredients);
    const allergens = el('section'); allergens.append(el('h2', '', 'Known allergen associations'));
    const known = data.dish.allergens.knownAssociations;
    allergens.append(el('p', '', known.length
      ? known.map((association) => `${association.name} (${association.verificationStatus}; ingredient ${association.ingredientVerificationStatus})`).join(', ')
      : 'No positive allergen association is recorded. Missing associations do not establish that this dish is allergen-free.'));
    view.append(allergens);
    const tags = el('section'); tags.append(el('h2', '', 'Dietary tags'));
    tags.append(el('p', '', data.dish.dietaryTags.tags.length
      ? data.dish.dietaryTags.tags.map((tag) => `${tag.label} (${tag.verificationStatus})`).join(', ')
      : 'No dietary tags are recorded.'));
    view.append(tags);
    const actions = el('div', 'cq-inline');
    const back = el('a', 'cq-link', 'Browse current menu'); back.href = paths.home;
    actions.append(back); view.append(actions);
    main.append(view);
  }

  async function initDetail() {
    const main = $('main');
    updateHeaderOutlet(selectedOutlet());
    [...main.children].forEach((node) => { node.hidden = true; });
    const loading = el('section', 'cq-panel cq-detail', 'Loading dish details...'); main.prepend(loading);
    const dishId = new URLSearchParams(location.search).get('dishId');
    if (!dishId || !/^[1-9]\d{0,18}$/.test(dishId)) {
      loading.textContent = 'Select a dish from a live menu to view its details.';
      return;
    }
    try {
      const response = await api.getDish(dishId);
      if (!response.data || !response.data.dish) throw new Error('The dish response was incomplete.');
      loading.remove(); showDetails(response.data);
    } catch (error) { loading.textContent = ''; notice(loading, error.message, true); }
  }

  function wireNavigation() {
    $$('[data-path]').forEach((link) => {
      const path = link.dataset.path;
      if (path === 'badge-quest') {
        link.hidden = true;
        return;
      }
      link.href = paths[path] || paths.home;
    });
    const logo = $('header a');
    if (logo) logo.href = paths.home;
    const search = $('header input[type="text"]');
    if (search) {
      search.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          sessionStorage.setItem('cravequest.search', search.value.trim());
          window.location.href = paths.home;
        }
      });
    }
  }

  async function boot() {
    wireNavigation();
    removePrototypeIdentity();
    try {
      const main = $('main');
      const bootStatus = el('section', 'cq-panel', 'Loading outlets and current menu information…');
      bootStatus.setAttribute('role', 'status');
      bootStatus.setAttribute('aria-live', 'polite');
      main.prepend(bootStatus);
      const response = await api.listOutlets();
      if (!Array.isArray(response.data)) throw new Error('The outlet response did not contain a list.');
      outlets = response.data;
      const previous = sessionStorage.getItem(outletKey);
      currentOutletId = outlets.some((outlet) => String(outlet.id) === String(previous)) ? String(previous) : '';
      if (!currentOutletId && outlets.length) currentOutletId = String(outlets[0].id);
      if (currentOutletId) sessionStorage.setItem(outletKey, currentOutletId);
      bootStatus.remove();
      const screen = document.body.dataset.cqScreen;
      if (screen === 'home') await initHome();
      else if (screen === 'quiz') await initQuiz();
      else if (screen === 'feed') await initFeed();
      else if (screen === 'detail') await initDetail();
    } catch (error) {
      const main = $('main');
      if (main) {
        let panel = $('.cq-panel[role="status"]', main);
        if (!panel) {
          panel = el('section', 'cq-panel cq-error', '');
          main.prepend(panel);
        }
        panel.classList.add('cq-error');
        panel.textContent = '';
        panel.append(el('h2', '', 'CraveQuest is temporarily unavailable'));
        panel.append(el('p', '', error.message));
        main.prepend(panel);
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else void boot();
}());

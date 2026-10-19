(function startCraveQuestApp() {
  'use strict';

  const api = window.CraveQuestApi;
  if (!api) return;
  const paths = {
    home: '/stitch_cravequest_food_discovery_interface/cravequest_home_discovery/code.html',
    discover: '/stitch_cravequest_food_discovery_interface/cravequest_home_discovery/code.html',
    quiz: '/stitch_cravequest_food_discovery_interface/cravequest_flavor_quiz/code.html',
    'flavor-quiz': '/stitch_cravequest_food_discovery_interface/cravequest_flavor_quiz/code.html',
    feed: '/stitch_cravequest_food_discovery_interface/cravequest_recommendation_feed/code.html',
    'feed-matches': '/stitch_cravequest_food_discovery_interface/cravequest_recommendation_feed/code.html',
    detail: '/stitch_cravequest_food_discovery_interface/cravequest_dish_detail_quest/code.html',
    'dish-detail': '/stitch_cravequest_food_discovery_interface/cravequest_dish_detail_quest/code.html',
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
    .cq-ai-box{border:2px solid #006c48;border-radius:14px;background:#f2f8f4;padding:18px;margin:18px 0}
    .cq-ai-header{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
    .cq-ai-chip-list{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
    .cq-chip{padding:6px 12px;border:1.5px solid #1b4332;border-radius:20px;background:#fff;font:600 12px 'Space Grotesk',sans-serif;cursor:pointer;color:#012d1d;transition:all .15s}
    .cq-chip:hover{background:#ffdf96}
    .cq-ai-section{margin-top:14px;padding:14px;background:#fff;border:1.5px solid #1b4332;border-radius:12px}
    .cq-badge-hard{display:inline-block;padding:3px 8px;border-radius:6px;background:#ffdad6;color:#93000a;font:700 11px 'Space Grotesk',sans-serif;margin-right:6px}
    .cq-badge-soft{display:inline-block;padding:3px 8px;border-radius:6px;background:#d8e8dc;color:#012d1d;font:700 11px 'Space Grotesk',sans-serif;margin-right:6px}
    .cq-unspecified-tag{display:inline-block;padding:3px 8px;border-radius:6px;background:#eaeef0;color:#50585c;font:600 11px 'Space Grotesk',sans-serif;margin-right:6px}
    .cq-clarify-box{background:#fff9e6;border:1.5px solid #e7c268;border-radius:10px;padding:12px;margin:12px 0}
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
    card.append(el('p', 'cq-price', `₹${entry.price}`));
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
    const caps = ['250', '500', '1200'];
    const index = $$('.budget-pill').indexOf(selected);
    return caps[index] || '500';
  }

  function removePrototypeIdentity() {
    $$('header span').forEach((span) => {
      if (span.textContent.includes('Sam P.')) span.textContent = 'Guest';
      if (span.textContent.includes('Lvl 4 Scout')) span.parentElement.hidden = true;
      if (span.textContent.includes('SF, CA')) span.textContent = 'Bengaluru, KA';
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

  function buildAiAssistantComponent({ isQuizPage = false, onApplyToForm } = {}) {
    const box = el('section', 'cq-panel cq-ai-box');
    box.setAttribute('aria-label', 'AI Food Discovery Assistant');

    const header = el('div', 'cq-ai-header');
    const title = el('h2', '', '✨ AI Food Discovery Assistant');
    header.append(title);
    box.append(header);

    const desc = el('p', '', 'Describe what you crave in everyday language (e.g. cuisine, allergies, calorie targets, strict budget). The assistant translates your words into verified hard restrictions and soft ranking preferences for your confirmation before discovering dishes.');
    box.append(desc);

    const chipList = el('div', 'cq-ai-chip-list');
    const examples = [
      { label: '🍛 North Indian Dal Makhani & Naan under ₹500', text: "I'm looking for North Indian food at Punjab Grill, under ₹500, with a peanut allergy restriction. Calories are not important." },
      { label: '🥞 Crisp Ghee Roast Masala Dosa', text: "I want South Indian food at Dakshin Rasoi, preferably a crisp dosa with coconut chutney and no dairy restriction." },
      { label: '🍚 Hyderabadi Dum Biryani ~650 kcal', text: "Looking for high protein Hyderabadi Biryani around 650 calories at Biryani Darbar, under ₹450." },
      { label: '🥗 Pure Veg Gluten-Free Thali', text: "I want a pure vegetarian gluten-free meal at Copper Tiffin, between ₹200 and ₹500." },
      { label: '💰 Affordable street food (clarify budget)', text: "I'm craving an affordable meal with rice and vegetables." },
    ];
    examples.forEach((ex) => {
      const chip = el('button', 'cq-chip', ex.label);
      chip.type = 'button';
      chip.addEventListener('click', () => {
        promptArea.value = ex.text;
        promptArea.focus();
      });
      chipList.append(chip);
    });
    box.append(chipList);

    const promptArea = document.createElement('textarea');
    promptArea.rows = 2;
    promptArea.placeholder = 'e.g., "I\'m looking for North Indian food at Punjab Grill, between ₹250 and ₹500, with a peanut allergy restriction. Calories are not important."';
    promptArea.style.cssText = 'box-sizing:border-box;width:100%;padding:10px;border:2px solid #1b4332;border-radius:10px;font:14px "Plus Jakarta Sans",sans-serif;resize:vertical';
    box.append(promptArea);

    const actionRow = el('div', 'cq-inline');
    actionRow.style.marginTop = '10px';
    const interpretBtn = el('button', 'cq-button', 'Interpret Craving with AI');
    interpretBtn.type = 'button';
    actionRow.append(interpretBtn);
    box.append(actionRow);

    const resultContainer = el('div');
    resultContainer.style.marginTop = '14px';
    box.append(resultContainer);

    interpretBtn.addEventListener('click', async () => {
      const prompt = promptArea.value.trim();
      if (!prompt) return notice(resultContainer, 'Please enter a description of what you are craving.', true);
      interpretBtn.disabled = true;
      interpretBtn.textContent = 'Interpreting preferences…';
      resultContainer.replaceChildren();

      try {
        const resp = await api.parsePreferences(prompt);
        const data = resp.data || {};

        if (data.restaurant) {
          const matched = outlets.find((o) => o.name.toLowerCase().includes(data.restaurant.toLowerCase()) || data.restaurant.toLowerCase().includes(o.name.toLowerCase()));
          if (matched) {
            setOutlet(matched.id);
          }
        }

        const card = el('div', 'cq-ai-section');
        const badgeRow = el('div', 'cq-inline');
        badgeRow.append(el('span', 'cq-badge-soft', resp.source === 'gemini' ? 'AI Provider: Gemini 3.8 Flash' : 'Language Rule Parser (Offline / Fallback)'));
        if (data.restaurant) {
          badgeRow.append(el('span', 'cq-tag', `Mentioned Restaurant: ${data.restaurant}`));
        }
        card.append(badgeRow);

        let clarifiedMaxPrice = data.hardRestrictions?.maxPrice || '';
        if (data.clarificationQuestion) {
          const clarifyBox = el('div', 'cq-clarify-box');
          clarifyBox.append(el('h4', '', `Clarification Needed: ${data.clarificationQuestion}`));
          clarifyBox.append(el('p', 'cq-muted', 'You mentioned a general term (like "affordable"). Please specify a maximum budget:'));
          const clarifyInput = document.createElement('input');
          clarifyInput.type = 'number';
          clarifyInput.placeholder = 'e.g. 25';
          clarifyInput.style.cssText = 'padding:6px 10px;border:1.5px solid #1b4332;border-radius:6px;width:120px';
          clarifyBox.append(label('Maximum budget', clarifyInput));
          clarifyInput.addEventListener('input', () => {
            clarifiedMaxPrice = clarifyInput.value.trim();
            if (editMaxPrice) editMaxPrice.value = clarifiedMaxPrice;
          });
          card.append(clarifyBox);
        }

        const hardSec = el('div');
        hardSec.style.marginTop = '12px';
        hardSec.append(el('h4', '', '🛑 Hard Restrictions (Safety & Strict Limits — Applied First)'));
        hardSec.append(el('p', 'cq-muted', 'Safety notice: Missing or unverified ingredient/allergen data fails closed and is excluded. Dishes are not claimed to be medically allergen-free.'));

        const hardFields = el('div', 'cq-fields');
        const editAllergens = document.createElement('input');
        editAllergens.value = (data.hardRestrictions?.allergens || []).join(', ');
        editAllergens.placeholder = 'e.g. peanuts, dairy';
        hardFields.append(label('Allergens to avoid (hard exclusion)', editAllergens));

        const editIngredients = document.createElement('input');
        editIngredients.value = (data.hardRestrictions?.ingredients || []).join(', ');
        editIngredients.placeholder = 'e.g. sesame, shellfish';
        hardFields.append(label('Ingredients to avoid', editIngredients));

        const editMinPrice = document.createElement('input');
        editMinPrice.type = 'number';
        editMinPrice.placeholder = 'Any';
        editMinPrice.value = data.hardRestrictions?.minPrice || '';
        hardFields.append(label('Minimum price (exclusive bound)', editMinPrice));

        const editMaxPrice = document.createElement('input');
        editMaxPrice.type = 'number';
        editMaxPrice.placeholder = 'Any';
        editMaxPrice.value = clarifiedMaxPrice || data.hardRestrictions?.maxPrice || '';
        hardFields.append(label('Maximum price (exclusive bound)', editMaxPrice));

        hardSec.append(hardFields);
        card.append(hardSec);

        const softSec = el('div');
        softSec.style.marginTop = '12px';
        softSec.append(el('h4', '', '🎯 Soft Preferences (Used for Ranking — Does Not Exclude Dishes)'));
        const softFields = el('div', 'cq-fields');

        const editCuisine = document.createElement('input');
        editCuisine.value = (data.preferences?.cuisineTypes || (data.cuisine ? [data.cuisine] : [])).join(', ');
        editCuisine.placeholder = 'e.g. Thai, Modern American';
        softFields.append(label('Preferred cuisine', editCuisine));

        const editCategory = document.createElement('input');
        editCategory.value = (data.preferences?.categories || []).join(', ');
        editCategory.placeholder = 'e.g. main, soup';
        softFields.append(label('Preferred category', editCategory));

        const editCalories = document.createElement('input');
        editCalories.type = 'number';
        editCalories.placeholder = data.caloriesDisregarded ? 'Ignored' : 'e.g. 600';
        editCalories.value = data.preferences?.targetCalories || '';
        softFields.append(label(data.caloriesDisregarded ? 'Target calories (Explicitly marked not important)' : 'Target calories', editCalories));

        const editProtein = document.createElement('input');
        editProtein.type = 'number';
        editProtein.placeholder = 'e.g. 20';
        editProtein.value = data.preferences?.targetProtein || (data.preferences?.highProtein ? '20' : '');
        softFields.append(label('Protein target (g, when verified)', editProtein));

        softSec.append(softFields);
        card.append(softSec);

        if (Array.isArray(data.unspecifiedFields) && data.unspecifiedFields.length) {
          const unspecSec = el('div');
          unspecSec.style.marginTop = '10px';
          unspecSec.append(el('p', 'cq-muted', 'ℹ️ Parameters not specified (no silent assumptions made):'));
          const unspecList = el('div', 'cq-inline');
          data.unspecifiedFields.forEach((field) => {
            unspecList.append(el('span', 'cq-unspecified-tag', field));
          });
          unspecSec.append(unspecList);
          card.append(unspecSec);
        }

        const buttonRow = el('div', 'cq-inline');
        buttonRow.style.marginTop = '16px';

        const confirmBtn = el('button', 'cq-button', 'Confirm Preferences & Find Dishes');
        confirmBtn.type = 'button';
        buttonRow.append(confirmBtn);

        if (isQuizPage && onApplyToForm) {
          const populateBtn = el('button', 'cq-link', 'Copy to Quiz Form Below');
          populateBtn.type = 'button';
          populateBtn.addEventListener('click', () => {
            onApplyToForm({
              cuisine: editCuisine.value.trim(),
              category: editCategory.value.trim(),
              allergens: editAllergens.value.trim(),
              ingredients: editIngredients.value.trim(),
              maxPrice: editMaxPrice.value.trim(),
            });
            notice(resultContainer, 'Preferences copied into the form below! You can further refine and submit.');
          });
          buttonRow.append(populateBtn);
        }

        card.append(buttonRow);

        const recommendationsMount = el('div');
        recommendationsMount.style.marginTop = '16px';
        card.append(recommendationsMount);

        confirmBtn.addEventListener('click', async () => {
          if (!currentOutletId) return notice(card, 'Please select an outlet first to evaluate dishes.', true);
          confirmBtn.disabled = true;
          confirmBtn.textContent = 'Discovering eligible dishes…';
          recommendationsMount.replaceChildren();

          const allergensList = parseList(editAllergens.value);
          const ingredientsList = parseList(editIngredients.value);
          const cuisineList = parseList(editCuisine.value);
          const categoryList = parseList(editCategory.value);
          const minP = editMinPrice.value.trim() || undefined;
          const maxP = editMaxPrice.value.trim() || undefined;
          const cal = editCalories.value.trim() ? Number(editCalories.value.trim()) : undefined;
          const prot = editProtein.value.trim() ? Number(editProtein.value.trim()) : undefined;

          const payload = {
            outletId: currentOutletId,
            preferences: {
              cuisineTypes: cuisineList,
              categories: categoryList,
              minPrice: minP,
              maxPrice: maxP,
              targetCalories: cal,
              targetProtein: prot,
            },
            hardRestrictions: {
              allergens: allergensList,
              ingredients: ingredientsList,
              dietaryTags: [],
              minPrice: minP,
              maxPrice: maxP,
              minPriceExclusive: Boolean(data.hardRestrictions?.minPriceExclusive || (minP && maxP)),
              maxPriceExclusive: Boolean(data.hardRestrictions?.maxPriceExclusive || (minP && maxP)),
            },
          };

          sessionStorage.setItem(requestKey, JSON.stringify(payload));

          try {
            const recResult = await api.recommend(payload);
            const statusMsg = el('p', 'cq-note', `${recResult.eligibleCount} dish${recResult.eligibleCount === 1 ? '' : 'es'} matched safety restrictions and preferences (${recResult.excludedCount} excluded from ${recResult.totalAvailableCount} available menu entries).`);
            recommendationsMount.append(statusMsg);

            if (recResult.warnings?.length) {
              renderWarnings(recommendationsMount, recResult.warnings);
            }

            const recGrid = el('div', 'cq-card-grid');
            if (!recResult.data.length) {
              recGrid.append(el('p', 'cq-note', 'No dishes at this outlet met all hard restrictions. Safety rules strictly exclude unknown or missing allergen and ingredient records.'));
            } else {
              recResult.data.forEach((entry) => {
                recGrid.append(makeDishCard(entry, true));
              });
            }
            recommendationsMount.append(recGrid);
          } catch (recErr) {
            notice(recommendationsMount, recErr.message, true);
          } finally {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Preferences & Find Dishes';
          }
        });

        resultContainer.append(card);
      } catch (err) {
        notice(resultContainer, err.message, true);
      } finally {
        interpretBtn.disabled = false;
        interpretBtn.textContent = 'Interpret Craving with AI';
      }
    });

    return box;
  }

  async function initHome() {
    const { panel, select } = mountPanel('Browse current menus', 'Select an outlet to search its published, currently available dishes.');
    wireOutlet(panel, select);
    const aiAssistant = buildAiAssistantComponent();
    panel.after(aiAssistant);
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
    const aiAssistant = buildAiAssistantComponent({
      isQuizPage: true,
      onApplyToForm: ({ category: cat, allergens: alg, ingredients: ing, maxPrice: mp }) => {
        if (cat) {
          for (let i = 0; i < category.options.length; i++) {
            if (category.options[i].value.toLowerCase() === cat.toLowerCase()) {
              category.selectedIndex = i;
              break;
            }
          }
        }
        if (alg) allergens.value = alg;
        if (ing) ingredients.value = ing;
        if (mp) budget.value = mp;

        // Synchronize with the 4-step Stitch quiz UI
        if (window.quizState) {
          if (mp) window.quizState.budget = mp;
          if (alg) {
            const list = alg.split(',').map((s) => s.trim().toLowerCase());
            window.quizState.exclusions = list;
            $$('.exclusion-chip').forEach((chip) => {
              const excl = chip.dataset.exclude?.toLowerCase();
              if (list.includes(excl)) {
                chip.classList.add('bg-error-container', 'text-on-error-container');
                chip.classList.remove('bg-surface-container-lowest', 'text-primary');
              }
            });
          }
          if (ing) {
            const customInput = $('#quiz-custom-exclusion-input');
            if (customInput) customInput.value = ing;
          }
        }
        if (typeof window.showQuizStep === 'function') {
          window.showQuizStep(3);
        }
      },
    });
    panel.append(aiAssistant);
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
        if (window.quizState && typeof window.showQuizStep === 'function' && window.quizState.step === 4) {
          window.showQuizStep(4);
        }
      }
    });
    if (currentOutletId) await refreshChoices();
    else status.textContent = outlets.length ? 'Choose an outlet before setting recommendation preferences.' : 'No active outlets are available from the API.';
    $$('.budget-pill').forEach((pill, index) => pill.addEventListener('click', () => {
      const caps = ['250', '500', '1200'];
      budget.value = caps[index] || '';
      if (window.quizState) window.quizState.budget = caps[index] || '500';
    }));

    // Connect Stitch quiz tabs and buttons
    $('#quiz-tab-1')?.addEventListener('click', () => window.showQuizStep?.(1));
    $('#quiz-tab-2')?.addEventListener('click', () => window.showQuizStep?.(2));
    $('#quiz-tab-3')?.addEventListener('click', () => window.showQuizStep?.(3));
    $('#quiz-tab-4')?.addEventListener('click', () => window.showQuizStep?.(4));
    $('#btn-next-step-1')?.addEventListener('click', () => window.showQuizStep?.(2));
    $('#btn-back-step-2')?.addEventListener('click', () => window.showQuizStep?.(1));
    $('#btn-next-step-2')?.addEventListener('click', () => window.showQuizStep?.(3));
    $('#btn-back-step-3')?.addEventListener('click', () => window.showQuizStep?.(2));
    $('#btn-unlock-matches')?.addEventListener('click', () => window.showQuizStep?.(4));
    $('#btn-back-step-4')?.addEventListener('click', () => window.showQuizStep?.(3));

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

  function populateDetailElements(data) {
    const dish = data.dish;
    const outlet = data.outlet;
    const entry = data.menuEntries[0];

    // Ensure back to feed button works
    const backBtn = $('#backToFeedBtn');
    if (backBtn) {
      backBtn.href = paths.feed;
      backBtn.onclick = (e) => {
        e.preventDefault();
        window.location.href = paths.feed;
      };
    }

    // Wire explore other matched dishes button
    const exploreOther = $('#exploreOtherOutletDishesBtn') || $$('a').find((a) => a.textContent.includes('Other Matched Dishes'));
    if (exploreOther) {
      exploreOther.href = paths.feed;
      exploreOther.onclick = (e) => {
        e.preventDefault();
        if (outlet?.id) setOutlet(outlet.id);
        window.location.href = paths.feed;
      };
      const exploreSpan = exploreOther.querySelector('span');
      if (exploreSpan && outlet?.name) {
        exploreSpan.textContent = `Explore Other Matched Dishes at ${outlet.name}`;
      }
    }

    // Breadcrumbs update
    const breadcrumbSpans = $$('div.flex.items-center.gap-space-xs span');
    const outletSpan = breadcrumbSpans.find((s) => s.classList.contains('text-primary') && s.classList.contains('font-bold'));
    if (outletSpan) outletSpan.textContent = outlet.name;
    const dishSpan = breadcrumbSpans.find((s) => s.classList.contains('text-secondary') && s.classList.contains('font-bold'));
    if (dishSpan) dishSpan.textContent = dish.name;

    // Title and description
    const title = $('h1');
    if (title) title.textContent = dish.name;
    const desc = title?.nextElementSibling;
    if (desc && dish.description) desc.textContent = dish.description;

    // Price sticker (Rupee)
    if (entry) {
      const priceBadge = $$('div').find((d) => d.textContent.trim().startsWith('₹') || d.textContent.trim().startsWith('$'));
      if (priceBadge) {
        priceBadge.innerHTML = `<span>₹${entry.price}</span>`;
      }
    }

    // Host Outpost restaurant dossier
    const hostHeader = $$('h2').find((h) => h.textContent.includes('Dragon Whisker') || h.textContent.includes('Punjab Grill') || h.textContent.includes('Host Outpost') || h.previousElementSibling?.textContent?.includes('Host Outpost'));
    if (hostHeader) {
      hostHeader.textContent = outlet.name;
      const addrP = hostHeader.nextElementSibling;
      if (addrP) addrP.textContent = `${outlet.address_line}, ${outlet.city}`;
    }

    // Data warnings & Allergen notice
    let warningsBox = $('#cq-detail-warnings');
    if (!warningsBox) {
      warningsBox = el('div', 'cq-note cq-muted');
      warningsBox.id = 'cq-detail-warnings';
      warningsBox.style.margin = '16px 0';
      if (title && title.parentElement) {
        title.parentElement.insertBefore(warningsBox, desc?.nextSibling || title.nextSibling);
      }
    }
    const warnings = dish.dataWarnings || [];
    warningsBox.textContent = warnings.length
      ? `Data quality: ${warnings.map((w) => w.replaceAll('_', ' ')).join('; ')}. Missing or unverified food data does not establish allergy safety.`
      : 'Ingredient, allergen, and dietary verification records loaded. Not a guarantee of medical safety.';

    // Ingredients list
    if (dish.ingredients && dish.ingredients.length) {
      const ul = $('ul.divide-y');
      if (ul) {
        ul.replaceChildren();
        dish.ingredients.forEach((ing) => {
          const li = el('li', 'py-1.5 flex justify-between items-center');
          const nameSpan = el('span', 'font-semibold text-on-surface', ing.name);
          const statSpan = el('span', 'text-on-surface-variant text-right', `${ing.presenceStatus} (${ing.verificationStatus})`);
          li.append(nameSpan, statSpan);
          ul.append(li);
        });
      }
    }

    // Dietary tags
    if (dish.dietaryTags?.tags?.length) {
      const tagContainer = $('.mt-3.pt-3.border-t.border-primary\\/20');
      if (tagContainer) {
        tagContainer.replaceChildren();
        dish.dietaryTags.tags.forEach((t) => {
          const badge = el('span', 'px-2.5 py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full font-label-sm text-label-sm border border-primary/40 font-semibold', `${t.label} (${t.verificationStatus})`);
          tagContainer.append(badge);
        });
      }
    }

    // Extra explicit Back to Feed button for high accessibility
    let extraBack = $('#cq-extra-back-feed');
    if (!extraBack) {
      extraBack = el('div', 'mt-4 flex gap-3 flex-wrap');
      extraBack.id = 'cq-extra-back-feed';
      const backLink = el('a', 'cq-button', '← Back to Feed & Matches');
      backLink.href = paths.feed;
      backLink.onclick = (e) => {
        e.preventDefault();
        window.location.href = paths.feed;
      };
      extraBack.append(backLink);
      title?.parentElement?.append(extraBack);
    }
  }

  async function initDetail() {
    updateHeaderOutlet(selectedOutlet());

    // Explicitly configure and wire the Back to Feed button
    const backBtn = $('#backToFeedBtn');
    if (backBtn) {
      backBtn.href = paths.feed;
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = paths.feed;
      });
    }

    const dishId = new URLSearchParams(location.search).get('dishId');
    if (!dishId || !/^[1-9]\d{0,18}$/.test(dishId)) {
      // Direct view of featured dish; keep Stitch UI intact and ensure back to feed works
      return;
    }

    try {
      const response = await api.getDish(dishId);
      if (!response.data || !response.data.dish) throw new Error('The dish response was incomplete.');
      populateDetailElements(response.data);
    } catch (error) {
      const main = $('main');
      const errBox = el('div', 'cq-note cq-error', `Could not load dish #${dishId}: ${error.message}`);
      main?.prepend(errBox);
    }
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

    const backBtn = $('#backToFeedBtn');
    if (backBtn) {
      backBtn.href = paths.feed;
      backBtn.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = paths.feed;
      });
    }

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

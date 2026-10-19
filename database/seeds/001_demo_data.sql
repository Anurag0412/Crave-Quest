-- Fictional demo records for CraveQuest. Intended for a development database.
-- Ingredient, allergen, and dietary claims in this seed are unverified examples;
-- missing rows are unknown and must never be treated as proof of allergy safety.
-- Natural keys (including reserved demo-* outlet slugs) are used instead of
-- fixed identity IDs so unrelated rows with coincident numeric IDs are untouched.

BEGIN;

-- Fail instead of binding demo child rows to an unrelated row that happens to
-- occupy a reserved natural key with different identifying/demo attributes.
DO $seed_guard$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM (VALUES
            ('demo-juniper-table', 'Juniper Table', 'Modern American', '18 Orchard Lane', 'Portland', 'OR', '97205', 'US', 'America/Los_Angeles'),
            ('demo-copper-tiffin', 'Copper Tiffin', 'South Indian', '204 Cedar Street', 'Austin', 'TX', '78701', 'US', 'America/Chicago'),
            ('demo-little-saffron', 'Little Saffron', 'Persian', '77 Market Row', 'Boston', 'MA', '02109', 'US', 'America/New_York')
        ) AS v(slug, name, cuisine_type, address_line, city, region, postal_code, country_code, time_zone)
        JOIN outlets o ON o.slug = v.slug
        WHERE o.name IS DISTINCT FROM v.name
           OR o.cuisine_type IS DISTINCT FROM v.cuisine_type
           OR o.address_line IS DISTINCT FROM v.address_line
           OR o.city IS DISTINCT FROM v.city
           OR o.region IS DISTINCT FROM v.region
           OR o.postal_code IS DISTINCT FROM v.postal_code
           OR o.country_code::text IS DISTINCT FROM v.country_code
           OR o.time_zone IS DISTINCT FROM v.time_zone
           OR o.is_active IS DISTINCT FROM true
    ) THEN
        RAISE EXCEPTION 'Demo seed natural-key collision: an outlet uses a reserved demo slug with different data';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM (VALUES
            ('demo-juniper-table', 'Juniper All-Day Menu', 'all_day'),
            ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'lunch'),
            ('demo-little-saffron', 'Little Saffron Evening Menu', 'dinner')
        ) AS v(outlet_slug, menu_name, service_period)
        JOIN outlets o ON o.slug = v.outlet_slug
        JOIN menus m ON m.outlet_id = o.id AND m.name = v.menu_name
        WHERE m.service_period IS DISTINCT FROM v.service_period
           OR m.is_published IS DISTINCT FROM true
           OR m.valid_from IS NOT NULL
           OR m.valid_through IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Demo seed natural-key collision: an existing demo menu has different attributes';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM (VALUES
            ('demo-juniper-table', 'Roasted Pear Grain Bowl', 'Farro, roasted pear, greens, and lemon dressing.', 'main', 'partial'),
            ('demo-juniper-table', 'Wild Mushroom Toast', 'Sourdough with mushrooms, herbs, and whipped ricotta.', 'small_plate', 'unknown'),
            ('demo-copper-tiffin', 'Lemon Rice & Lentil Bowl', 'Seasoned rice with lentils, curry leaves, and pickle.', 'main', 'partial'),
            ('demo-copper-tiffin', 'Coconut Vegetable Stew', 'Seasonal vegetables in a coconut broth with rice.', 'main', 'partial'),
            ('demo-little-saffron', 'Herb Kuku Plate', 'Persian herb frittata served with flatbread and greens.', 'main', 'partial'),
            ('demo-little-saffron', 'Saffron Chickpea Soup', 'Chickpeas and vegetables in a saffron tomato broth.', 'soup', 'partial')
        ) AS v(outlet_slug, dish_name, description, category, ingredient_data_status)
        JOIN outlets o ON o.slug = v.outlet_slug
        JOIN dishes d ON d.outlet_id = o.id AND d.name = v.dish_name
        WHERE d.description IS DISTINCT FROM v.description
           OR d.category IS DISTINCT FROM v.category
           OR d.ingredient_data_status IS DISTINCT FROM v.ingredient_data_status
    ) THEN
        RAISE EXCEPTION 'Demo seed natural-key collision: an existing demo dish has different attributes';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM (VALUES
            ('demo-vegetarian', 'Vegetarian (demo)', 'Unverified sample label; vendor confirmation required.'),
            ('demo-vegan', 'Vegan (demo)', 'Unverified sample label; vendor confirmation required.'),
            ('demo-gluten-free', 'Gluten-free (demo)', 'Unverified sample label; requires verified supporting data.'),
            ('demo-dairy-free', 'Dairy-free (demo)', 'Unverified sample label; requires verified supporting data.')
        ) AS v(slug, label, description)
        JOIN dietary_tags t ON t.slug = v.slug
        WHERE t.label IS DISTINCT FROM v.label OR t.description IS DISTINCT FROM v.description
    ) THEN
        RAISE EXCEPTION 'Demo seed natural-key collision: an existing demo dietary tag has different attributes';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM (VALUES
            ('demo-juniper-table', 'Juniper All-Day Menu', 'Roasted Pear Grain Bowl', 14.50::numeric),
            ('demo-juniper-table', 'Juniper All-Day Menu', 'Wild Mushroom Toast', 12.00::numeric),
            ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'Lemon Rice & Lentil Bowl', 13.00::numeric),
            ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'Coconut Vegetable Stew', 15.00::numeric),
            ('demo-little-saffron', 'Little Saffron Evening Menu', 'Herb Kuku Plate', 16.00::numeric),
            ('demo-little-saffron', 'Little Saffron Evening Menu', 'Saffron Chickpea Soup', 11.50::numeric)
        ) AS v(outlet_slug, menu_name, dish_name, price)
        JOIN outlets o ON o.slug = v.outlet_slug
        JOIN menus m ON m.outlet_id = o.id AND m.name = v.menu_name
        JOIN dishes d ON d.outlet_id = o.id AND d.name = v.dish_name
        JOIN menu_dishes md ON md.menu_id = m.id AND md.dish_id = d.id
        WHERE md.outlet_id IS DISTINCT FROM o.id
           OR md.price IS DISTINCT FROM v.price
           OR md.currency_code::text IS DISTINCT FROM 'USD'
           OR md.availability_status IS DISTINCT FROM 'available'
           OR md.is_listed IS DISTINCT FROM true
    ) THEN
        RAISE EXCEPTION 'Demo seed conflict: an existing menu_dishes row differs from expected demo data';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM (VALUES
            ('farro', 'wheat'), ('sourdough bread', 'wheat'), ('ricotta', 'milk'),
            ('egg', 'egg'), ('flatbread', 'wheat')
        ) AS v(ingredient_name, allergen_name)
        JOIN ingredients i ON i.name = v.ingredient_name
        JOIN allergens a ON a.name = v.allergen_name
        JOIN ingredient_allergens ia ON ia.ingredient_id = i.id AND ia.allergen_id = a.id
        WHERE ia.verification_status IS DISTINCT FROM 'unverified'
           OR ia.evidence_note IS NOT NULL
           OR ia.verified_at IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Demo seed conflict: an existing ingredient_allergens row is not the expected unverified sample';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM (VALUES
            ('demo-juniper-table', 'Roasted Pear Grain Bowl', 'farro'),
            ('demo-juniper-table', 'Roasted Pear Grain Bowl', 'pear'),
            ('demo-juniper-table', 'Roasted Pear Grain Bowl', 'mixed greens'),
            ('demo-juniper-table', 'Roasted Pear Grain Bowl', 'lemon dressing'),
            ('demo-copper-tiffin', 'Lemon Rice & Lentil Bowl', 'rice'),
            ('demo-copper-tiffin', 'Lemon Rice & Lentil Bowl', 'lentil'),
            ('demo-copper-tiffin', 'Lemon Rice & Lentil Bowl', 'curry leaf'),
            ('demo-copper-tiffin', 'Coconut Vegetable Stew', 'coconut milk'),
            ('demo-copper-tiffin', 'Coconut Vegetable Stew', 'seasonal vegetables'),
            ('demo-copper-tiffin', 'Coconut Vegetable Stew', 'rice'),
            ('demo-little-saffron', 'Herb Kuku Plate', 'egg'),
            ('demo-little-saffron', 'Herb Kuku Plate', 'flatbread'),
            ('demo-little-saffron', 'Herb Kuku Plate', 'mixed greens'),
            ('demo-little-saffron', 'Saffron Chickpea Soup', 'chickpea'),
            ('demo-little-saffron', 'Saffron Chickpea Soup', 'seasonal vegetables'),
            ('demo-little-saffron', 'Saffron Chickpea Soup', 'tomato')
        ) AS v(outlet_slug, dish_name, ingredient_name)
        JOIN outlets o ON o.slug = v.outlet_slug
        JOIN dishes d ON d.outlet_id = o.id AND d.name = v.dish_name
        JOIN ingredients i ON i.name = v.ingredient_name
        JOIN dish_ingredients di ON di.dish_id = d.id AND di.ingredient_id = i.id
        WHERE di.presence_status IS DISTINCT FROM 'contains'
           OR di.verification_status IS DISTINCT FROM 'unverified'
           OR di.evidence_note IS NOT NULL
           OR di.verified_at IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Demo seed conflict: an existing dish_ingredients row differs from the expected unverified sample';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM (VALUES
            ('demo-copper-tiffin', 'Lemon Rice & Lentil Bowl', 'demo-vegetarian'),
            ('demo-copper-tiffin', 'Lemon Rice & Lentil Bowl', 'demo-vegan'),
            ('demo-copper-tiffin', 'Coconut Vegetable Stew', 'demo-vegetarian'),
            ('demo-copper-tiffin', 'Coconut Vegetable Stew', 'demo-vegan'),
            ('demo-little-saffron', 'Saffron Chickpea Soup', 'demo-vegetarian'),
            ('demo-little-saffron', 'Saffron Chickpea Soup', 'demo-vegan')
        ) AS v(outlet_slug, dish_name, tag_slug)
        JOIN outlets o ON o.slug = v.outlet_slug
        JOIN dishes d ON d.outlet_id = o.id AND d.name = v.dish_name
        JOIN dietary_tags t ON t.slug = v.tag_slug
        JOIN dish_dietary_tags dt ON dt.dish_id = d.id AND dt.dietary_tag_id = t.id
        WHERE dt.verification_status IS DISTINCT FROM 'unverified'
           OR dt.evidence_note IS NOT NULL
           OR dt.verified_at IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Demo seed conflict: an existing dish_dietary_tags row is not the expected unverified sample';
    END IF;
END;
$seed_guard$;

INSERT INTO outlets (slug, name, cuisine_type, address_line, city, region, postal_code, country_code, time_zone)
VALUES
    ('demo-juniper-table', 'Juniper Table', 'Modern American', '18 Orchard Lane', 'Portland', 'OR', '97205', 'US', 'America/Los_Angeles'),
    ('demo-copper-tiffin', 'Copper Tiffin', 'South Indian', '204 Cedar Street', 'Austin', 'TX', '78701', 'US', 'America/Chicago'),
    ('demo-little-saffron', 'Little Saffron', 'Persian', '77 Market Row', 'Boston', 'MA', '02109', 'US', 'America/New_York')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menus (outlet_id, name, service_period, is_published)
SELECT o.id, v.menu_name, v.service_period, true
FROM (VALUES
    ('demo-juniper-table', 'Juniper All-Day Menu', 'all_day'),
    ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'lunch'),
    ('demo-little-saffron', 'Little Saffron Evening Menu', 'dinner')
) AS v(outlet_slug, menu_name, service_period)
JOIN outlets o ON o.slug = v.outlet_slug
ON CONFLICT (outlet_id, name) DO NOTHING;

INSERT INTO dishes (outlet_id, name, description, category, ingredient_data_status)
SELECT o.id, v.dish_name, v.description, v.category, v.ingredient_data_status
FROM (VALUES
    ('demo-juniper-table', 'Roasted Pear Grain Bowl', 'Farro, roasted pear, greens, and lemon dressing.', 'main', 'partial'),
    ('demo-juniper-table', 'Wild Mushroom Toast', 'Sourdough with mushrooms, herbs, and whipped ricotta.', 'small_plate', 'unknown'),
    ('demo-copper-tiffin', 'Lemon Rice & Lentil Bowl', 'Seasoned rice with lentils, curry leaves, and pickle.', 'main', 'partial'),
    ('demo-copper-tiffin', 'Coconut Vegetable Stew', 'Seasonal vegetables in a coconut broth with rice.', 'main', 'partial'),
    ('demo-little-saffron', 'Herb Kuku Plate', 'Persian herb frittata served with flatbread and greens.', 'main', 'partial'),
    ('demo-little-saffron', 'Saffron Chickpea Soup', 'Chickpeas and vegetables in a saffron tomato broth.', 'soup', 'partial')
) AS v(outlet_slug, dish_name, description, category, ingredient_data_status)
JOIN outlets o ON o.slug = v.outlet_slug
ON CONFLICT (outlet_id, name) DO NOTHING;

INSERT INTO menu_dishes (outlet_id, menu_id, dish_id, price, currency_code)
SELECT o.id, m.id, d.id, v.price, 'USD'
FROM (VALUES
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Roasted Pear Grain Bowl', 14.50::numeric),
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Wild Mushroom Toast', 12.00::numeric),
    ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'Lemon Rice & Lentil Bowl', 13.00::numeric),
    ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'Coconut Vegetable Stew', 15.00::numeric),
    ('demo-little-saffron', 'Little Saffron Evening Menu', 'Herb Kuku Plate', 16.00::numeric),
    ('demo-little-saffron', 'Little Saffron Evening Menu', 'Saffron Chickpea Soup', 11.50::numeric)
) AS v(outlet_slug, menu_name, dish_name, price)
JOIN outlets o ON o.slug = v.outlet_slug
JOIN menus m ON m.outlet_id = o.id AND m.name = v.menu_name
JOIN dishes d ON d.outlet_id = o.id AND d.name = v.dish_name
ON CONFLICT (menu_id, dish_id) DO NOTHING;

-- PostgreSQL DOW: Sunday=0 through Saturday=6. Windows are local outlet time.
INSERT INTO menu_dish_availability (menu_id, dish_id, day_of_week, starts_at, ends_at)
SELECT m.id, d.id, v.day_of_week, v.starts_at, v.ends_at
FROM (VALUES
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Roasted Pear Grain Bowl', 1, time '11:00', time '20:00'),
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Roasted Pear Grain Bowl', 2, time '11:00', time '20:00'),
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Roasted Pear Grain Bowl', 3, time '11:00', time '20:00'),
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Roasted Pear Grain Bowl', 4, time '11:00', time '20:00'),
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Roasted Pear Grain Bowl', 5, time '11:00', time '21:00'),
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Roasted Pear Grain Bowl', 6, time '11:00', time '21:00'),
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Roasted Pear Grain Bowl', 0, time '11:00', time '19:00'),
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Wild Mushroom Toast', 1, time '11:00', time '20:00'),
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Wild Mushroom Toast', 2, time '11:00', time '20:00'),
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Wild Mushroom Toast', 3, time '11:00', time '20:00'),
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Wild Mushroom Toast', 4, time '11:00', time '20:00'),
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Wild Mushroom Toast', 5, time '11:00', time '21:00'),
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Wild Mushroom Toast', 6, time '11:00', time '21:00'),
    ('demo-juniper-table', 'Juniper All-Day Menu', 'Wild Mushroom Toast', 0, time '11:00', time '19:00'),
    ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'Lemon Rice & Lentil Bowl', 1, time '11:30', time '15:00'),
    ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'Lemon Rice & Lentil Bowl', 2, time '11:30', time '15:00'),
    ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'Lemon Rice & Lentil Bowl', 3, time '11:30', time '15:00'),
    ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'Lemon Rice & Lentil Bowl', 4, time '11:30', time '15:00'),
    ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'Lemon Rice & Lentil Bowl', 5, time '11:30', time '15:00'),
    ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'Lemon Rice & Lentil Bowl', 6, time '12:00', time '15:00'),
    ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'Coconut Vegetable Stew', 1, time '11:30', time '15:00'),
    ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'Coconut Vegetable Stew', 2, time '11:30', time '15:00'),
    ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'Coconut Vegetable Stew', 3, time '11:30', time '15:00'),
    ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'Coconut Vegetable Stew', 4, time '11:30', time '15:00'),
    ('demo-copper-tiffin', 'Copper Tiffin Lunch', 'Coconut Vegetable Stew', 5, time '11:30', time '15:00'),
    ('demo-little-saffron', 'Little Saffron Evening Menu', 'Herb Kuku Plate', 1, time '16:00', time '21:00'),
    ('demo-little-saffron', 'Little Saffron Evening Menu', 'Herb Kuku Plate', 2, time '16:00', time '21:00'),
    ('demo-little-saffron', 'Little Saffron Evening Menu', 'Herb Kuku Plate', 3, time '16:00', time '21:00'),
    ('demo-little-saffron', 'Little Saffron Evening Menu', 'Herb Kuku Plate', 4, time '16:00', time '21:00'),
    ('demo-little-saffron', 'Little Saffron Evening Menu', 'Herb Kuku Plate', 5, time '16:00', time '22:00'),
    ('demo-little-saffron', 'Little Saffron Evening Menu', 'Herb Kuku Plate', 6, time '16:00', time '22:00'),
    ('demo-little-saffron', 'Little Saffron Evening Menu', 'Saffron Chickpea Soup', 1, time '16:00', time '21:00'),
    ('demo-little-saffron', 'Little Saffron Evening Menu', 'Saffron Chickpea Soup', 2, time '16:00', time '21:00'),
    ('demo-little-saffron', 'Little Saffron Evening Menu', 'Saffron Chickpea Soup', 3, time '16:00', time '21:00'),
    ('demo-little-saffron', 'Little Saffron Evening Menu', 'Saffron Chickpea Soup', 4, time '16:00', time '21:00'),
    ('demo-little-saffron', 'Little Saffron Evening Menu', 'Saffron Chickpea Soup', 5, time '16:00', time '22:00'),
    ('demo-little-saffron', 'Little Saffron Evening Menu', 'Saffron Chickpea Soup', 6, time '16:00', time '22:00')
) AS v(outlet_slug, menu_name, dish_name, day_of_week, starts_at, ends_at)
JOIN outlets o ON o.slug = v.outlet_slug
JOIN menus m ON m.outlet_id = o.id AND m.name = v.menu_name
JOIN dishes d ON d.outlet_id = o.id AND d.name = v.dish_name
ON CONFLICT (menu_id, dish_id, day_of_week, starts_at, ends_at) DO NOTHING;

INSERT INTO ingredients (name)
VALUES ('farro'), ('pear'), ('mixed greens'), ('lemon dressing'), ('sourdough bread'),
       ('mushroom'), ('ricotta'), ('rice'), ('lentil'), ('curry leaf'), ('coconut milk'),
       ('seasonal vegetables'), ('egg'), ('flatbread'), ('chickpea'), ('tomato')
ON CONFLICT (name) DO NOTHING;

INSERT INTO allergens (name)
VALUES ('wheat'), ('milk'), ('egg'), ('tree_nuts'), ('peanuts'), ('sesame')
ON CONFLICT (name) DO NOTHING;

-- These general ingredient/allergen associations are unverified examples.
INSERT INTO ingredient_allergens (ingredient_id, allergen_id, verification_status)
SELECT i.id, a.id, 'unverified'
FROM (VALUES
    ('farro', 'wheat'), ('sourdough bread', 'wheat'), ('ricotta', 'milk'),
    ('egg', 'egg'), ('flatbread', 'wheat')
) AS v(ingredient_name, allergen_name)
JOIN ingredients i ON i.name = v.ingredient_name
JOIN allergens a ON a.name = v.allergen_name
ON CONFLICT (ingredient_id, allergen_id) DO NOTHING;

-- Dish 2 deliberately has unknown structured ingredient data and no rows here.
INSERT INTO dish_ingredients (dish_id, ingredient_id, presence_status, verification_status)
SELECT d.id, i.id, 'contains', 'unverified'
FROM (VALUES
    ('demo-juniper-table', 'Roasted Pear Grain Bowl', 'farro'),
    ('demo-juniper-table', 'Roasted Pear Grain Bowl', 'pear'),
    ('demo-juniper-table', 'Roasted Pear Grain Bowl', 'mixed greens'),
    ('demo-juniper-table', 'Roasted Pear Grain Bowl', 'lemon dressing'),
    ('demo-copper-tiffin', 'Lemon Rice & Lentil Bowl', 'rice'),
    ('demo-copper-tiffin', 'Lemon Rice & Lentil Bowl', 'lentil'),
    ('demo-copper-tiffin', 'Lemon Rice & Lentil Bowl', 'curry leaf'),
    ('demo-copper-tiffin', 'Coconut Vegetable Stew', 'coconut milk'),
    ('demo-copper-tiffin', 'Coconut Vegetable Stew', 'seasonal vegetables'),
    ('demo-copper-tiffin', 'Coconut Vegetable Stew', 'rice'),
    ('demo-little-saffron', 'Herb Kuku Plate', 'egg'),
    ('demo-little-saffron', 'Herb Kuku Plate', 'flatbread'),
    ('demo-little-saffron', 'Herb Kuku Plate', 'mixed greens'),
    ('demo-little-saffron', 'Saffron Chickpea Soup', 'chickpea'),
    ('demo-little-saffron', 'Saffron Chickpea Soup', 'seasonal vegetables'),
    ('demo-little-saffron', 'Saffron Chickpea Soup', 'tomato')
) AS v(outlet_slug, dish_name, ingredient_name)
JOIN outlets o ON o.slug = v.outlet_slug
JOIN dishes d ON d.outlet_id = o.id AND d.name = v.dish_name
JOIN ingredients i ON i.name = v.ingredient_name
ON CONFLICT (dish_id, ingredient_id) DO NOTHING;

INSERT INTO dietary_tags (slug, label, description)
VALUES
    ('demo-vegetarian', 'Vegetarian (demo)', 'Unverified sample label; vendor confirmation required.'),
    ('demo-vegan', 'Vegan (demo)', 'Unverified sample label; vendor confirmation required.'),
    ('demo-gluten-free', 'Gluten-free (demo)', 'Unverified sample label; requires verified supporting data.'),
    ('demo-dairy-free', 'Dairy-free (demo)', 'Unverified sample label; requires verified supporting data.')
ON CONFLICT (slug) DO NOTHING;

-- Suggested labels only; no seeded dietary assertion is verified.
INSERT INTO dish_dietary_tags (dish_id, dietary_tag_id, verification_status)
SELECT d.id, t.id, 'unverified'
FROM (VALUES
    ('demo-copper-tiffin', 'Lemon Rice & Lentil Bowl', 'demo-vegetarian'),
    ('demo-copper-tiffin', 'Lemon Rice & Lentil Bowl', 'demo-vegan'),
    ('demo-copper-tiffin', 'Coconut Vegetable Stew', 'demo-vegetarian'),
    ('demo-copper-tiffin', 'Coconut Vegetable Stew', 'demo-vegan'),
    ('demo-little-saffron', 'Saffron Chickpea Soup', 'demo-vegetarian'),
    ('demo-little-saffron', 'Saffron Chickpea Soup', 'demo-vegan')
) AS v(outlet_slug, dish_name, tag_slug)
JOIN outlets o ON o.slug = v.outlet_slug
JOIN dishes d ON d.outlet_id = o.id AND d.name = v.dish_name
JOIN dietary_tags t ON t.slug = v.tag_slug
ON CONFLICT (dish_id, dietary_tag_id) DO NOTHING;

COMMIT;

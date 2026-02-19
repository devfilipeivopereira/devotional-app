-- ╔═══════════════════════════════════════════════════════════╗
-- ║  Devotional App — Seed Data                             ║
-- ║  Sample devotional series for testing                    ║
-- ╚═══════════════════════════════════════════════════════════╝

-- Series: Encontro Diário
INSERT INTO public.devotional_series (id, title, description, is_published)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Encontro Diário',
  'Uma semana de encontros diários com Deus através de citações, passagens bíblicas, reflexões e orações.',
  TRUE
);

-- Day 1
INSERT INTO public.devotional_days (id, series_id, day_number, title, description, is_published)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  1,
  'O Amor de Deus',
  'Descubra a profundidade do amor de Deus por você.',
  TRUE
);

-- Day 1, Block 1: Quote
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'quote',
  '{"text": "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", "author": "João 3:16"}',
  1
);

-- Day 1, Block 2: Scripture
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000001',
  'scripture',
  '{"book": "Romanos", "chapter": "8", "verseStart": "38", "verseEnd": "39", "text": "Porque estou convencido de que nem morte, nem vida, nem anjos, nem principados, nem coisas presentes, nem futuras, nem poderes, nem altura, nem profundidade, nem qualquer outra coisa na criação será capaz de nos separar do amor de Deus que está em Cristo Jesus, nosso Senhor."}',
  2
);

-- Day 1, Block 3: Reflection
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000001',
  'reflection',
  '{"text": "O amor de Deus não é como o amor humano. Ele não depende das nossas ações, do nosso desempenho ou da nossa perfeição. É um amor incondicional que nos abraça mesmo quando falhamos.\n\nPaulo nos lembra em Romanos 8 que absolutamente nada pode nos separar desse amor. Nem as circunstâncias difíceis, nem as nossas falhas, nem mesmo a morte. É um amor eterno e inabalável.\n\nHoje, permita-se ser envolvido por esse amor. Não tente merecê-lo — apenas receba-o com gratidão."}',
  3
);

-- Day 1, Block 4: Journal Prompt
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000001',
  'journal_prompt',
  '{"prompt": "Como o amor de Deus se manifestou na sua vida recentemente? Em quais áreas você precisa lembrar que Ele te ama incondicionalmente?"}',
  4
);

-- Day 1, Block 5: Prayer
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000001',
  'prayer',
  '{"text": "Pai Celestial, obrigado pelo Teu amor incondicional. Obrigado por me amares não pelo que faço, mas por quem sou em Ti. Ajuda-me hoje a viver consciente desse amor e a compartilhá-lo com quem está ao meu redor. Em nome de Jesus, amém."}',
  5
);

-- Day 2
INSERT INTO public.devotional_days (id, series_id, day_number, title, description, is_published)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  2,
  'Confiança em Deus',
  'Aprenda a confiar no plano de Deus para sua vida.',
  TRUE
);

-- Day 2, Block 1: Quote
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000010',
  'b0000000-0000-0000-0000-000000000002',
  'quote',
  '{"text": "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.", "author": "Provérbios 3:5"}',
  1
);

-- Day 2, Block 2: Scripture
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000011',
  'b0000000-0000-0000-0000-000000000002',
  'scripture',
  '{"book": "Jeremias", "chapter": "29", "verseStart": "11", "verseEnd": "", "text": "Porque eu sei os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro."}',
  2
);

-- Day 2, Block 3: Breathing
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000012',
  'b0000000-0000-0000-0000-000000000002',
  'breathing',
  '{"durationSeconds": 60, "instructions": "Relaxe e confie. Inspire por 4 segundos, segure por 4 segundos, expire por 4 segundos."}',
  3
);

-- Day 2, Block 4: Reflection
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000013',
  'b0000000-0000-0000-0000-000000000002',
  'reflection',
  '{"text": "Confiar em Deus nem sempre é fácil, especialmente quando não entendemos o que está acontecendo ao nosso redor. Mas é exatamente nesses momentos que a fé se fortalece.\n\nJeremias escreveu essas palavras em um dos momentos mais difíceis da história de Israel — durante o exílio. E mesmo assim, Deus prometeu que tinha planos de esperança e futuro.\n\nSe Deus cuidou do Seu povo naquela situação extrema, Ele certamente cuida de você hoje."}',
  4
);

-- Day 2, Block 5: Prayer
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000014',
  'b0000000-0000-0000-0000-000000000002',
  'prayer',
  '{"text": "Senhor, eu entrego os meus planos e preocupações nas Tuas mãos. Sei que Tu tens o melhor para mim, mesmo quando não consigo enxergar. Fortalece a minha fé e ajuda-me a descansar na Tua soberania. Amém."}',
  5
);

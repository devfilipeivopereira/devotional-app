-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  Devotional App â€” Seed Data                             â•‘
-- â•‘  Sample devotional series for testing                    â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Series: Encontro DiÃ¡rio
INSERT INTO public.devotional_series (id, title, description, is_published)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Encontro DiÃ¡rio',
  'Uma semana de encontros diÃ¡rios com Deus atravÃ©s de citaÃ§Ãµes, passagens bÃ­blicas, reflexÃµes e oraÃ§Ãµes.',
  TRUE

) ON CONFLICT (id) DO NOTHING;

-- Day 1
INSERT INTO public.devotional_days (id, series_id, day_number, title, description, is_published)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  1,
  'O Amor de Deus',
  'Descubra a profundidade do amor de Deus por vocÃª.',
  TRUE

) ON CONFLICT (id) DO NOTHING;

-- Day 1, Block 1: Quote
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'quote',
  '{"text": "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigÃªnito, para que todo aquele que nele crÃª nÃ£o pereÃ§a, mas tenha a vida eterna.", "author": "JoÃ£o 3:16"}',
  1

) ON CONFLICT (id) DO NOTHING;

-- Day 1, Block 2: Scripture
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000001',
  'scripture',
  '{"book": "Romanos", "chapter": "8", "verse_start": "38", "verse_end": "39", "text": "Porque estou convencido de que nem morte, nem vida, nem anjos, nem principados, nem coisas presentes, nem futuras, nem poderes, nem altura, nem profundidade, nem qualquer outra coisa na criaÃ§Ã£o serÃ¡ capaz de nos separar do amor de Deus que estÃ¡ em Cristo Jesus, nosso Senhor."}',
  2

) ON CONFLICT (id) DO NOTHING;

-- Day 1, Block 3: Reflection
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000001',
  'reflection',
  '{"text": "O amor de Deus nÃ£o Ã© como o amor humano. Ele nÃ£o depende das nossas aÃ§Ãµes, do nosso desempenho ou da nossa perfeiÃ§Ã£o. Ã‰ um amor incondicional que nos abraÃ§a mesmo quando falhamos.\n\nPaulo nos lembra em Romanos 8 que absolutamente nada pode nos separar desse amor. Nem as circunstÃ¢ncias difÃ­ceis, nem as nossas falhas, nem mesmo a morte. Ã‰ um amor eterno e inabalÃ¡vel.\n\nHoje, permita-se ser envolvido por esse amor. NÃ£o tente merecÃª-lo â€” apenas receba-o com gratidÃ£o."}',
  3

) ON CONFLICT (id) DO NOTHING;

-- Day 1, Block 4: Journal Prompt
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000001',
  'journal_prompt',
  '{"prompt": "Como o amor de Deus se manifestou na sua vida recentemente? Em quais Ã¡reas vocÃª precisa lembrar que Ele te ama incondicionalmente?"}',
  4

) ON CONFLICT (id) DO NOTHING;

-- Day 1, Block 5: Prayer
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000001',
  'prayer',
  '{"text": "Pai Celestial, obrigado pelo Teu amor incondicional. Obrigado por me amares nÃ£o pelo que faÃ§o, mas por quem sou em Ti. Ajuda-me hoje a viver consciente desse amor e a compartilhÃ¡-lo com quem estÃ¡ ao meu redor. Em nome de Jesus, amÃ©m."}',
  5

) ON CONFLICT (id) DO NOTHING;

-- Day 2
INSERT INTO public.devotional_days (id, series_id, day_number, title, description, is_published)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  2,
  'ConfianÃ§a em Deus',
  'Aprenda a confiar no plano de Deus para sua vida.',
  TRUE

) ON CONFLICT (id) DO NOTHING;

-- Day 2, Block 1: Quote
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000010',
  'b0000000-0000-0000-0000-000000000002',
  'quote',
  '{"text": "Confia no Senhor de todo o teu coraÃ§Ã£o e nÃ£o te estribes no teu prÃ³prio entendimento.", "author": "ProvÃ©rbios 3:5"}',
  1

) ON CONFLICT (id) DO NOTHING;

-- Day 2, Block 2: Scripture
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000011',
  'b0000000-0000-0000-0000-000000000002',
  'scripture',
  '{"book": "Jeremias", "chapter": "29", "verse_start": "11", "verse_end": "", "text": "Porque eu sei os planos que tenho para vocÃªs, diz o Senhor, planos de fazÃª-los prosperar e nÃ£o de causar dano, planos de dar a vocÃªs esperanÃ§a e um futuro."}',
  2

) ON CONFLICT (id) DO NOTHING;

-- Day 2, Block 3: Breathing
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000012',
  'b0000000-0000-0000-0000-000000000002',
  'breathing',
  '{"duration_seconds": 60, "instructions": "Relaxe e confie. Inspire por 4 segundos, segure por 4 segundos, expire por 4 segundos."}',
  3

) ON CONFLICT (id) DO NOTHING;

-- Day 2, Block 4: Reflection
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000013',
  'b0000000-0000-0000-0000-000000000002',
  'reflection',
  '{"text": "Confiar em Deus nem sempre Ã© fÃ¡cil, especialmente quando nÃ£o entendemos o que estÃ¡ acontecendo ao nosso redor. Mas Ã© exatamente nesses momentos que a fÃ© se fortalece.\n\nJeremias escreveu essas palavras em um dos momentos mais difÃ­ceis da histÃ³ria de Israel â€” durante o exÃ­lio. E mesmo assim, Deus prometeu que tinha planos de esperanÃ§a e futuro.\n\nSe Deus cuidou do Seu povo naquela situaÃ§Ã£o extrema, Ele certamente cuida de vocÃª hoje."}',
  4

) ON CONFLICT (id) DO NOTHING;

-- Day 2, Block 5: Prayer
INSERT INTO public.devotional_blocks (id, day_id, block_type, content, "order")
VALUES (
  'c0000000-0000-0000-0000-000000000014',
  'b0000000-0000-0000-0000-000000000002',
  'prayer',
  '{"text": "Senhor, eu entrego os meus planos e preocupaÃ§Ãµes nas Tuas mÃ£os. Sei que Tu tens o melhor para mim, mesmo quando nÃ£o consigo enxergar. Fortalece a minha fÃ© e ajuda-me a descansar na Tua soberania. AmÃ©m."}',
  5

) ON CONFLICT (id) DO NOTHING;



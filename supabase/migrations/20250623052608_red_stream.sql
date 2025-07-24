/*
  # サンプルデータの挿入

  皮膚疾患診断支援システム用の基本的なサンプルデータを挿入します。
  実際の運用では、医学的に正確なデータに置き換える必要があります。
*/

-- 疾患カテゴリの挿入
INSERT INTO disease_categories (name, name_en, description, display_order) VALUES
('炎症性皮膚疾患', 'Inflammatory Skin Diseases', '皮膚の炎症を主体とする疾患群', 1),
('感染性皮膚疾患', 'Infectious Skin Diseases', '細菌、真菌、ウイルスなどによる皮膚感染症', 2),
('腫瘍性皮膚疾患', 'Neoplastic Skin Diseases', '皮膚の良性・悪性腫瘍', 3),
('自己免疫性皮膚疾患', 'Autoimmune Skin Diseases', '自己免疫機序による皮膚疾患', 4),
('遺伝性皮膚疾患', 'Genetic Skin Diseases', '遺伝的要因による皮膚疾患', 5),
('代謝性皮膚疾患', 'Metabolic Skin Diseases', '代謝異常に伴う皮膚症状', 6);

-- 症状カテゴリの挿入
INSERT INTO symptom_categories (name, name_en, description, display_order) VALUES
('皮膚の見た目', 'Skin Appearance', '皮膚の色調、形状、表面の変化', 1),
('感覚症状', 'Sensory Symptoms', 'かゆみ、痛み、しびれなどの感覚', 2),
('発症部位', 'Location', '症状が現れる身体部位', 3),
('発症時期・経過', 'Timing and Course', '症状の発症時期や経過パターン', 4),
('誘因・悪化要因', 'Triggers and Aggravating Factors', '症状を引き起こす・悪化させる要因', 5),
('随伴症状', 'Associated Symptoms', '皮膚症状以外の全身症状', 6);

-- 疾患データの挿入
INSERT INTO diseases (name, name_en, category_id, overview, detailed_description, prevalence, severity_level, is_common, genetic_factor, chronic, search_keywords) VALUES
(
  'アトピー性皮膚炎',
  'Atopic Dermatitis',
  (SELECT id FROM disease_categories WHERE name = '炎症性皮膚疾患'),
  'アトピー性皮膚炎は、慢性的にかゆみを伴う湿疹が良くなったり悪くなったりを繰り返す皮膚疾患です。',
  'アトピー性皮膚炎は、皮膚バリア機能の低下とアレルギー炎症により生じる慢性炎症性皮膚疾患です。遺伝的素因に環境要因が加わって発症し、特徴的な皮疹の分布と強いかゆみを呈します。',
  0.1200,
  'moderate',
  true,
  true,
  true,
  ARRAY['アトピー', '湿疹', 'かゆみ', '乾燥肌', 'アレルギー']
),
(
  '接触皮膚炎',
  'Contact Dermatitis',
  (SELECT id FROM disease_categories WHERE name = '炎症性皮膚疾患'),
  '接触皮膚炎は、特定の物質との接触により皮膚に炎症が起こる疾患です。',
  '接触皮膚炎は、外来物質との接触により生じる皮膚炎で、アレルギー性と刺激性に分類されます。原因物質の特定と除去が治療の基本となります。',
  0.0800,
  'mild',
  true,
  false,
  false,
  ARRAY['接触', 'かぶれ', 'アレルギー', '化粧品', '洗剤']
),
(
  '脂漏性皮膚炎',
  'Seborrheic Dermatitis',
  (SELECT id FROM disease_categories WHERE name = '炎症性皮膚疾患'),
  '脂漏性皮膚炎は、皮脂分泌の多い部位に起こる慢性的な炎症性皮膚疾患です。',
  '脂漏性皮膚炎は、皮脂腺の多い部位に生じる慢性炎症性皮膚疾患で、マラセチア菌の関与が示唆されています。頭皮、顔面、胸部などに好発します。',
  0.0500,
  'mild',
  true,
  false,
  true,
  ARRAY['脂漏性', 'フケ', '頭皮', '顔面', 'マラセチア']
),
(
  '乾癬',
  'Psoriasis',
  (SELECT id FROM disease_categories WHERE name = '自己免疫性皮膚疾患'),
  '乾癬は、皮膚の細胞が異常に速く作られることで起こる慢性的な炎症性皮膚疾患です。',
  '乾癬は、表皮の異常な増殖と炎症を特徴とする慢性炎症性皮膚疾患です。遺伝的素因に環境要因が加わって発症し、特徴的な鱗屑を伴う紅斑を呈します。',
  0.0030,
  'moderate',
  false,
  true,
  true,
  ARRAY['乾癬', '鱗屑', '紅斑', '慢性', '自己免疫']
);

-- 症状データの挿入
INSERT INTO symptoms (name, name_en, category_id, description, severity_weight, is_primary, search_keywords) VALUES
(
  'かゆみ',
  'Itching',
  (SELECT id FROM symptom_categories WHERE name = '感覚症状'),
  '皮膚に生じる掻きたくなる不快な感覚',
  2.5,
  true,
  ARRAY['かゆい', 'そう痒', 'むずむず']
),
(
  '皮膚の乾燥',
  'Dry Skin',
  (SELECT id FROM symptom_categories WHERE name = '皮膚の見た目'),
  '皮膚の水分が不足してカサカサした状態',
  2.0,
  true,
  ARRAY['乾燥', 'カサカサ', 'ドライスキン']
),
(
  '赤み・炎症',
  'Redness and Inflammation',
  (SELECT id FROM symptom_categories WHERE name = '皮膚の見た目'),
  '皮膚が赤くなり炎症を起こした状態',
  2.2,
  true,
  ARRAY['赤い', '炎症', '紅斑', '発赤']
),
(
  '鱗屑',
  'Scaling',
  (SELECT id FROM symptom_categories WHERE name = '皮膚の見た目'),
  '皮膚表面に細かいかさぶた状のものが付着した状態',
  1.8,
  false,
  ARRAY['かさぶた', 'フケ', '皮むけ']
),
(
  '水疱',
  'Vesicles',
  (SELECT id FROM symptom_categories WHERE name = '皮膚の見た目'),
  '皮膚に水分を含んだ小さな袋状の隆起ができた状態',
  1.5,
  false,
  ARRAY['水ぶくれ', 'ブツブツ', '小水疱']
),
(
  '顔面の症状',
  'Facial Symptoms',
  (SELECT id FROM symptom_categories WHERE name = '発症部位'),
  '顔面に現れる皮膚症状',
  1.3,
  false,
  ARRAY['顔', '額', '頬', '顎']
),
(
  '頭皮の症状',
  'Scalp Symptoms',
  (SELECT id FROM symptom_categories WHERE name = '発症部位'),
  '頭皮に現れる皮膚症状',
  1.4,
  false,
  ARRAY['頭', '髪の毛', 'スカルプ']
),
(
  '季節性の悪化',
  'Seasonal Worsening',
  (SELECT id FROM symptom_categories WHERE name = '発症時期・経過'),
  '特定の季節に症状が悪化する傾向',
  1.2,
  false,
  ARRAY['季節', '冬', '夏', '春', '秋']
),
(
  'ストレスによる悪化',
  'Stress-induced Worsening',
  (SELECT id FROM symptom_categories WHERE name = '誘因・悪化要因'),
  'ストレスにより症状が悪化する傾向',
  1.1,
  false,
  ARRAY['ストレス', '精神的', '疲労']
),
(
  '化粧品による悪化',
  'Cosmetic-induced Worsening',
  (SELECT id FROM symptom_categories WHERE name = '誘因・悪化要因'),
  '化粧品の使用により症状が悪化する',
  1.6,
  false,
  ARRAY['化粧品', 'コスメ', 'スキンケア']
);

-- 疾患-症状関連データの挿入
INSERT INTO disease_symptoms (disease_id, symptom_id, relevance_score, frequency_percentage, is_diagnostic) VALUES
-- アトピー性皮膚炎
((SELECT id FROM diseases WHERE name = 'アトピー性皮膚炎'), (SELECT id FROM symptoms WHERE name = 'かゆみ'), 3.0, 95, true),
((SELECT id FROM diseases WHERE name = 'アトピー性皮膚炎'), (SELECT id FROM symptoms WHERE name = '皮膚の乾燥'), 2.8, 90, true),
((SELECT id FROM diseases WHERE name = 'アトピー性皮膚炎'), (SELECT id FROM symptoms WHERE name = '赤み・炎症'), 2.5, 85, false),
((SELECT id FROM diseases WHERE name = 'アトピー性皮膚炎'), (SELECT id FROM symptoms WHERE name = '季節性の悪化'), 1.8, 70, false),
((SELECT id FROM diseases WHERE name = 'アトピー性皮膚炎'), (SELECT id FROM symptoms WHERE name = 'ストレスによる悪化'), 1.5, 60, false),

-- 接触皮膚炎
((SELECT id FROM diseases WHERE name = '接触皮膚炎'), (SELECT id FROM symptoms WHERE name = '赤み・炎症'), 2.8, 90, true),
((SELECT id FROM diseases WHERE name = '接触皮膚炎'), (SELECT id FROM symptoms WHERE name = 'かゆみ'), 2.5, 80, false),
((SELECT id FROM diseases WHERE name = '接触皮膚炎'), (SELECT id FROM symptoms WHERE name = '水疱'), 2.2, 60, false),
((SELECT id FROM diseases WHERE name = '接触皮膚炎'), (SELECT id FROM symptoms WHERE name = '化粧品による悪化'), 2.5, 40, true),

-- 脂漏性皮膚炎
((SELECT id FROM diseases WHERE name = '脂漏性皮膚炎'), (SELECT id FROM symptoms WHERE name = '鱗屑'), 2.8, 85, true),
((SELECT id FROM diseases WHERE name = '脂漏性皮膚炎'), (SELECT id FROM symptoms WHERE name = '頭皮の症状'), 2.5, 80, true),
((SELECT id FROM diseases WHERE name = '脂漏性皮膚炎'), (SELECT id FROM symptoms WHERE name = '顔面の症状'), 2.2, 70, false),
((SELECT id FROM diseases WHERE name = '脂漏性皮膚炎'), (SELECT id FROM symptoms WHERE name = '赤み・炎症'), 2.0, 75, false),

-- 乾癬
((SELECT id FROM diseases WHERE name = '乾癬'), (SELECT id FROM symptoms WHERE name = '鱗屑'), 3.0, 95, true),
((SELECT id FROM diseases WHERE name = '乾癬'), (SELECT id FROM symptoms WHERE name = '赤み・炎症'), 2.8, 90, true),
((SELECT id FROM diseases WHERE name = '乾癬'), (SELECT id FROM symptoms WHERE name = 'ストレスによる悪化'), 2.0, 65, false);

-- 治療法データの挿入
INSERT INTO treatments (disease_id, name, name_en, type, description, effectiveness_score, evidence_level, first_line) VALUES
-- アトピー性皮膚炎の治療
((SELECT id FROM diseases WHERE name = 'アトピー性皮膚炎'), 'ステロイド外用薬', 'Topical Corticosteroids', 'topical', '炎症を抑える外用薬', 2.8, 'A', true),
((SELECT id FROM diseases WHERE name = 'アトピー性皮膚炎'), 'タクロリムス軟膏', 'Tacrolimus Ointment', 'topical', '免疫抑制作用のある外用薬', 2.5, 'A', false),
((SELECT id FROM diseases WHERE name = 'アトピー性皮膚炎'), '保湿剤', 'Moisturizers', 'topical', '皮膚の保湿を行う基本治療', 2.2, 'A', true),
((SELECT id FROM diseases WHERE name = 'アトピー性皮膚炎'), '抗ヒスタミン薬', 'Antihistamines', 'oral', 'かゆみを抑える内服薬', 1.8, 'B', false),

-- 接触皮膚炎の治療
((SELECT id FROM diseases WHERE name = '接触皮膚炎'), 'ステロイド外用薬', 'Topical Corticosteroids', 'topical', '炎症を抑える外用薬', 2.8, 'A', true),
((SELECT id FROM diseases WHERE name = '接触皮膚炎'), '原因物質の除去', 'Allergen Avoidance', 'lifestyle', '原因となる物質との接触を避ける', 3.0, 'A', true),
((SELECT id FROM diseases WHERE name = '接触皮膚炎'), '抗ヒスタミン薬', 'Antihistamines', 'oral', 'かゆみを抑える内服薬', 2.0, 'B', false),

-- 脂漏性皮膚炎の治療
((SELECT id FROM diseases WHERE name = '脂漏性皮膚炎'), '抗真菌薬外用', 'Topical Antifungals', 'topical', 'マラセチア菌を抑制する外用薬', 2.6, 'A', true),
((SELECT id FROM diseases WHERE name = '脂漏性皮膚炎'), 'ステロイド外用薬', 'Topical Corticosteroids', 'topical', '炎症を抑える外用薬', 2.4, 'A', false),
((SELECT id FROM diseases WHERE name = '脂漏性皮膚炎'), '抗真菌シャンプー', 'Antifungal Shampoo', 'topical', '頭皮用の抗真菌シャンプー', 2.2, 'B', true),

-- 乾癬の治療
((SELECT id FROM diseases WHERE name = '乾癬'), 'ビタミンD3製剤', 'Vitamin D3 Analogs', 'topical', '角化を正常化する外用薬', 2.6, 'A', true),
((SELECT id FROM diseases WHERE name = '乾癬'), 'ステロイド外用薬', 'Topical Corticosteroids', 'topical', '炎症を抑える外用薬', 2.4, 'A', true),
((SELECT id FROM diseases WHERE name = '乾癬'), '光線療法', 'Phototherapy', 'procedure', '紫外線による治療', 2.8, 'A', false),
((SELECT id FROM diseases WHERE name = '乾癬'), 'メトトレキサート', 'Methotrexate', 'oral', '免疫抑制薬', 2.5, 'A', false);
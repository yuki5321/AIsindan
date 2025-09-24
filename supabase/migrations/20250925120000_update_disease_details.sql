-- This script updates existing diseases with detailed information previously hardcoded in the frontend.

-- Update Atopic Dermatitis
UPDATE public.diseases
SET 
    detailed_description = 'アトピー性皮膚炎は、強いかゆみを伴う湿疹が良くなったり悪くなったりを繰り返す慢性の皮膚疾患です。多くはアレルギー体質の人に見られます。',
    symptoms_ja = ARRAY['強いかゆみ', '皮膚の乾燥', '赤み・炎症', '皮膚のごわつき', '掻き傷による出血', '色素沈着'],
    causes_ja = ARRAY['遺伝的要因（家族歴）', 'アレルギー体質', '皮膚バリア機能の低下', '環境要因（ダニ、花粉など）', 'ストレス'],
    treatments_ja = ARRAY['ステロイド外用薬', 'タクロリムス軟膏', '保湿剤の継続使用', '抗ヒスタミン薬（内服）', 'スキンケア指導'],
    prevention_ja = ARRAY['適切な保湿ケア', 'アレルゲンの回避', '爪を短く切る', '綿素材の衣類着用', 'ストレス管理'],
    prognosis_ja = '適切な治療により症状をコントロールできます。成人までに改善することが多いですが、慢性的な管理が必要な場合もあります。'
WHERE name_en = 'Atopic Dermatitis';

-- Update Psoriasis
UPDATE public.diseases
SET 
    detailed_description = '乾癬は、皮膚の細胞が異常に速く作られることで、銀白色の鱗屑（りんせつ）を伴う赤い発疹が特徴の慢性的な炎症性皮膚疾患です。',
    symptoms_ja = ARRAY['銀白色の鱗屑を伴う紅斑', 'かゆみ', '皮膚の肥厚', '関節痛（一部の患者）', '爪の変化'],
    causes_ja = ARRAY['遺伝的要因', '免疫系の異常', 'ストレス', '感染症', '特定の薬剤'],
    treatments_ja = ARRAY['ステロイド外用薬', 'ビタミンD3製剤', '光線療法（紫外線治療）', '生物学的製剤（重症例）'],
    prevention_ja = ARRAY['ストレス管理', '適度な日光浴', '禁煙', '皮膚の乾燥を防ぐ', '感染症の予防'],
    prognosis_ja = '慢性的な疾患ですが、適切な治療により症状を良好にコントロールすることが可能です。完治は難しいとされています。'
WHERE name_en = 'Psoriasis';

-- Update Seborrheic Keratosis (a type of benign keratosis-like lesions)
UPDATE public.diseases
SET 
    detailed_description = '主に加齢によって発生する良性の皮膚腫瘍です。通常、治療の必要はありませんが、見た目が気になる場合や診断を確定するために切除されることがあります。',
    symptoms_ja = ARRAY['わずかに盛り上がった斑点', '表面はざらざらしている', '色は褐色から黒色まで様々', 'かゆみを伴うことがある'],
    causes_ja = ARRAY['加齢', '遺伝的要因', '日光への曝露'],
    treatments_ja = ARRAY['液体窒素による凍結療法', 'レーザー治療', '外科的切除'],
    prevention_ja = ARRAY['明確な予防法はありませんが、日光への過度な曝露を避けることが推奨されます。'],
    prognosis_ja = '完全に良性であり、がん化することはありません。'
WHERE name_en = 'benign keratosis-like lesions';

-- Update Melanoma
UPDATE public.diseases
SET 
    detailed_description = 'メラノーマは、メラノサイトという色素細胞ががん化して発生する、悪性度の非常に高い皮膚がんです。早期発見と早期治療が極めて重要です。',
    symptoms_ja = ARRAY['ほくろの形が左右非対称になる', '境界がギザギザになる', '色に濃淡のむらができる', 'サイズが大きくなる（直径6mm以上）', '隆起したり、出血したりする'],
    causes_ja = ARRAY['紫外線への過度な曝露', '遺伝的要因', '多数のほくろ', '免疫抑制状態'],
    treatments_ja = ARRAY['外科的切除（第一選択）', 'センチネルリンパ節生検', '免疫チェックポイント阻害薬', '分子標的薬', '化学療法'],
    prevention_ja = ARRAY['紫外線対策（日焼け止めの使用、衣類の工夫）', 'ほくろの自己チェック', '急な変化がある場合は速やかに受診'],
    prognosis_ja = '早期に発見し治療すれば治癒率が高いですが、進行すると転移しやすく、治療が困難になります。'
WHERE name_en = 'melanoma';

-- Update Basal Cell Carcinoma
UPDATE public.diseases
SET 
    detailed_description = '最も頻度の高い皮膚がんですが、悪性度は比較的低く、通常はゆっくりと成長し、転移することは稀です。',
    symptoms_ja = ARRAY['光沢のある半透明のしこり', '中心が潰瘍化することがある', '黒い色素沈着を伴うことがある', 'ゆっくりと拡大する'],
    causes_ja = ARRAY['紫外線への長期間の曝露', '色白の肌', '免疫抑制状態'],
    treatments_ja = ARRAY['外科的切除', '凍結療法', '放射線治療', '外用薬（イミキモドなど）'],
    prevention_ja = ARRAY['紫外線対策', '定期的な皮膚の自己チェック'],
    prognosis_ja = '適切に治療すれば治癒率は非常に高いですが、再発することもあります。'
WHERE name_en = 'basal cell carcinoma';

SELECT 'Disease details have been updated.' as status;

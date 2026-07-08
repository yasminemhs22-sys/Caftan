-- ============================================================================
-- LA CASA DEL CAFTAN — MIGRATION 02
-- ============================================================================
-- À exécuter UNIQUEMENT si tu as déjà exécuté schema.sql une première fois.
-- (Si tu pars d'une base neuve, schema.sql contient déjà tout ça — inutile
-- d'exécuter ce fichier en plus.)
--
-- Ce script est idempotent : tu peux le relancer sans risque, il ne duplique
-- rien et ne touche pas à tes données existantes (produits, commandes...).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SETTINGS — Analytics + correction de la couleur secondaire par défaut
-- ----------------------------------------------------------------------------
alter table public.settings add column if not exists ga_measurement_id text;
alter table public.settings add column if not exists meta_pixel_id text;

-- La valeur d'origine (#FFFFFF) ne correspondait pas au vrai "blanc cassé" de
-- la charte (#FAF9F6). On corrige uniquement si personne n'a déjà changé la
-- valeur depuis le Dashboard.
update public.settings set secondary_color = '#FAF9F6'
where id = 1 and secondary_color = '#FFFFFF';

-- ----------------------------------------------------------------------------
-- 2. ORDERS — Suivi du paiement en ligne, indépendant du statut de commande
-- ----------------------------------------------------------------------------
alter table public.orders add column if not exists payment_status text not null default 'pending';
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('pending','paid','failed','refunded','not_applicable'));
alter table public.orders add column if not exists payment_provider text;
alter table public.orders add column if not exists payment_reference text;
create index if not exists idx_orders_payment_reference on public.orders(payment_reference);

-- Les commandes déjà existantes en COD/virement ne passent pas par un
-- fournisseur de paiement en ligne : on les marque explicitement.
update public.orders set payment_status = 'not_applicable'
where payment_method in ('cod','bank_transfer') and payment_status = 'pending';

-- ----------------------------------------------------------------------------
-- 3. PAYMENT_EVENTS — Journal brut des webhooks reçus (idempotence + debug)
-- ----------------------------------------------------------------------------
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  order_id uuid references public.orders(id) on delete set null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);
alter table public.payment_events enable row level security;
drop policy if exists admin_only on public.payment_events;
create policy admin_only on public.payment_events for all using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- 4. SITE_CONTENT — Textes légaux désormais éditables depuis le Dashboard
-- ----------------------------------------------------------------------------
insert into public.site_content (content_key, content_value, content_type, description) values
  ('privacy_policy_body', '{}'::jsonb, 'richtext', 'Politique de confidentialité — modèle générique, à faire valider par un professionnel avant mise en production'),
  ('terms_of_sale_body', '{}'::jsonb, 'richtext', 'Conditions générales de vente — modèle générique, à faire valider par un professionnel avant mise en production')
on conflict (content_key) do nothing;

-- Contenu par défaut (modèle générique professionnel, structuré en sections
-- "Titre\nParagraphe" séparées par une ligne vide — voir PrivacyBodyClient.tsx
-- et TermsBodyClient.tsx pour le rendu). À personnaliser puis faire valider
-- par un professionnel avant mise en production réelle.
-- Contenu généré automatiquement (échappement JSON garanti par Python) — voir gen_legal.py
update public.site_content set content_value = '{"fr": "1. Préambule\nLa Casa Del Caftan («nous») accorde une grande importance à la protection de vos données personnelles. Cette politique explique quelles données nous collectons, pourquoi, et quels sont vos droits.\n\n2. Responsable du traitement\nLe responsable du traitement des données est La Casa Del Caftan, RN24, Alger Plage, Algérie, 16000, joignable à casacaftan16@gmail.com.\n\n3. Données collectées\nNous collectons les données que vous nous fournissez directement : nom, prénom, adresse e-mail, numéro de téléphone, adresse de livraison et ville, ainsi que l’historique de vos commandes et, si vous créez un compte, vos identifiants de connexion.\n\n4. Finalités du traitement\nCes données sont utilisées pour traiter et livrer vos commandes, répondre à vos demandes, gérer votre compte client, vous envoyer notre newsletter si vous y êtes inscrit·e, et améliorer nos services.\n\n5. Base légale\nLe traitement de vos données repose sur l’exécution du contrat de vente, votre consentement (newsletter) ou notre intérêt légitime à améliorer notre service client.\n\n6. Partage des données\nVos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec nos prestataires techniques (hébergement, paiement, livraison) dans la stricte mesure nécessaire au traitement de votre commande, sous des engagements de confidentialité appropriés.\n\n7. Durée de conservation\nVos données sont conservées le temps nécessaire aux finalités décrites ci-dessus, et conformément aux durées légales de conservation applicables en matière commerciale et comptable.\n\n8. Cookies\nLe site utilise des cookies techniques nécessaires à son fonctionnement (panier, préférence de langue) et peut utiliser des cookies de mesure d’audience. Vous pouvez configurer votre navigateur pour refuser les cookies non essentiels.\n\n9. Sécurité\nNous mettons en œuvre des mesures techniques et organisationnelles raisonnables pour protéger vos données contre l’accès non autorisé, la perte ou l’altération.\n\n10. Vos droits\nVous disposez d’un droit d’accès, de rectification, de suppression et d’opposition concernant vos données. Pour l’exercer, contactez-nous à l’adresse indiquée dans la section Contact.\n\n11. Modifications\nCette politique peut être mise à jour. La date de dernière modification figure en bas de cette page ; nous vous invitons à la consulter régulièrement.", "en": "1. Introduction\nLa Casa Del Caftan (“we”) takes the protection of your personal data seriously. This policy explains what data we collect, why, and what rights you have.\n\n2. Data controller\nThe data controller is La Casa Del Caftan, RN24, Alger Plage, Algeria, 16000, reachable at casacaftan16@gmail.com.\n\n3. Data we collect\nWe collect the data you provide directly: first name, last name, email address, phone number, delivery address and city, your order history, and, if you create an account, your login credentials.\n\n4. Purpose of processing\nThis data is used to process and deliver your orders, respond to your requests, manage your customer account, send our newsletter if you are subscribed, and improve our services.\n\n5. Legal basis\nProcessing is based on the performance of the sales contract, your consent (newsletter), or our legitimate interest in improving customer service.\n\n6. Data sharing\nYour data is never sold to third parties. It may be shared with our technical providers (hosting, payment, delivery) strictly as needed to process your order, under appropriate confidentiality commitments.\n\n7. Retention period\nYour data is kept for as long as necessary for the purposes described above, and in line with applicable legal retention periods for commercial and accounting matters.\n\n8. Cookies\nThe site uses technical cookies necessary for its operation (cart, language preference) and may use audience-measurement cookies. You can configure your browser to reject non-essential cookies.\n\n9. Security\nWe implement reasonable technical and organizational measures to protect your data against unauthorized access, loss, or alteration.\n\n10. Your rights\nYou have the right to access, rectify, delete, and object to the processing of your data. To exercise these rights, contact us at the address listed in the Contact section.\n\n11. Changes\nThis policy may be updated. The last modification date appears at the bottom of this page; we encourage you to review it periodically.", "ar": "1. مقدمة\nتولي لا كازا ديل قفطان («نحن») أهمية كبيرة لحماية بياناتكم الشخصية. توضح هذه السياسة البيانات التي نجمعها، ولماذا، وما هي حقوقكم.\n\n2. الجهة المسؤولة عن المعالجة\nالجهة المسؤولة عن معالجة البيانات هي لا كازا ديل قفطان، الطريق الوطني 24، الجزائر بلاج، الجزائر، 16000، ويمكن التواصل معها عبر casacaftan16@gmail.com.\n\n3. البيانات التي نجمعها\nنجمع البيانات التي تقدمينها لنا مباشرة: الاسم، اللقب، البريد الإلكتروني، رقم الهاتف، عنوان التوصيل والمدينة، بالإضافة إلى سجل طلباتكم، وفي حال إنشاء حساب، بيانات تسجيل الدخول.\n\n4. أغراض المعالجة\nتُستخدم هذه البيانات لمعالجة طلباتكم وتوصيلها، والرد على استفساراتكم، وإدارة حسابكم، وإرسال نشرتنا الإخبارية إذا كنتم مشتركين فيها، وتحسين خدماتنا.\n\n5. الأساس القانوني\nتستند معالجة بياناتكم إلى تنفيذ عقد البيع، أو موافقتكم (النشرة الإخبارية)، أو مصلحتنا المشروعة في تحسين خدمة العملاء.\n\n6. مشاركة البيانات\nلا تُباع بياناتكم أبدًا لأطراف ثالثة. يمكن مشاركتها مع مزوّدينا التقنيين (الاستضافة، الدفع، التوصيل) في الحدود الضرورية فقط لمعالجة طلبكم، وبموجب التزامات سرية مناسبة.\n\n7. مدة الاحتفاظ بالبيانات\nيتم الاحتفاظ ببياناتكم للمدة اللازمة تحقيقًا للأغراض المذكورة أعلاه، ووفقًا للمدد القانونية المعمول بها في المجالين التجاري والمحاسبي.\n\n8. ملفات تعريف الارتباط (Cookies)\nيستخدم الموقع ملفات تعريف ارتباط تقنية ضرورية لتشغيله (سلة التسوق، تفضيل اللغة) وقد يستخدم ملفات لقياس الجمهور. يمكنكم ضبط متصفحكم لرفض ملفات تعريف الارتباط غير الضرورية.\n\n9. الأمان\nنطبق تدابير تقنية وتنظيمية معقولة لحماية بياناتكم من الوصول غير المصرح به أو الفقدان أو التغيير.\n\n10. حقوقكم\nلكم الحق في الوصول إلى بياناتكم وتصحيحها وحذفها والاعتراض على معالجتها. لممارسة هذه الحقوق، تواصلوا معنا عبر العنوان المذكور في قسم الاتصال.\n\n11. التعديلات\nيمكن تحديث هذه السياسة. يظهر تاريخ آخر تعديل أسفل هذه الصفحة؛ ندعوكم لمراجعتها بانتظام."}'::jsonb where content_key = 'privacy_policy_body';
update public.site_content set content_value = '{"fr": "1. Objet\nLes présentes conditions générales régissent les ventes réalisées sur le site La Casa Del Caftan entre la boutique et ses client·es, à l’exclusion de toute autre condition.\n\n2. Produits et prix\nLes prix sont indiqués en dinars algériens (DZD), toutes taxes applicables comprises. La Casa Del Caftan se réserve le droit de modifier ses prix à tout moment, les commandes déjà confirmées n’étant pas affectées.\n\n3. Commande\nToute commande passée sur le site fait l’objet d’une confirmation par notre équipe (téléphone, e-mail ou WhatsApp) avant expédition. La Casa Del Caftan se réserve le droit de refuser ou d’annuler toute commande en cas de doute raisonnable (coordonnées incomplètes, litige antérieur, rupture de stock).\n\n4. Paiement\nLe paiement s’effectue à la livraison, par virement bancaire, ou en ligne lorsque cette option est proposée sur le site. Les paiements en ligne sont traités par un prestataire tiers spécialisé ; La Casa Del Caftan n’a à aucun moment accès à vos données bancaires complètes.\n\n5. Livraison\nLes délais et frais de livraison sont précisés lors du passage de commande et peuvent varier selon la wilaya de livraison. La Casa Del Caftan met tout en œuvre pour respecter les délais annoncés, sans garantie absolue en cas de circonstances indépendantes de sa volonté.\n\n6. Retours et échanges\nSauf mention contraire communiquée au moment de la commande, tout retour ou échange doit être signalé dans un délai raisonnable après réception, l’article devant être retourné dans son état d’origine. Les modalités précises seront confirmées par notre équipe.\n\n7. Responsabilité\nLa Casa Del Caftan ne saurait être tenue responsable des retards ou inexécutions dus à un cas de force majeure, ni des dommages indirects liés à l’usage du site.\n\n8. Propriété intellectuelle\nL’ensemble des contenus du site (textes, photographies, logo) est la propriété de La Casa Del Caftan et ne peut être reproduit sans autorisation préalable.\n\n9. Droit applicable et litiges\nLes présentes conditions sont soumises au droit algérien. En cas de litige, une solution amiable sera recherchée en priorité avant toute action judiciaire.", "en": "1. Purpose\nThese terms and conditions govern sales made on the La Casa Del Caftan website between the boutique and its customers, to the exclusion of any other terms.\n\n2. Products and prices\nPrices are shown in Algerian dinars (DZD), inclusive of all applicable taxes. La Casa Del Caftan reserves the right to change its prices at any time; confirmed orders are not affected.\n\n3. Orders\nEvery order placed on the site is confirmed by our team (phone, email, or WhatsApp) before shipping. La Casa Del Caftan reserves the right to refuse or cancel any order in case of reasonable doubt (incomplete details, prior dispute, out of stock).\n\n4. Payment\nPayment is made on delivery, by bank transfer, or online where this option is offered on the site. Online payments are processed by a specialized third-party provider; La Casa Del Caftan never has access to your full banking details.\n\n5. Delivery\nDelivery times and fees are specified when placing an order and may vary by wilaya. La Casa Del Caftan does its best to meet announced timeframes, without absolute guarantee in case of circumstances beyond its control.\n\n6. Returns and exchanges\nUnless stated otherwise at the time of order, any return or exchange must be reported within a reasonable time after receipt, with the item returned in its original condition. Exact terms will be confirmed by our team.\n\n7. Liability\nLa Casa Del Caftan cannot be held responsible for delays or failures due to force majeure, nor for indirect damages related to use of the site.\n\n8. Intellectual property\nAll content on the site (text, photographs, logo) is the property of La Casa Del Caftan and may not be reproduced without prior authorization.\n\n9. Governing law and disputes\nThese terms are governed by Algerian law. In the event of a dispute, an amicable solution will be sought first, before any legal action.", "ar": "1. الموضوع\nتحكم هذه الشروط والأحكام عمليات البيع التي تتم عبر موقع لا كازا ديل قفطان بين المتجر وعملائه، باستثناء أي شروط أخرى.\n\n2. المنتجات والأسعار\nالأسعار معروضة بالدينار الجزائري (DZD)، شاملة جميع الضرائب المطبقة. تحتفظ لا كازا ديل قفطان بحق تعديل أسعارها في أي وقت، دون أن يؤثر ذلك على الطلبات المؤكدة مسبقًا.\n\n3. الطلب\nيخضع كل طلب على الموقع لتأكيد من فريقنا (هاتفيًا أو عبر البريد الإلكتروني أو واتساب) قبل الشحن. تحتفظ لا كازا ديل قفطان بحق رفض أو إلغاء أي طلب في حال وجود شك معقول (معلومات ناقصة، نزاع سابق، نفاد المخزون).\n\n4. الدفع\nيتم الدفع عند الاستلام، أو عبر التحويل البنكي، أو إلكترونيًا عند توفر هذا الخيار على الموقع. تتم معالجة المدفوعات الإلكترونية من قبل مزوّد خارجي متخصص؛ ولا تصل لا كازا ديل قفطان في أي وقت إلى بياناتكم البنكية الكاملة.\n\n5. التوصيل\nتُحدَّد مدة وتكلفة التوصيل عند إتمام الطلب وقد تختلف حسب الولاية. تبذل لا كازا ديل قفطان قصارى جهدها لاحترام المواعيد المعلنة، دون ضمان مطلق في حال ظروف خارجة عن إرادتها.\n\n6. الإرجاع والاستبدال\nما لم يُذكر خلاف ذلك عند الطلب، يجب الإبلاغ عن أي إرجاع أو استبدال خلال مدة معقولة بعد الاستلام، مع إعادة المنتج بحالته الأصلية. سيتم تأكيد التفاصيل الدقيقة من قبل فريقنا.\n\n7. المسؤولية\nلا تتحمل لا كازا ديل قفطان مسؤولية التأخير أو عدم التنفيذ الناتج عن قوة قاهرة، ولا الأضرار غير المباشرة المرتبطة باستخدام الموقع.\n\n8. الملكية الفكرية\nجميع محتويات الموقع (النصوص، الصور، الشعار) ملك لـ لا كازا ديل قفطان ولا يجوز نسخها دون إذن مسبق.\n\n9. القانون المطبق والنزاعات\nتخضع هذه الشروط للقانون الجزائري. في حال وجود نزاع، سيتم البحث عن حل ودي أولاً قبل أي إجراء قضائي."}'::jsonb where content_key = 'terms_of_sale_body';


-- ----------------------------------------------------------------------------
-- 5. SEO — Ligne globale utilisée en repli sur toutes les pages
-- ----------------------------------------------------------------------------
insert into public.seo (page_slug, meta_title, meta_description)
values (
  'global',
  '{"fr":"La Casa Del Caftan","en":"La Casa Del Caftan","ar":"لا كازا ديل قفطان"}',
  '{"fr":"L\u2019élégance du caftan, réinventée. Maison de mode féminine haut de gamme à Alger.","en":"The elegance of the caftan, reinvented. Premium women\u2019s fashion house in Algiers.","ar":"أناقة القفطان بروح عصرية. دار أزياء نسائية راقية في الجزائر."}'
)
on conflict (page_slug) do nothing;

-- ----------------------------------------------------------------------------
-- 6. HERO_SLIDES — Diapositive par défaut (reprend la photo déjà fournie)
-- ----------------------------------------------------------------------------
insert into public.hero_slides (title, subtitle, image_url, cta_text, cta_link, display_order, is_active)
select
  '{"fr":"L\u2019élégance du caftan, réinventée","en":"The elegance of the caftan, reinvented","ar":"أناقة القفطان، بروح عصرية"}',
  '{"fr":"Des pièces d\u2019exception pensées pour la femme d\u2019aujourd\u2019hui, entre héritage et modernité.","en":"Exceptional pieces designed for today\u2019s woman, between heritage and modernity.","ar":"قطع استثنائية صُممت للمرأة العصرية، بين الإرث والحداثة."}',
  '/images/boutique-interieur-1.png',
  '{"fr":"Découvrir la collection","en":"Discover the collection","ar":"اكتشفي المجموعة"}',
  '/boutique', 1, true
where not exists (select 1 from public.hero_slides);

-- ----------------------------------------------------------------------------
-- 7. GALLERY — Reprend les 2 photos déjà fournies (au lieu d'être codées en dur)
-- ----------------------------------------------------------------------------
insert into public.gallery (image_url, caption, display_order, is_active)
select '/images/boutique-interieur-1.png', '{"fr":"Notre boutique","en":"Our boutique","ar":"متجرنا"}', 1, true
where not exists (select 1 from public.gallery where image_url = '/images/boutique-interieur-1.png');

insert into public.gallery (image_url, caption, display_order, is_active)
select '/images/boutique-interieur-2.png', '{"fr":"L\u2019intérieur La Casa Del Caftan","en":"Inside La Casa Del Caftan","ar":"داخل لا كازا ديل قفطان"}', 2, true
where not exists (select 1 from public.gallery where image_url = '/images/boutique-interieur-2.png');

-- ============================================================================
-- FIN DE LA MIGRATION 02
-- ============================================================================

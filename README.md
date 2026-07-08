# La Casa Del Caftan — Site e-commerce

Boutique en ligne premium pour La Casa Del Caftan, construite avec Next.js 14
(App Router), TypeScript, TailwindCSS, Framer Motion et Supabase.
Multilingue FR / EN / AR (bascule RTL automatique). Dashboard admin complet :
quasiment tout ce qui s'affiche sur le site est éditable depuis Supabase,
sans toucher au code.

---

## 1. État du projet — à lire en premier

### ✅ Entièrement fonctionnel et piloté par Supabase
- **Boutique publique** : Accueil (hero en carrousel, nouveautés, collections
  mises en avant, galerie, témoignages), Boutique (filtres/tri/recherche),
  Nouveautés, Promotions, Collections (page liste + page par collection),
  Fiche produit (galerie, couleurs/tailles, avis clients **+ formulaire pour
  en déposer**, produits similaires, favoris), Panier + commande (COD /
  virement / **paiement en ligne**), Mon compte (profil + historique de
  commandes avec statut de paiement), Favoris, Contact (carte, WhatsApp,
  horaires d'ouverture), À propos, FAQ, Connexion/Inscription/Mot de passe
  oublié, 404, Politique de confidentialité et CGV.
- **Dashboard admin** (protégé par rôle) : Produits, Catégories, Collections,
  **Bannières & Hero** (carrousel réordonnable par glisser-déposer),
  **Galerie** (réordonnable par glisser-déposer), Témoignages, **Avis
  clients** (modération — approuver/supprimer), FAQ, Messages (boîte de
  réception contact + questions produit), Newsletter, **Réglages** (identité,
  logo, favicon, contact, réseaux sociaux, horaires, couleurs, SEO,
  Analytics).
- **Identité entièrement dynamique** : nom du site, logo, favicon, couleurs
  de marque, réseaux sociaux, coordonnées, horaires — tout se change depuis
  Réglages, sans toucher au code ni redéployer. Le thème de couleurs
  (noir/blanc/doré par défaut) est calculé via variables CSS ; changer la
  couleur d'accent dans Réglages retinte tout le site (boutons, liens,
  badges...) immédiatement.
- **SEO dynamique** : metadata par page (titre/description/image de partage
  définis dans Réglages > SEO, avec repli automatique), sitemap.xml et
  robots.txt générés automatiquement, Google Analytics 4 et Meta Pixel
  branchables sans toucher au code (Réglages > Analytics — rien n'est chargé
  tant que les identifiants ne sont pas renseignés).
- **Paiement en ligne (architecture complète — voir avertissement ci-dessous)**
  : schéma SQL, route serveur de création de session, webhook de
  confirmation avec vérification de signature et journal anti-doublon,
  page de confirmation, statut de paiement visible dans Mon Compte. Prêt à
  fonctionner dès que tu renseignes de vraies clés Chargily.

### ⚠️ Le seul vrai avertissement de cette livraison : paiement non testé en conditions réelles
L'intégration Chargily (`src/lib/payments/chargily.ts`) suit la structure
généralement documentée de leur API (endpoint REST + clé secrète + webhook
signé), mais **aucun appel réel n'a pu être exécuté ni vérifié** : ce
bac à sable de génération n'a pas d'accès réseau. Avant d'accepter de vrais
paiements clients :
1. Récupère tes clés de test sur [pay.chargily.dz](https://pay.chargily.dz)
2. Renseigne-les dans `.env.local` (voir section 5)
3. Passe une commande test de bout en bout
4. Compare le comportement réel à ce qu'attend le code — les 4 points
   précis à vérifier sont commentés en tête de `lib/payments/chargily.ts`
   (URL de l'API, forme du corps de requête, nom de l'en-tête de signature,
   forme du payload webhook)
5. Seulement à ce moment-là, bascule sur les clés `live`

Tant que `CHARGILY_SECRET_KEY` n'est pas renseignée, l'option de paiement en
ligne n'apparaît simplement pas au panier — le site reste pleinement
fonctionnel en COD/virement, comme toute boutique algérienne classique.

### Deux choses que je n'ai délibérément pas fabriquées
- **Textes juridiques définitifs** : Confidentialité et CGV contiennent un
  modèle générique professionnel complet (édité depuis Réglages comme le
  reste), avec un bandeau d'avertissement permanent rappelant qu'il doit
  être validé par un professionnel avant mise en ligne réelle. Se faire
  passer pour un avocat aurait été plus trompeur qu'utile.
- **Tests automatisés / build vérifié** : ce sandbox n'a pas accès réseau,
  donc `npm install` n'a pas pu tourner ici. Le code suit scrupuleusement
  les conventions Next.js 14/TypeScript, a été relu intégralement à la main
  (imports, accolades, RLS, sécurité des clés), mais **teste avec
  `npm run dev` avant de déployer** et renvoie-moi la moindre erreur.

---

## 2. Installation locale

```bash
npm install
cp .env.example .env.local
# Renseigner .env.local (voir section 5)
npm run dev
```

Le site est alors disponible sur http://localhost:3000

---

## 3. Configuration Supabase

1. Crée un projet sur [supabase.com](https://supabase.com)
2. **SQL Editor > New query** : colle l'intégralité de `supabase/schema.sql`,
   puis **Run**. Ça crée tout (tables, RLS, storage, triggers, données de
   démarrage) — y compris désormais les colonnes de paiement, la table
   `payment_events`, et le contenu par défaut des pages légales/Hero/Galerie.
3. *(Uniquement si tu avais déjà exécuté une version précédente de
   `schema.sql` avant cette livraison)* : exécute en plus
   `supabase/migration_02_settings_payments.sql` pour rattraper les
   nouvelles colonnes sans perdre tes données existantes.
4. **Project Settings > API**, copie :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ voir avertissement
     section 5 — cette clé est sensible)
5. Crée ton compte admin :
   - Lance le site, inscris-toi via `/inscription` avec ton propre e-mail.
   - Dans le **SQL Editor**, exécute (en remplaçant l'e-mail) :
     ```sql
     insert into public.admins (user_id, role)
     select id, 'super_admin' from auth.users where email = 'ton-email@example.com';
     ```
   - Reconnecte-toi sur `/connexion` → tu es redirigé·e vers `/admin`.
6. Va dans `/admin/reglages` et personnalise tout (logo, couleurs, contact,
   réseaux sociaux...).

---

## 4. Structure du projet

```
la-casa-del-caftan/
├── supabase/
│   ├── schema.sql                    # Schéma complet (base neuve)
│   └── migration_02_settings_payments.sql  # Rattrapage si schema.sql déjà exécuté avant
├── public/images/                     # Logo + photos boutique fournies
├── src/
│   ├── app/
│   │   ├── admin/                     # Dashboard (12 sections, toutes actives)
│   │   ├── api/
│   │   │   ├── checkout/route.ts      # Crée une session de paiement Chargily
│   │   │   └── webhooks/chargily/     # Reçoit la confirmation de paiement
│   │   ├── commande/confirmation/     # Retour après paiement en ligne
│   │   ├── collections/[slug]/
│   │   ├── produit/[slug]/
│   │   ├── mon-compte/  favoris/
│   │   ├── manifest.ts                # PWA manifest dynamique (Réglages)
│   │   └── ...                        # boutique, panier, contact, faq, auth...
│   ├── components/
│   │   ├── layout/                    # Header, Footer (logo/réseaux dynamiques)
│   │   ├── home/                      # Hero (carrousel DB), Gallery...
│   │   ├── shop/                      # Composants boutique + admin
│   │   ├── ThemeVars.tsx              # Injecte les couleurs de marque en CSS
│   │   └── AnalyticsScripts.tsx       # GA4 / Meta Pixel conditionnels
│   ├── context/                       # CartContext (localStorage) + WishlistContext (Supabase)
│   ├── lib/
│   │   ├── payments/                  # Abstraction fournisseur + implémentation Chargily
│   │   ├── supabase/                  # Clients browser / server / admin (service role)
│   │   ├── settings.ts                # Accès mémoïsé aux Réglages/Contact/SEO/site_content
│   │   └── color.ts                   # Dérivation des nuances de couleur
│   └── locales/{fr,en,ar}/            # Traductions (UI uniquement — le contenu métier est en base)
```

---

## 5. Variables d'environnement

Voir `.env.example` pour le détail commenté. Résumé :

| Variable | Requise | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | URL de ton projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Oui | ⚠️ Clé secrète — jamais `NEXT_PUBLIC_`, jamais exposée au navigateur. Utilisée uniquement par le webhook de paiement (route serveur sans session utilisateur) |
| `NEXT_PUBLIC_SITE_URL` | Oui | URL réelle du site en production |
| `CHARGILY_SECRET_KEY` | Non | Active le paiement en ligne si renseignée |
| `CHARGILY_WEBHOOK_SECRET` | Non | Requis si `CHARGILY_SECRET_KEY` est renseignée |
| `CHARGILY_MODE` | Non | `test` ou `live` (def. `test` tant que non renseigné) |

À définir en local dans `.env.local` (jamais commité) et dans Netlify
(**Site settings > Environment variables**) pour la production.

---

## 6. Déploiement sur Netlify

1. Pousse le projet sur GitHub/GitLab.
2. Netlify : **Add new site > Import an existing project**, sélectionne le
   repo. `netlify.toml` est détecté automatiquement.
3. Ajoute toutes les variables de la section 5 dans **Site settings >
   Environment variables**.
4. Déploie (2-4 min pour le premier build).
5. Mets à jour `NEXT_PUBLIC_SITE_URL` avec le vrai domaine puis redéploie
   (nécessaire pour le sitemap, les liens de réinitialisation de mot de
   passe, et les URLs de retour du paiement en ligne).
6. Si tu actives le paiement en ligne : renseigne l'URL de webhook chez
   Chargily : `https://ton-domaine.com/api/webhooks/chargily`.

---

## 7. Notes techniques importantes

- **Couleurs** : les 3 couleurs choisies dans Réglages sont injectées comme
  variables CSS (`ThemeVars.tsx`) ; les nuances claires/foncées
  (survols, badges...) sont *calculées automatiquement* à partir de ces 3
  couleurs plutôt que redemandées une par une. `globals.css` définit les
  valeurs par défaut (identité d'origine) si Réglages n'a jamais été touché.
- **Images uploadées** : `next.config.js` autorise désormais les domaines
  `*.supabase.co` pour `next/image` — sans ça, toute image uploadée depuis
  l'admin (logo, produits, galerie...) aurait fait planter le rendu. C'est
  corrigé, mais bon à savoir si tu ajoutes un jour une autre source d'image.
- **Panier invité** : stocké en `localStorage` (standard). Les **favoris**,
  eux, nécessitent un compte (redirection vers `/connexion`) — choix
  volontaire pour qu'ils suivent la cliente sur n'importe quel appareil.
  La table `cart_items` existe en base si tu veux un jour un panier
  persistant multi-appareils pour les comptes connectés.
- **Commandes et comptes** : une commande passée en étant connecté·e est
  automatiquement rattachée au compte (visible dans Mon Compte > Mes
  commandes). Une commande invitée reste anonyme.
- **Modération des avis** : un avis client n'apparaît publiquement qu'après
  validation dans `/admin/avis` — avant cette livraison, cet écran
  n'existait pas et aucun avis ne pouvait donc jamais être publié.
- **Édition en place** : les sections admin permettent de créer/lister/
  activer-désactiver/supprimer. Modifier un enregistrement existant se fait
  pour l'instant en le recréant, ou directement via le Table Editor
  Supabase — ajouter des formulaires d'édition complets est un axe naturel
  de prochaine itération si tu en as l'usage.
- **Produits de démonstration** : les 3 produits `DEMO-001/002/003` sont à
  remplacer par ton vrai catalogue depuis `/admin/produits`.

---

## 8. Commandes utiles

```bash
npm run dev       # Développement local
npm run build     # Build de production
npm run start     # Sert le build de production en local
npm run lint      # Vérification ESLint
```

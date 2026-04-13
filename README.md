# Order Report — Refactoring Legacy

## Installation

### Prérequis

- Node.js >= 18
- npm >= 9

### Commandes

```bash
npm install
```

## Exécution

### Exécuter le code refactoré

```bash
npx ts-node src/orderReport.ts
```

### Exécuter les tests

```bash
npm test
```

## Choix de Refactoring

### Problèmes Identifiés dans le Legacy

1. **God Function** : la fonction `run()` fait tout — parsing CSV, logique métier, calculs, formatage et I/O — dans un seul bloc de ~250 lignes.
   - Impact : impossible à tester unitairement, à maintenir ou à faire évoluer sans risque de régression.

2. **Parsing dupliqué** : chaque fichier CSV est parsé avec une variation légèrement différente du même pattern (split, boucle, try/catch).
   - Impact : code répété, incohérences dans la gestion d'erreurs entre les fichiers.

3. **Typage inexistant** : tous les types sont aliasés vers `any` (`type Customer = any`).
   - Impact : aucune aide du compilateur, bugs silencieux, autocomplétion inutile.

4. **Magic numbers** : des valeurs numériques en dur dans le corps de la fonction (`0.05`, `0.10`, `0.15`, `0.3`, `1.2`, `0.25`...).
   - Impact : impossible de comprendre les règles métier sans lire tout le code.

5. **Code mort** : constantes `SHIP` et `PREMIUM_THRESHOLD` déclarées mais jamais utilisées, variable `custHeader` lue mais ignorée.
   - Impact : bruit dans le code, confusion sur ce qui est réellement utilisé.

6. **Bug legacy identifié** : si `firstOrderDate` est vide, `new Date('').getDay()` retourne `0` qui est compris dans les  `WEEKEND_DAYS = [0,6]`, donc le bonus weekend est donc appliqué quand le firstOrderDate est vide. Ce comportement est préservé tel quel.

### Solutions Apportées

1. **Extraction du parsing CSV** : création d'un module `csv/` avec un `parseCsv` générique et des mappers nommés par entité (`mapCustomer`, `mapProduct`, etc.). Un seul appel `loadCsvData(dataPath)` dans `orderReport.ts`.
   - Justification : séparer la logique de lecture/mapping de la logique métier. Permet de changer de format (JSON, API) sans toucher aux calculs. Chaque mapper est testable unitairement.

2. **Création de dossiers `types/`, `utils/`, `constants/`** : chaque dossier contient un seul fichier `index.ts` pour l'instant.
   - Justification : la taille actuelle du projet ne justifie pas d'éclater en plusieurs fichiers par dossier, mais la structure est en place pour le faire simplement quand le besoin se présentera.

3. **Suppression du code mort** : constantes `SHIP` et `PREMIUM_THRESHOLD` supprimées, variable `custHeader` non reproduite.
   - Justification : code jamais utilisé dans la logique effective. Supprimer les headers n'impacte pas la sortie puisqu'ils n'étaient jamais exploités.

4. **Extraction des calculateurs** : les calculs de loyalty points, volume discount, weekend bonus et loyalty discount sont extraits dans des fonctions pures dans `business/pricing/`.
   - Justification : fonctions testables isolément, responsabilité unique, `orderReport.ts` ne contient plus que de l'orchestration.

5. **Typage strict** : interfaces `Customer`, `Product`, `Order`, `ShippingZone`, `Promotion` avec des union types pour les valeurs contraintes (`'BASIC' | 'PREMIUM'`, `'EUR' | 'USD' | 'GBP'`).
   - Justification : le compilateur attrape les erreurs, l'autocomplétion fonctionne, le code se documente lui-même.

6. **Remplacement des magic numbers** : toutes les valeurs numériques extraites en constantes nommées et regroupées par domaine métier.
   - Justification : les règles métier se lisent dans le fichier de constantes sans fouiller le code.

### Architecture Choisie

```
src/
├── types/              → Interfaces et types partagés
│   └── index.ts
├── constants/          → Constantes métier regroupées par domaine
│   └── index.ts
├── csv/                → Parsing CSV générique + mappers par entité
│   ├── parseCsv.ts
│   ├── mappers.ts
│   └── loadCsvData.ts
├── utils/              → Utilitaires (arrayToRecord)
│   └── index.ts
├── business/pricing/   → Calculateurs métier (fonctions pures)
│   ├── loyaltyPoints.ts
│   ├── loyaltyDiscount.ts
│   ├── volumeDiscount.ts
│   └── weekendBonus.ts
└── orderReport.ts      → Orchestration (parsing → calculs → formatage → I/O)
```

**Flux de données** : `CSV files` → `parsers/mappers` → `données typées` → `calculateurs` → `formatteur` → `stdout + JSON`

## Limites et Améliorations Futures

### Ce qui n'a pas été fait (par manque de temps)

- [ ] Extraction des calculs restants (taxe, shipping, handling, promo, morning bonus) en fonctions pures
- [ ] Extraction du formatage du rapport dans un module `formatters/`
- [ ] Séparation complète des I/O (console.log, fs.writeFileSync) du calcul
- [ ] Tests unitaires pour chaque calculateur extrait
- [ ] Extraction du calcul de plafonnement de remise (`MAX_DISCOUNT`) en fonction dédiée

### Compromis Assumés

- **Bug legacy préservé** : la remise FIXED est appliquée par ligne au lieu de globalement. C'est le comportement du legacy, le golden master le vérifie — on ne corrige pas.
- **Bug legacy préservé** : le bonus weekend est basé sur la date de la première commande du client uniquement, pas sur chaque commande.
- **`Promotion.value` reste `string` dans le legacy** : le `parseFloat` est fait au moment de l'utilisation. Dans le refactoré, le mapping convertit en `number` directement.

### Pistes d'Amélioration Future

- Remplacer le parsing CSV maison par une lib comme `papaparse` pour gérer les cas limites (guillemets, virgules dans les valeurs)
- Injecter les chemins de fichiers en paramètre de `run()` pour faciliter les tests d'intégration
- Ajouter un système de validation des données parsées (zod ou similaire)
- Séparer la génération du rapport texte et du JSON en deux responsabilités distinctes
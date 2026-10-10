import type { BaselineSet } from "@/lib/baseline-documents";

// Baseline governance document templates (fr). Placeholders in [ ] are filled in by the organisation.
export const fr: BaselineSet = {
  ai_policy: { title: "Politique d'IA", body: (o, sys) => `# Politique d'IA

## 1. Objet
${o} établit la présente politique afin de développer, d'acquérir et d'exploiter des systèmes d'IA de manière sûre, équitable et transparente.

## 2. Champ d'application
Tous les systèmes d'IA que l'organisation développe, acquiert ou utilise, y compris les services d'IA SaaS externes. Systèmes actuellement inscrits à l'inventaire de l'IA :

${sys}

## 3. Principes
- **Responsabilité** : chaque système d'IA a un responsable nommément désigné.
- **Équité** : la discrimination envers les groupes protégés est testée et prévenue.
- **Transparence** : les utilisateurs sont informés lorsqu'ils interagissent avec une IA et les contenus générés sont signalés.
- **Sûreté et sécurité** : les risques sont évalués et testés avant la mise en service.
- **Protection de la vie privée** : seules les données strictement nécessaires sont utilisées.
- **Contrôle humain** : les décisions importantes sont revues par des personnes.

## 4. Obligations
1. Chaque système d'IA est inscrit à l'inventaire de l'IA et fait l'objet d'une évaluation des risques avant son utilisation.
2. Les systèmes à haut risque sont testés et approuvés avant leur mise en service.
3. Les données personnelles ou confidentielles et le code source ne sont pas saisis dans des outils d'IA générative sans autorisation.
4. Les incidents liés à l'IA et les comportements anormaux sont signalés immédiatement.
5. Les rôles et responsabilités suivent le document « Rôles et responsabilités en matière d'IA (RACI) ».

## 5. Conformité
ISO/IEC 42001, le règlement européen sur l'IA (AI Act), le NIST AI RMF et la loi-cadre coréenne sur l'IA.

## 6. Révision
Revue au moins une fois par an et à chaque évolution significative du cadre juridique ou de l'activité.

Approuvé par : [nom] · Date d'entrée en vigueur : [date]
` },
  roles: { title: "Rôles et responsabilités en matière d'IA (RACI)", body: (o) => `# Rôles et responsabilités en matière d'IA (RACI)

Rôles et responsables de la gouvernance de l'IA au sein de ${o}. Remplacez les espaces réservés [ ] par les personnes concernées.

## 1. Rôles
| Rôle | Personne | Principales responsabilités |
|---|---|---|
| Sponsor exécutif de l'IA | [nom] | Approuve la politique d'IA, alloue les ressources, revue de direction |
| Responsable de la gouvernance de l'IA | [nom] | Inventaire, risques et documents ; coordonne l'approbation de mise en service |
| Responsable du système | par système | Enregistre le système, traite les risques, consigne les modifications |
| Responsable des tests | [nom] | Planifie et réalise les évaluations, gère les résultats |
| Relecteur | [nom] | Examine les résultats de tests et les documents (indépendant de l'auteur) |
| Approbateur | [nom] | Émet les rapports, approuve la mise en service et l'acceptation des risques |
| Délégué à la protection des données | [nom] | Analyse d'impact relative à la protection des données, examen des traitements de données |
| Responsable de la sécurité des systèmes d'information | [nom] | Tests de sécurité, vérification de la sécurité des fournisseurs |

## 2. RACI (R réalise · A approuve / rend compte · C consulté · I informé)
| Activité | Responsable de la gouvernance | Responsable du système | Responsable des tests | Relecteur | Approbateur |
|---|---|---|---|---|---|
| Enregistrer et classifier les systèmes d'IA | A | R | I | I | I |
| Évaluation et traitement des risques | A | R | C | C | I |
| Tests et évaluation | I | C | R | A | I |
| Rédiger et approuver les documents de gouvernance | R | C | I | C | A |
| Approbation de mise en service | R | C | C | C | A |
| Réponse aux incidents | A | R | C | I | I |
| Due diligence des fournisseurs | A | R | I | C | I |
| Formation à la maîtrise de l'IA | A | R | I | I | I |

## 3. Séparation des tâches
L'auteur et le relecteur sont des personnes différentes ; les testeurs n'approuvent pas leurs propres résultats.
` },
  objectives: { title: "Objectifs et plan en matière d'IA", body: (o) => `# Objectifs et plan en matière d'IA

Objectifs du système de management de l'IA de ${o} et moyens de les atteindre. Revus chaque année lors de la revue de direction.

| Objectif | Indicateur | Cible | Responsable | Contrôle |
|---|---|---|---|---|
| Connaître chaque système d'IA | Taux d'enregistrement à l'inventaire de l'IA | 100% | Responsable de la gouvernance | Trimestriel |
| Vérifier avant la mise en service | Systèmes à haut risque évalués avant la mise en service | 100% | Responsable des tests | À la mise en service |
| Traiter les risques dans les délais | Risques traités avant leur échéance | ≥ 90% | Responsables des systèmes | Mensuel |
| Maintenir les documents à jour | Documents de gouvernance dont la date de révision est dépassée | 0 | Responsable de la gouvernance | Mensuel |
| Maîtrise de l'IA | Taux de réalisation de la formation | ≥ 95% | RH / formation | Semestriel |
| Prévenir les incidents | Incidents graves liés à l'IA | 0 | Tous | En continu |

## Ressources
Les personnes, le budget et les outils (y compris K-VeriAI) nécessaires à l'atteinte des objectifs sont alloués lors de la revue de direction.

## Ordre du jour de la revue de direction
Atteinte des objectifs, état des risques, résultats des tests, incidents, résultats d'audit, évolutions réglementaires, améliorations.
` },
  risk_procedure: { title: "Procédure d'évaluation et de traitement des risques liés à l'IA", body: (o) => `# Procédure d'évaluation et de traitement des risques liés à l'IA

Comment ${o} identifie, évalue, traite et surveille les risques liés à l'IA.

## 1. Identifier
- Les risques initiaux sont générés à partir des réponses au questionnaire d'enregistrement lors de l'inscription d'un système.
- Les constats de test HIGH/CRITICAL, les incidents et les résultats de la due diligence des fournisseurs ajoutent des risques.

## 2. Évaluer
- Noter la probabilité (L) et la gravité (S) de 1 à 5.
- Score = (L × 1 + S × 3) ÷ 20 × 100. ≥ 80 critique, 60–79 élevé, 35–59 moyen, < 35 faible.

## 3. Traiter
- Choisir d'atténuer, d'accepter, d'éviter ou de transférer, et consigner la mesure d'atténuation.
- Échéances : critique 30 jours, élevé 45 jours, autres 90 jours.
- Consigner le risque résiduel L·S après atténuation. L'acceptation du risque résiduel est approuvée par un approbateur.

## 4. Analyse d'impact
Les IA à haut risque ou à fort impact et les systèmes traitant des données personnelles font l'objet d'une analyse d'impact (droits fondamentaux, vie privée) avant leur mise en service.

## 5. Surveiller et réévaluer
- Les risques en retard sont signalés sur le tableau de bord et sous forme de tâches.
- Les modifications de la version du modèle, du prompt, des outils ou des sources de données sont consignées et les tests concernés sont réexécutés.
` },
  records: { title: "Règles de gestion des enregistrements et de maîtrise des documents d'IA", body: (o) => `# Règles de gestion des enregistrements et de maîtrise des documents d'IA

Comment ${o} crée, conserve et maîtrise les documents et enregistrements relatifs à l'IA.

## 1. Champ d'application
Documents de gouvernance (politiques, procédures, plans), résultats de tests et rapports, preuves, registre des risques, enregistrements des modifications, approbations, enregistrements d'incidents et journaux système.

## 2. Rédaction et approbation
- Les documents de gouvernance sont rédigés dans K-VeriAI, rubrique « Politiques et documents », et approuvés par un relecteur autre que l'auteur.
- Les versions et l'historique des révisions sont conservés ; lorsqu'une révision est approuvée, la version précédente est conservée avec le statut « Remplacé ».

## 3. Stockage et intégrité
- Les preuves et les rapports sont conservés dans le Centre de preuves de K-VeriAI avec l'empreinte SHA-256 du fichier.
- Chaque modification est inscrite dans le journal d'audit.

## 4. Conservation
| Enregistrement | Durée de conservation |
|---|---|
| Documentation technique et enregistrements de conformité des IA à haut risque | 10 ans après la mise sur le marché |
| Journaux générés automatiquement | au moins 6 mois |
| Autres documents et enregistrements | [durée] |

## 5. Contrôle d'accès
Des autorisations fondées sur les rôles limitent qui peut consulter et modifier les enregistrements. Seuls les rapports approuvés sont communiqués à l'extérieur.

## 6. Révision
Chaque document est revu selon son cycle de révision ; une fois sa date de révision dépassée, il n'est plus pris en compte comme preuve.
` },
  literacy: { title: "Plan de formation à la maîtrise de l'IA", body: (o) => `# Plan de formation à la maîtrise de l'IA

${o} forme toutes les personnes qui utilisent ou gèrent l'IA au niveau requis par leur rôle.

| Public | Contenu | Quand | Format |
|---|---|---|---|
| Tout le personnel | Politique d'IA, usages autorisés et interdits, aucune saisie de données personnelles ou confidentielles, signalement des incidents | À l'arrivée, chaque année | En ligne |
| Responsables des systèmes | Évaluation des risques, enregistrement des modifications, contrôle humain | À la nomination, chaque année | Atelier |
| Personnel de test et de revue | Méthodes d'évaluation, red teaming, critères de jugement, biais | À la nomination, chaque année | Atelier |
| Direction | Évolutions réglementaires, responsabilité, revue de direction | Chaque année | Briefing |

## Enregistrements
Les listes de présence et les taux de réalisation sont enregistrés dans le Centre de preuves en tant que « Registre de formation ».

## Cible
Taux de réalisation ≥ 95% ; toute personne absente est formée dans un délai de 30 jours.
` },
};

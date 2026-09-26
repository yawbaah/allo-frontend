import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Language = 'en' | 'fr';

const translations = {
  en: {
    // Nav
    'nav.product': 'Product',
    'nav.solutions': 'Solutions',
    'nav.pricing': 'Pricing',
    'nav.how': 'How it works',
    'nav.login': 'Log In',
    'nav.start': 'Get Started',

    // Landing hero
    'hero.title': 'Create a personalized AI chatbot in minutes.',
    'hero.subtitle':
      'Train on your website, docs, and images. Deploy with one snippet. Answers grounded in your content — not the open web.',
    'hero.cta': 'Get Started',
    'hero.guarantee': 'From $29/mo · 14-day money-back guarantee',

    // Landing stats
    'stats.headline': 'Join the businesses answering customers on autopilot.',
    'stats.questions': 'Questions answered',
    'stats.resolution': 'AI resolution rate',
    'stats.response': 'Avg response time',

    // Landing features
    'feat.ingest.title': 'Ingest everything',
    'feat.ingest.desc':
      'Paste your website URL, upload PDFs and DOCX, or drop images with descriptions. We crawl, chunk, and embed your knowledge base.',
    'feat.code.title': 'One line of code',
    'feat.code.desc':
      'Add a tiny JavaScript snippet. Your branded chat widget appears instantly without slowing down the host page.',
    'feat.handoff.title': 'Live human handoff',
    'feat.handoff.desc':
      'When the AI lacks confidence — or hits a topic you flag — the conversation routes to your team in real time.',

    // How it works
    'how.title': 'How Allo works',
    'how.1.title': 'Connect your content',
    'how.1.desc': 'Website crawl, documents, and images with AI-assisted descriptions.',
    'how.2.title': 'We build your brain',
    'how.2.desc': 'Content is chunked and embedded into a private vector index for your company only.',
    'how.3.title': 'Embed the widget',
    'how.3.desc': 'One script tag. Visitors ask questions; answers stream back grounded in your data.',
    'how.4.title': 'Escalate when needed',
    'how.4.desc': 'Low confidence or forced rules push chats to your inbox for live human takeover.',

    // Landing CTA
    'cta.title': 'Start answering customers with Allo',
    'cta.button': 'Get Started',
    'cta.sub': 'Plans from $29 / €27 per month. Cancel anytime.',

    // Footer
    'footer.rights': 'All rights reserved.',

    // Pricing
    'pricing.title': 'Simple pricing that scales with you',
    'pricing.subtitle': 'No free tier abuse. No hidden fees. Pay in USD or EUR.',
    'pricing.popular': 'Most popular',
    'pricing.perMonth': '/ month',
    'pricing.faqTitle': 'Frequently asked',
    'pricing.ctaTitle': 'Ready to try Allo?',
    'pricing.ctaButton': 'Get Started',
    'pricing.ctaSub': '14-day money-back guarantee. Cancel anytime.',
    'pricing.starter.name': 'Starter',
    'pricing.starter.desc': 'For small businesses launching their first AI assistant.',
    'pricing.starter.cta': 'Start Starter',
    'pricing.growth.name': 'Growth',
    'pricing.growth.desc': 'For teams ready to scale customer support with AI.',
    'pricing.growth.cta': 'Start Growth',
    'pricing.business.name': 'Business',
    'pricing.business.desc': 'For high-volume teams that need control and white-label.',
    'pricing.business.cta': 'Start Business',
    'pricing.enterprise.name': 'Enterprise',
    'pricing.enterprise.desc': 'For organizations with custom volume, security, and SLA needs.',
    'pricing.enterprise.cta': 'Contact sales',
    'pricing.f1': '1 chatbot',
    'pricing.f2': '1,000 messages / month',
    'pricing.f3': '200 pages crawled',
    'pricing.f4': 'PDF, DOCX & image upload',
    'pricing.f5': 'Basic widget customization',
    'pricing.f6': 'Email support',
    'pricing.f7': '3 chatbots',
    'pricing.f8': '5,000 messages / month',
    'pricing.f9': 'Unlimited pages crawled',
    'pricing.f10': 'Image upload with AI descriptions',
    'pricing.f11': 'Live human handoff',
    'pricing.f12': 'Analytics dashboard',
    'pricing.f13': 'Priority support',
    'pricing.f14': '10 chatbots',
    'pricing.f15': '25,000 messages / month',
    'pricing.f16': 'Unlimited pages & documents',
    'pricing.f17': 'White-label widget',
    'pricing.f18': 'API access',
    'pricing.f19': 'Advanced escalation rules',
    'pricing.f20': 'Priority support + onboarding',
    'pricing.f21': 'Unlimited chatbots',
    'pricing.f22': 'Custom message volume',
    'pricing.f23': 'SSO & advanced security',
    'pricing.f24': 'Dedicated account manager',
    'pricing.f25': 'Custom integrations',
    'pricing.f26': 'SLA guarantees',
    'pricing.f27': 'On-premise options',
    'pricing.faq1.q': 'What counts as a message?',
    'pricing.faq1.a':
      'Every reply your AI or human agent sends to a visitor counts as one message. Visitor messages are free.',
    'pricing.faq2.q': 'What happens if I exceed my monthly messages?',
    'pricing.faq2.a':
      "We'll notify you before you hit the limit. You can upgrade instantly or purchase overage credits at $5 / €5 per 100 messages.",
    'pricing.faq3.q': 'Can I switch plans anytime?',
    'pricing.faq3.a':
      'Yes. Upgrade instantly or downgrade at the end of your billing cycle — no lock-in, no penalties.',
    'pricing.faq4.q': 'Do you offer refunds?',
    'pricing.faq4.a': 'We offer a 14-day money-back guarantee on all paid plans. No questions asked.',
    'pricing.faq5.q': 'Which currency am I charged in?',
    'pricing.faq5.a':
      'You can pay in USD or EUR. The price shown in your currency is what you are billed — no extra conversion fees from us.',

    // Login
    'login.title': 'Log in to Allo',
    'login.email': 'Work Email',
    'login.password': 'Password',
    'login.submit': 'Log In',
    'login.noAccount': "Don't have an account?",
    'login.getStarted': 'Get Started',
    'login.error': 'Email and password are required.',

    // Onboarding
    'onboard.s1': 'Create your account',
    'onboard.s2': 'About your company',
    'onboard.s3': 'Where will Allo live?',
    'onboard.s4': 'Verify your email',
    'onboard.step': 'Step {n} of 4',
    'onboard.company': 'Company Name',
    'onboard.email': 'Work Email',
    'onboard.password': 'Password',
    'onboard.industry': 'Industry',
    'onboard.industry.placeholder': 'Select industry',
    'onboard.size': 'Company Size',
    'onboard.size.placeholder': 'Select size',
    'onboard.website': 'Website URL (used to train your AI)',
    'onboard.website.help':
      'We crawl this site so your AI answers from your real content — not the open web.',
    'onboard.code.help': 'Enter the 6-digit code we sent to',
    'onboard.code.demo': 'For this demo, enter any 6 digits.',
    'onboard.continue': 'Continue',
    'onboard.complete': 'Complete setup',
    'onboard.back': 'Back',
    'onboard.ind.saas': 'Software (SaaS)',
    'onboard.ind.ecom': 'E-commerce',
    'onboard.ind.health': 'Healthcare',
    'onboard.ind.edu': 'Education',
    'onboard.ind.fin': 'Finance',
    'onboard.ind.other': 'Other',
    'onboard.size.1': '1 – 10 employees',
    'onboard.size.2': '11 – 50 employees',
    'onboard.size.3': '51 – 200 employees',
    'onboard.size.4': '200+ employees',

    // Dashboard nav
    'dash.overview': 'Overview',
    'dash.knowledge': 'Knowledge',
    'dash.inbox': 'Inbox',
    'dash.analytics': 'Analytics',
    'dash.deploy': 'Deploy',
    'dash.settings': 'Settings',
    'dash.billing': 'Billing & Credits',
    'dash.logout': 'Log out',
    'dash.plan': 'Starter · 482 / 1,000 msgs',
    'dash.settingsLink': 'Settings',
    'dash.language': 'Language',

    // Overview
    'ov.conversations': 'Conversations',
    'ov.resolution': 'AI Resolution',
    'ov.pages': 'Pages Indexed',
    'ov.avg': 'Avg Response',
    'ov.recent': 'Recent conversations',
    'ov.viewAll': 'View all →',
    'ov.visitor': 'Visitor',
    'ov.message': 'Message',
    'ov.status': 'Status',
    'ov.time': 'Time',
    'ov.ai': 'AI handled',
    'ov.human': 'Needs human',

    // Knowledge
    'kb.intro':
      'Add your website, upload documents, or upload images with descriptions. Allo indexes everything so answers stay grounded in your content.',
    'kb.crawl': 'Crawl site',
    'kb.crawling': 'Crawling…',
    'kb.uploadDocs': 'Upload PDF / DOCX',
    'kb.uploadImages': 'Upload Images',
    'kb.refresh': 'Refresh all',
    'kb.source': 'Source',
    'kb.type': 'Type',
    'kb.status': 'Status',
    'kb.chunks': 'Chunks',
    'kb.updated': 'Updated',
    'kb.modalTitle': 'Describe your images',
    'kb.modalSub': 'Give context so the AI knows when to show each image in conversations.',
    'kb.generate': 'Generate with AI',
    'kb.cancel': 'Cancel',
    'kb.addImages': 'Add {n} image(s)',
    'kb.placeholder': 'https://yourwebsite.com',
    'kb.descPlaceholder': 'e.g. Product photo of the AlloBot v2 in white',

    // Inbox
    'inbox.needsHuman': 'Needs human',
    'inbox.live': 'Live',
    'inbox.join': 'Join chat',
    'inbox.autoTranslate': 'Auto-Translate to',
    'inbox.speaking': 'Speaking',
    'inbox.typingHint': 'You are typing in {agent}. Visitor will receive it in {visitor}.',
    'inbox.placeholder': 'Type a reply…',
    'inbox.send': 'Send',
    'inbox.original': 'Original',

    // Analytics
    'an.msgs': 'Messages this month',
    'an.resolution': 'AI resolution rate',
    'an.avg': 'Avg. response time',
    'an.handoffs': 'Human handoffs',
    'an.week': 'Conversations this week',
    'an.topics': 'Top topics',
    'an.breakdown': 'Resolution breakdown',
    'an.aiResolved': 'Resolved by AI',
    'an.handed': 'Handed to human',
    'an.abandoned': 'Abandoned',

    // Deploy
    'dep.intro':
      'Customize your widget, then paste this snippet before the closing </body> tag on your site.',
    'dep.embed': 'Embed code',
    'dep.copy': 'Copy',
    'dep.copied': 'Copied',
    'dep.appearance': 'Appearance & Branding',
    'dep.headerName': 'Widget Header Name',
    'dep.launcher': 'Launcher Button Style',
    'dep.icon': 'Chat Icon',
    'dep.circle': 'Circle Logo',
    'dep.square': 'Square Logo',
    'dep.logo': 'Custom Logo',
    'dep.upload': 'Upload image',
    'dep.color': 'Primary color',
    'dep.welcome': 'Welcome message',
    'dep.position': 'Position',
    'dep.right': 'Bottom right',
    'dep.left': 'Bottom left',
    'dep.save': 'Save appearance',
    'dep.preview': 'Live preview',

    // Settings
    'set.company': 'Company',
    'set.name': 'Company name',
    'set.website': 'Website',
    'set.supportEmail': 'Support email',
    'set.escalation': 'Escalation rules',
    'set.topics': 'Always escalate these topics',
    'set.topicsHelp': 'Comma-separated. Matching questions skip the AI and go straight to your inbox.',
    'set.hours': 'Business hours (for live handoff)',
    'set.save': 'Save settings',
  },

  fr: {
    'nav.product': 'Produit',
    'nav.solutions': 'Solutions',
    'nav.pricing': 'Tarifs',
    'nav.how': 'Fonctionnement',
    'nav.login': 'Connexion',
    'nav.start': 'Démarrer',

    'hero.title': 'Créez un chatbot IA personnalisé en quelques minutes.',
    'hero.subtitle':
      'Entraînez-le sur votre site, documents et images. Déployez avec un seul snippet. Des réponses basées sur votre contenu — pas sur le web ouvert.',
    'hero.cta': 'Démarrer',
    'hero.guarantee': 'Dès 29 $/mois · Garantie satisfait ou remboursé de 14 jours',

    'stats.headline': 'Rejoignez les entreprises qui répondent à leurs clients en pilote automatique.',
    'stats.questions': 'Questions répondues',
    'stats.resolution': 'Taux de résolution IA',
    'stats.response': 'Temps de réponse moyen',

    'feat.ingest.title': 'Ingérez tout',
    'feat.ingest.desc':
      'Collez l’URL de votre site, importez des PDF et DOCX, ou déposez des images avec descriptions. Nous crawlons, découpons et indexons votre base de connaissances.',
    'feat.code.title': 'Une seule ligne de code',
    'feat.code.desc':
      'Ajoutez un petit snippet JavaScript. Votre widget de chat apparaît instantanément sans ralentir la page hôte.',
    'feat.handoff.title': 'Transfert humain en direct',
    'feat.handoff.desc':
      'Quand l’IA manque de confiance — ou touche un sujet que vous avez signalé — la conversation est routée vers votre équipe en temps réel.',

    'how.title': 'Comment fonctionne Allo',
    'how.1.title': 'Connectez votre contenu',
    'how.1.desc': 'Crawl du site, documents et images avec descriptions assistées par IA.',
    'how.2.title': 'Nous construisons votre cerveau',
    'how.2.desc':
      'Le contenu est découpé et intégré dans un index vectoriel privé, réservé à votre entreprise.',
    'how.3.title': 'Intégrez le widget',
    'how.3.desc':
      'Une balise script. Les visiteurs posent des questions ; les réponses arrivent basées sur vos données.',
    'how.4.title': 'Escaladez si besoin',
    'how.4.desc':
      'Faible confiance ou règles forcées envoient les chats vers votre boîte de réception pour une prise en charge humaine.',

    'cta.title': 'Commencez à répondre à vos clients avec Allo',
    'cta.button': 'Démarrer',
    'cta.sub': 'Forfaits dès 29 $ / 27 € par mois. Résiliation à tout moment.',

    'footer.rights': 'Tous droits réservés.',

    'pricing.title': 'Une tarification simple qui évolue avec vous',
    'pricing.subtitle': 'Pas d’abus de freemium. Pas de frais cachés. Payez en USD ou EUR.',
    'pricing.popular': 'Le plus populaire',
    'pricing.perMonth': '/ mois',
    'pricing.faqTitle': 'Questions fréquentes',
    'pricing.ctaTitle': 'Prêt à essayer Allo ?',
    'pricing.ctaButton': 'Démarrer',
    'pricing.ctaSub': 'Garantie satisfait ou remboursé de 14 jours. Résiliation à tout moment.',
    'pricing.starter.name': 'Starter',
    'pricing.starter.desc': 'Pour les petites entreprises lançant leur premier assistant IA.',
    'pricing.starter.cta': 'Choisir Starter',
    'pricing.growth.name': 'Growth',
    'pricing.growth.desc': 'Pour les équipes prêtes à faire évoluer le support client avec l’IA.',
    'pricing.growth.cta': 'Choisir Growth',
    'pricing.business.name': 'Business',
    'pricing.business.desc': 'Pour les équipes à fort volume qui ont besoin de contrôle et de marque blanche.',
    'pricing.business.cta': 'Choisir Business',
    'pricing.enterprise.name': 'Enterprise',
    'pricing.enterprise.desc':
      'Pour les organisations avec volume, sécurité et SLA personnalisés.',
    'pricing.enterprise.cta': 'Contacter les ventes',
    'pricing.f1': '1 chatbot',
    'pricing.f2': '1 000 messages / mois',
    'pricing.f3': '200 pages crawlées',
    'pricing.f4': 'Import PDF, DOCX et images',
    'pricing.f5': 'Personnalisation basique du widget',
    'pricing.f6': 'Support par e-mail',
    'pricing.f7': '3 chatbots',
    'pricing.f8': '5 000 messages / mois',
    'pricing.f9': 'Pages crawlées illimitées',
    'pricing.f10': 'Images avec descriptions IA',
    'pricing.f11': 'Transfert humain en direct',
    'pricing.f12': 'Tableau de bord analytique',
    'pricing.f13': 'Support prioritaire',
    'pricing.f14': '10 chatbots',
    'pricing.f15': '25 000 messages / mois',
    'pricing.f16': 'Pages et documents illimités',
    'pricing.f17': 'Widget en marque blanche',
    'pricing.f18': 'Accès API',
    'pricing.f19': 'Règles d’escalade avancées',
    'pricing.f20': 'Support prioritaire + onboarding',
    'pricing.f21': 'Chatbots illimités',
    'pricing.f22': 'Volume de messages personnalisé',
    'pricing.f23': 'SSO et sécurité avancée',
    'pricing.f24': 'Account manager dédié',
    'pricing.f25': 'Intégrations sur mesure',
    'pricing.f26': 'Garanties SLA',
    'pricing.f27': 'Options on-premise',
    'pricing.faq1.q': 'Qu’est-ce qui compte comme un message ?',
    'pricing.faq1.a':
      'Chaque réponse envoyée par votre IA ou un agent humain à un visiteur compte comme un message. Les messages des visiteurs sont gratuits.',
    'pricing.faq2.q': 'Que se passe-t-il si je dépasse mon quota mensuel ?',
    'pricing.faq2.a':
      'Nous vous prévenons avant la limite. Vous pouvez upgrader instantanément ou acheter des crédits supplémentaires à 5 $ / 5 € pour 100 messages.',
    'pricing.faq3.q': 'Puis-je changer de forfait à tout moment ?',
    'pricing.faq3.a':
      'Oui. Upgrade immédiat ou downgrade en fin de cycle — sans engagement, sans pénalité.',
    'pricing.faq4.q': 'Proposez-vous des remboursements ?',
    'pricing.faq4.a':
      'Oui, garantie satisfait ou remboursé de 14 jours sur tous les forfaits payants. Sans questions.',
    'pricing.faq5.q': 'Dans quelle devise suis-je facturé ?',
    'pricing.faq5.a':
      'Vous pouvez payer en USD ou EUR. Le prix affiché dans votre devise est celui facturé — sans frais de conversion de notre part.',

    'login.title': 'Connexion à Allo',
    'login.email': 'E-mail professionnel',
    'login.password': 'Mot de passe',
    'login.submit': 'Se connecter',
    'login.noAccount': 'Pas encore de compte ?',
    'login.getStarted': 'Démarrer',
    'login.error': 'E-mail et mot de passe requis.',

    'onboard.s1': 'Créez votre compte',
    'onboard.s2': 'À propos de votre entreprise',
    'onboard.s3': 'Où vivra Allo ?',
    'onboard.s4': 'Vérifiez votre e-mail',
    'onboard.step': 'Étape {n} sur 4',
    'onboard.company': 'Nom de l’entreprise',
    'onboard.email': 'E-mail professionnel',
    'onboard.password': 'Mot de passe',
    'onboard.industry': 'Secteur',
    'onboard.industry.placeholder': 'Choisir un secteur',
    'onboard.size': 'Taille de l’entreprise',
    'onboard.size.placeholder': 'Choisir une taille',
    'onboard.website': 'URL du site (pour entraîner l’IA)',
    'onboard.website.help':
      'Nous crawlons ce site pour que l’IA réponde à partir de votre vrai contenu — pas du web ouvert.',
    'onboard.code.help': 'Entrez le code à 6 chiffres envoyé à',
    'onboard.code.demo': 'Pour cette démo, entrez n’importe quels 6 chiffres.',
    'onboard.continue': 'Continuer',
    'onboard.complete': 'Terminer la configuration',
    'onboard.back': 'Retour',
    'onboard.ind.saas': 'Logiciel (SaaS)',
    'onboard.ind.ecom': 'E-commerce',
    'onboard.ind.health': 'Santé',
    'onboard.ind.edu': 'Éducation',
    'onboard.ind.fin': 'Finance',
    'onboard.ind.other': 'Autre',
    'onboard.size.1': '1 – 10 employés',
    'onboard.size.2': '11 – 50 employés',
    'onboard.size.3': '51 – 200 employés',
    'onboard.size.4': '200+ employés',

    'dash.overview': 'Vue d’ensemble',
    'dash.knowledge': 'Connaissances',
    'dash.inbox': 'Boîte de réception',
    'dash.analytics': 'Analytique',
    'dash.deploy': 'Déploiement',
    'dash.settings': 'Paramètres',
    'dash.billing': 'Facturation',
    'dash.logout': 'Déconnexion',
    'dash.plan': 'Starter · 482 / 1 000 msgs',
    'dash.settingsLink': 'Paramètres',
    'dash.language': 'Langue',

    'ov.conversations': 'Conversations',
    'ov.resolution': 'Résolution IA',
    'ov.pages': 'Pages indexées',
    'ov.avg': 'Réponse moy.',
    'ov.recent': 'Conversations récentes',
    'ov.viewAll': 'Tout voir →',
    'ov.visitor': 'Visiteur',
    'ov.message': 'Message',
    'ov.status': 'Statut',
    'ov.time': 'Heure',
    'ov.ai': 'Géré par l’IA',
    'ov.human': 'Besoin d’humain',

    'kb.intro':
      'Ajoutez votre site, importez des documents ou des images avec descriptions. Allo indexe tout pour des réponses ancrées dans votre contenu.',
    'kb.crawl': 'Crawler le site',
    'kb.crawling': 'Crawl en cours…',
    'kb.uploadDocs': 'Importer PDF / DOCX',
    'kb.uploadImages': 'Importer des images',
    'kb.refresh': 'Tout actualiser',
    'kb.source': 'Source',
    'kb.type': 'Type',
    'kb.status': 'Statut',
    'kb.chunks': 'Chunks',
    'kb.updated': 'Mis à jour',
    'kb.modalTitle': 'Décrivez vos images',
    'kb.modalSub':
      'Donnez du contexte pour que l’IA sache quand afficher chaque image dans les conversations.',
    'kb.generate': 'Générer avec l’IA',
    'kb.cancel': 'Annuler',
    'kb.addImages': 'Ajouter {n} image(s)',
    'kb.placeholder': 'https://votresite.com',
    'kb.descPlaceholder': 'ex. Photo produit de l’AlloBot v2 en blanc',

    'inbox.needsHuman': 'Besoin d’humain',
    'inbox.live': 'En direct',
    'inbox.join': 'Rejoindre le chat',
    'inbox.autoTranslate': 'Traduction auto vers',
    'inbox.speaking': 'Langue',
    'inbox.typingHint': 'Vous tapez en {agent}. Le visiteur recevra en {visitor}.',
    'inbox.placeholder': 'Écrire une réponse…',
    'inbox.send': 'Envoyer',
    'inbox.original': 'Original',

    'an.msgs': 'Messages ce mois-ci',
    'an.resolution': 'Taux de résolution IA',
    'an.avg': 'Temps de réponse moy.',
    'an.handoffs': 'Transferts humains',
    'an.week': 'Conversations cette semaine',
    'an.topics': 'Sujets principaux',
    'an.breakdown': 'Répartition des résolutions',
    'an.aiResolved': 'Résolu par l’IA',
    'an.handed': 'Transféré à un humain',
    'an.abandoned': 'Abandonné',

    'dep.intro':
      'Personnalisez votre widget, puis collez ce snippet avant la balise </body> de votre site.',
    'dep.embed': 'Code d’intégration',
    'dep.copy': 'Copier',
    'dep.copied': 'Copié',
    'dep.appearance': 'Apparence et marque',
    'dep.headerName': 'Nom d’en-tête du widget',
    'dep.launcher': 'Style du bouton lanceur',
    'dep.icon': 'Icône chat',
    'dep.circle': 'Logo rond',
    'dep.square': 'Logo carré',
    'dep.logo': 'Logo personnalisé',
    'dep.upload': 'Importer une image',
    'dep.color': 'Couleur principale',
    'dep.welcome': 'Message de bienvenue',
    'dep.position': 'Position',
    'dep.right': 'Bas à droite',
    'dep.left': 'Bas à gauche',
    'dep.save': 'Enregistrer l’apparence',
    'dep.preview': 'Aperçu en direct',

    'set.company': 'Entreprise',
    'set.name': 'Nom de l’entreprise',
    'set.website': 'Site web',
    'set.supportEmail': 'E-mail support',
    'set.escalation': 'Règles d’escalade',
    'set.topics': 'Toujours escalader ces sujets',
    'set.topicsHelp':
      'Séparés par des virgules. Les questions correspondantes sautent l’IA et vont directement à votre boîte.',
    'set.hours': 'Heures d’ouverture (pour le transfert live)',
    'set.save': 'Enregistrer les paramètres',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

type I18nContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

const LANG_KEY = 'allo_lang';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    return saved === 'fr' || saved === 'en' ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Language) => setLangState(l);

  const t = (key: TranslationKey, vars?: Record<string, string | number>) => {
    let text: string = translations[lang][key] ?? translations.en[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within I18nProvider');
  return context;
}
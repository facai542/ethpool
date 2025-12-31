// 7语言完整翻译系统
export type Language = 'en' | 'de' | 'es' | 'fr' | 'it' | 'ru' | 'zh'

export const languageNames: Record<Language, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  ru: 'Русский',
  zh: '繁體中文'
}

export interface TranslationContent {
  loading: string
  error: string
  success: string
  confirm: string
  cancel: string
  dashboard: string
  mining: string
  wallet: string
  home: string
  invite: string
  user: string
  profile: string
  connectWallet: string
  disconnectWallet: string
  walletConnect: string
  walletDisconnect: string
  balance: string
  walletBalance: string
  walletStatus: string
  walletAddress: string
  address: string
  pleaseConnectWallet: string
  connectingWallet: string
  pleaseApproveUsdt: string
  approvingUsdt: string
  processingTransaction: string
  approvalSuccessful: string
  approvalFailed: string
  stakingSuccessful: string
  stakingFailed: string
  pleaseSwitchToBsc: string
  needApproval: string
  approved: string
  walletConnected: string
  walletDisconnected: string
  statusActive: string
  statusInactive: string
  connected: string
  disconnected: string
  active: string
  inactive: string
  stakingPool: string
  rewardPool: string
  stakingAPY: string
  playerIncome: string
  usdtPrice: string
  myAccount: string
  pleaseConnectWalletToView: string
  binanceAnniversary: string
  losslessMining: string
  participateInMining: string
  miningPool: string
  account: string
  exchange: string
  withdraw: string
  records: string
  walletMining: string
  reward: string
  oneMillion: string
  totalOutput: string
  activeNodes: string
  participants: string
  userIncome: string
  miningOutput: string
  miningRewards: string
  stakingRewards: string
  exchangeOneEth: string
  noRecords: string
  quantity: string
  status: string
  amount: string
  switchToBsc: string
  authorizing: string
  approving: string
  approveUsdt: string
  staking: string
  stakeUsdt: string
  liquidityMiningData: string
  totalProduction: string
  effectiveNodes: string
  participantNumber: string
  liquidityMiningOutput: string
  regulatoryAuthorities: string
  earnedRewards: string
  exchangeRecords: string
  withdrawRecords: string
  invitationRewards: string
  earningsRecords: string
  time: string
  payAmount: string
  receiveAmount: string
  earnings: string
  earningsRate: string
  noExchangeRecords: string
  noWithdrawRecords: string
  noEarningsRecords: string
  completed: string
  pending: string
  failed: string
  processing: string
  
  // 缺失的翻译键
  submit: string
  back: string
  next: string
  retry: string
  settings: string
  referral: string
  referralCommission: string
  bonusRewards: string
  referralRewards: string
  income: string
  referralManagement: string
  manageReferralRelations: string
  referralList: string
  referralReward: string
  
  // Hero section 翻译键
  startMining: string
  
  // Global Liquidity Mining Network 翻译键
  globalLiquidityMiningNetwork: string
  globalLiquidityMiningNetworkDescription: string
  
  // 账户卡片翻译键
  userStatus: string
  invalid: string
  unverified: string
  verified: string
  verifying: string
  certificate: string
  exchangeable: string
  exchanged: string
  withdrawable: string
  shareDividends: string
  
  // 兑换功能翻译键
  exchangeEthToUsdt: string
  enterEthAmount: string
  receiveUsdtAmount: string
  exchangeRate: string
  exchangeAll: string
  exchangeButton: string
  
  // 新增的翻译键
  pleaseConnectWalletFirst: string
  noActivityData: string
  noWithdrawableBalance: string
  withdrawableBalance: string
  minWithdrawAmount: string
  verifying: string
  withdrawAll: string
  processing: string
  withdraw: string
  noActivityDataMessage: string
}

const translations: Record<Language, TranslationContent> = {
  en: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    cancel: 'Cancel',
    dashboard: 'Dashboard',
    mining: 'Mining',
    wallet: 'Wallet',
    home: 'Home',
    invite: 'Invite',
    user: 'User',
    profile: 'Profile',
    connectWallet: 'Connect Wallet',
    disconnectWallet: 'Disconnect Wallet',
    walletConnect: 'Wallet Connect',
    walletDisconnect: 'Wallet Disconnect',
    balance: 'Balance',
    walletBalance: 'Wallet Balance',
    walletStatus: 'Wallet Status',
    walletAddress: 'Wallet Address',
    address: 'Address',
    pleaseConnectWallet: 'Please connect wallet',
    connectingWallet: 'Connecting...',
    pleaseApproveUsdt: 'Please approve USDT first!',
    approvingUsdt: 'Approving...',
    processingTransaction: 'Processing...',
    approvalSuccessful: 'Unlimited approval successful! You can now stake USDT',
    approvalFailed: 'Approval failed',
    stakingSuccessful: 'Staking successful',
    stakingFailed: 'Staking failed',
    pleaseSwitchToBsc: 'Please switch to BSC network first!',
    needApproval: 'Approval required',
    approved: 'Approved',
    walletConnected: 'Wallet Connected',
    walletDisconnected: 'Wallet Disconnected',
    statusActive: 'Active',
    statusInactive: 'Inactive',
    connected: 'Connected',
    disconnected: 'Disconnected',
    active: 'Active',
    inactive: 'Inactive',
    stakingPool: 'Staking Pool',
    rewardPool: 'Reward Pool',
    stakingAPY: 'Staking APY',
    playerIncome: 'Player Income',
    usdtPrice: 'USDT Price',
    myAccount: 'My Account',
    pleaseConnectWalletToView: 'Please connect wallet to view account information',
    binanceAnniversary: 'Binance Anniversary',
    losslessMining: 'Lossless Mining',
    participateInMining: 'Participate in Mining',
    miningPool: 'Mining Pool',
    account: 'Account',
    exchange: 'Exchange',
    withdraw: 'Withdraw',
    records: 'Records',
    walletMining: 'Wallet Mining',
    reward: 'Reward',
    oneMillion: 'One Million',
    totalOutput: 'Total Output',
    activeNodes: 'Active Nodes',
    participants: 'Participants',
    userIncome: 'User Income',
    miningOutput: 'Mining Output',
    miningRewards: 'Mining Rewards',
    stakingRewards: 'Staking Rewards',
    exchangeOneEth: 'Exchange 1ETH',
    noRecords: 'No records',
    quantity: 'Quantity',
    status: 'Status',
    amount: 'Amount',
    switchToBsc: 'Switch to BSC',
    authorizing: 'Authorizing',
    approving: 'Approving',
    approveUsdt: 'Approve USDT',
    staking: 'Staking',
    stakeUsdt: 'Stake USDT',
    liquidityMiningData: 'Liquidity Mining Data',
    totalProduction: 'Total Production',
    effectiveNodes: 'Effective Nodes',
    participantNumber: 'Participant Number',
    liquidityMiningOutput: 'Liquidity Mining Output',
    regulatoryAuthorities: 'Regulatory Authorities',
    earnedRewards: 'Earned Rewards',
    exchangeRecords: 'Exchange',
    withdrawRecords: 'Withdraw',
    invitationRewards: 'Shared',
    earningsRecords: 'Earnings',
    time: 'Time',
    payAmount: 'Pay Amount',
    receiveAmount: 'Receive Amount',
    earnings: 'Earnings',
    earningsRate: 'Earnings Rate',
    noExchangeRecords: 'No Exchange Records',
    noWithdrawRecords: 'No Withdraw Records',
    noEarningsRecords: 'No Earnings Records',
    completed: 'Completed',
    pending: 'Pending',
    failed: 'Failed',
    processing: 'Processing',
    
    // 缺失的翻译键
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    retry: 'Retry',
    settings: 'Settings',
    referral: 'Referral',
    referralCommission: 'Referral Commission',
    bonusRewards: 'Bonus Rewards',
    referralRewards: 'Referral Rewards',
    income: 'Income',
    referralManagement: 'Referral Management',
    manageReferralRelations: 'Manage Referral Relations',
    referralList: 'Referral List',
    referralReward: 'Referral Reward',
    
    // Hero section 翻译键
    startMining: 'Start Mining Now',
    
    // Global Liquidity Mining Network 翻译键
    globalLiquidityMiningNetwork: 'Global Liquidity Mining Network',
    globalLiquidityMiningNetworkDescription: 'Connect global Binance users, realize cross-regional liquidity mining and asset allocation, enjoy 24/7 uninterrupted mining rewards.',
    
    // 账户卡片翻译键
    userStatus: 'User Status',
    invalid: 'Invalid',
    unverified: 'Unverified',
    certificate: 'Certificate',
    exchangeable: 'Exchangeable',
    exchanged: 'Exchanged',
    withdrawable: 'Withdrawable',
    shareDividends: 'Share Dividends',
    
    // 兑换功能翻译键
    exchangeEthToUsdt: 'Exchange ETH to USDT',
    enterEthAmount: 'Enter ETH amount',
    receiveUsdtAmount: 'You will receive USDT',
    exchangeRate: 'Exchange Rate',
    exchangeAll: 'Exchange All',
    exchangeButton: 'Exchange ETH to USDT',
    
    // 新增的翻译键
    pleaseConnectWalletFirst: 'Please connect wallet first',
    noActivityData: 'No activity data',
    noWithdrawableBalance: 'No withdrawable balance',
    withdrawableBalance: 'Withdrawable Balance',
    minWithdrawAmount: 'Minimum withdrawal: 10 USDT',
    verifying: 'Verifying',
    withdrawAll: 'Withdraw All',
    processing: 'Processing',
    withdraw: 'Withdraw',
    noActivityDataMessage: 'No activity data available'
  },
  de: {
    loading: 'Laden...',
    error: 'Fehler',
    success: 'Erfolg',
    confirm: 'Bestätigen',
    cancel: 'Abbrechen',
    dashboard: 'Dashboard',
    mining: 'Mining',
    wallet: 'Wallet',
    home: 'Startseite',
    invite: 'Einladen',
    user: 'Benutzer',
    profile: 'Profil',
    connectWallet: 'Wallet verbinden',
    disconnectWallet: 'Wallet trennen',
    walletConnect: 'Wallet-Verbindung',
    walletDisconnect: 'Wallet-Trennung',
    balance: 'Guthaben',
    walletBalance: 'Wallet-Guthaben',
    walletStatus: 'Wallet-Status',
    walletAddress: 'Wallet-Adresse',
    address: 'Adresse',
    pleaseConnectWallet: 'Bitte Wallet verbinden',
    connectingWallet: 'Verbinden...',
    pleaseApproveUsdt: 'Bitte zuerst USDT genehmigen!',
    approvingUsdt: 'Genehmigung...',
    processingTransaction: 'Verarbeitung...',
    approvalSuccessful: 'Unbegrenzte Genehmigung erfolgreich! Sie können jetzt USDT staken',
    approvalFailed: 'Genehmigung fehlgeschlagen',
    stakingSuccessful: 'Staking erfolgreich',
    stakingFailed: 'Staking fehlgeschlagen',
    pleaseSwitchToBsc: 'Bitte zuerst zum BSC-Netzwerk wechseln!',
    needApproval: 'Genehmigung erforderlich',
    approved: 'Genehmigt',
    walletConnected: 'Wallet verbunden',
    walletDisconnected: 'Wallet getrennt',
    statusActive: 'Aktiv',
    statusInactive: 'Inaktiv',
    connected: 'Verbunden',
    disconnected: 'Getrennt',
    active: 'Aktiv',
    inactive: 'Inaktiv',
    stakingPool: 'Staking-Pool',
    rewardPool: 'Belohnungspool',
    stakingAPY: 'Staking-APY',
    playerIncome: 'Spielereinkommen',
    usdtPrice: 'USDT-Preis',
    myAccount: 'Mein Konto',
    pleaseConnectWalletToView: 'Bitte Wallet verbinden, um Kontoinformationen anzuzeigen',
    binanceAnniversary: 'Binance-Jubiläum',
    losslessMining: 'Verlustfreies Mining',
    participateInMining: 'Am Mining teilnehmen',
    miningPool: 'Mining-Pool',
    account: 'Konto',
    exchange: 'Tauschen',
    withdraw: 'Abheben',
    records: 'Aufzeichnungen',
    walletMining: 'Wallet-Mining',
    reward: 'Belohnung',
    oneMillion: 'Eine Million',
    totalOutput: 'Gesamtleistung',
    activeNodes: 'Aktive Knoten',
    participants: 'Teilnehmer',
    userIncome: 'Benutzereinkommen',
    miningOutput: 'Mining-Ausgabe',
    miningRewards: 'Mining-Belohnungen',
    stakingRewards: 'Staking-Belohnungen',
    exchangeOneEth: '1ETH tauschen',
    noRecords: 'Keine Aufzeichnungen',
    quantity: 'Menge',
    status: 'Status',
    amount: 'Betrag',
    switchToBsc: 'Zu BSC wechseln',
    authorizing: 'Autorisierung',
    approving: 'Genehmigung',
    approveUsdt: 'USDT genehmigen',
    staking: 'Staking',
    stakeUsdt: 'USDT staken',
    liquidityMiningData: 'Liquiditäts-Mining-Daten',
    totalProduction: 'Gesamtproduktion',
    effectiveNodes: 'Effektive Knoten',
    participantNumber: 'Teilnehmerzahl',
    liquidityMiningOutput: 'Liquiditäts-Mining-Ausgabe',
    regulatoryAuthorities: 'Regulierungsbehörden',
    earnedRewards: 'Verdiente Belohnungen',
    exchangeRecords: 'Tausch',
    withdrawRecords: 'Abhebung',
    invitationRewards: 'Geteilt',
    earningsRecords: 'Ertrag',
    time: 'Zeit',
    payAmount: 'Zahlungsbetrag',
    receiveAmount: 'Empfangsbetrag',
    earnings: 'Erträge',
    earningsRate: 'Ertragsrate',
    noExchangeRecords: 'Keine Tauschaufzeichnungen',
    noWithdrawRecords: 'Keine Abhebungsaufzeichnungen',
    noEarningsRecords: 'Keine Ertragsaufzeichnungen',
    completed: 'Abgeschlossen',
    pending: 'Ausstehend',
    failed: 'Fehlgeschlagen',
    processing: 'Verarbeitung',
    
    // 缺失的翻译键
    submit: 'Senden',
    back: 'Zurück',
    next: 'Weiter',
    retry: 'Wiederholen',
    settings: 'Einstellungen',
    referral: 'Empfehlung',
    referralCommission: 'Empfehlungsprovision',
    bonusRewards: 'Bonusbelohnungen',
    referralRewards: 'Empfehlungsbelohnungen',
    income: 'Einkommen',
    referralManagement: 'Empfehlungsverwaltung',
    manageReferralRelations: 'Empfehlungsbeziehungen verwalten',
    referralList: 'Empfehlungsliste',
    referralReward: 'Empfehlungsbelohnung',
    
    // Hero section 翻译键
    startMining: 'Jetzt Mining starten',
    
    // Global Liquidity Mining Network 翻译键
    globalLiquidityMiningNetwork: 'Globales Liquiditäts-Mining-Netzwerk',
    globalLiquidityMiningNetworkDescription: 'Verbinden Sie globale Binance-Nutzer, realisieren Sie länderübergreifendes Liquiditäts-Mining und Asset-Allokation, genießen Sie 24/7 ununterbrochene Mining-Belohnungen.',
    
    // 账户卡片翻译键
    userStatus: 'Benutzerstatus',
    invalid: 'Ungültig',
    unverified: 'Nicht verifiziert',
    certificate: 'Zertifikat',
    exchangeable: 'Tauschbar',
    exchanged: 'Getauscht',
    withdrawable: 'Abhebbar',
    shareDividends: 'Dividendenanteil',
    
    // 兑换功能翻译键
    exchangeEthToUsdt: 'ETH zu USDT tauschen',
    enterEthAmount: 'ETH-Betrag eingeben',
    receiveUsdtAmount: 'Sie erhalten USDT',
    exchangeRate: 'Wechselkurs',
    exchangeAll: 'Alles tauschen',
    exchangeButton: 'ETH zu USDT tauschen',
    
    // 新增的翻译键
    pleaseConnectWalletFirst: 'Bitte zuerst Wallet verbinden',
    noActivityData: 'Keine Aktivitätsdaten',
    noWithdrawableBalance: 'Kein abhebbares Guthaben',
    withdrawableBalance: 'Abhebbares Guthaben',
    minWithdrawAmount: 'Mindestabhebung: 10 USDT',
    verifying: 'Verifizierung',
    withdrawAll: 'Alles abheben',
    processing: 'Verarbeitung',
    withdraw: 'Abheben',
    noActivityDataMessage: 'Keine Aktivitätsdaten verfügbar'
  },
  es: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    dashboard: 'Panel',
    mining: 'Minería',
    wallet: 'Cartera',
    home: 'Inicio',
    invite: 'Invitar',
    user: 'Usuario',
    profile: 'Perfil',
    connectWallet: 'Conectar cartera',
    disconnectWallet: 'Desconectar cartera',
    walletConnect: 'Conexión de cartera',
    walletDisconnect: 'Desconexión de cartera',
    balance: 'Saldo',
    walletBalance: 'Saldo de cartera',
    walletStatus: 'Estado de cartera',
    walletAddress: 'Dirección de cartera',
    address: 'Dirección',
    pleaseConnectWallet: 'Por favor conecta la cartera',
    connectingWallet: 'Conectando...',
    pleaseApproveUsdt: '¡Por favor aprueba USDT primero!',
    approvingUsdt: 'Aprobando...',
    processingTransaction: 'Procesando...',
    approvalSuccessful: 'Aprobación ilimitada exitosa! Ahora puedes apostar USDT',
    approvalFailed: 'Aprobación fallida',
    stakingSuccessful: 'Apuesta exitosa',
    stakingFailed: 'Apuesta fallida',
    pleaseSwitchToBsc: '¡Por favor cambia primero a la red BSC!',
    needApproval: 'Aprobación requerida',
    approved: 'Aprobado',
    walletConnected: 'Cartera conectada',
    walletDisconnected: 'Cartera desconectada',
    statusActive: 'Activo',
    statusInactive: 'Inactivo',
    connected: 'Conectado',
    disconnected: 'Desconectado',
    active: 'Activo',
    inactive: 'Inactivo',
    stakingPool: 'Pool de staking',
    rewardPool: 'Pool de recompensas',
    stakingAPY: 'APY de staking',
    playerIncome: 'Ingresos del jugador',
    usdtPrice: 'Precio USDT',
    myAccount: 'Mi Cuenta',
    pleaseConnectWalletToView: 'Por favor conecta la cartera para ver la información de la cuenta',
    binanceAnniversary: 'Aniversario de Binance',
    losslessMining: 'Minería sin pérdidas',
    participateInMining: 'Participar en minería',
    miningPool: 'Pool de Minería',
    account: 'Cuenta',
    exchange: 'Intercambio',
    withdraw: 'Retirar',
    records: 'Registros',
    walletMining: 'Minería de cartera',
    reward: 'Recompensa',
    oneMillion: 'Un millón',
    totalOutput: 'Producción total',
    activeNodes: 'Nodos activos',
    participants: 'Participantes',
    userIncome: 'Ingresos del usuario',
    miningOutput: 'Producción de minería',
    miningRewards: 'Recompensas de minería',
    stakingRewards: 'Recompensas de staking',
    exchangeOneEth: 'Intercambiar 1ETH',
    noRecords: 'Sin registros',
    quantity: 'Cantidad',
    status: 'Estado',
    amount: 'Cantidad',
    switchToBsc: 'Cambiar a BSC',
    authorizing: 'Autorizando',
    approving: 'Aprobando',
    approveUsdt: 'Aprobar USDT',
    staking: 'Apostando',
    stakeUsdt: 'Apostar USDT',
    liquidityMiningData: 'Datos de minería de liquidez',
    totalProduction: 'Producción total',
    effectiveNodes: 'Nodos efectivos',
    participantNumber: 'Número de participantes',
    liquidityMiningOutput: 'Producción de minería de liquidez',
    regulatoryAuthorities: 'Autoridades regulatorias',
    earnedRewards: 'Recompensas ganadas',
    exchangeRecords: 'Intercambio',
    withdrawRecords: 'Retiro',
    invitationRewards: 'Compartido',
    earningsRecords: 'Ganancias',
    time: 'Tiempo',
    payAmount: 'Cantidad de pago',
    receiveAmount: 'Cantidad recibida',
    earnings: 'Ganancias',
    earningsRate: 'Tasa de ganancias',
    noExchangeRecords: 'Sin registros de intercambio',
    noWithdrawRecords: 'Sin registros de retiro',
    noEarningsRecords: 'Sin registros de ganancias',
    completed: 'Completado',
    pending: 'Pendiente',
    failed: 'Fallido',
    processing: 'Procesando',
    
    // 缺失的翻译键
    submit: 'Enviar',
    back: 'Atrás',
    next: 'Siguiente',
    retry: 'Reintentar',
    settings: 'Configuración',
    referral: 'Referido',
    referralCommission: 'Comisión de referido',
    bonusRewards: 'Recompensas de bono',
    referralRewards: 'Recompensas de referido',
    income: 'Ingresos',
    referralManagement: 'Gestión de referidos',
    manageReferralRelations: 'Gestionar relaciones de referidos',
    referralList: 'Lista de referidos',
    referralReward: 'Recompensa de referido',
    
    // Hero section 翻译键
    startMining: 'Comenzar a Minar Ahora',
    
    // Global Liquidity Mining Network 翻译键
    globalLiquidityMiningNetwork: 'Red Global de Minería de Liquidez',
    globalLiquidityMiningNetworkDescription: 'Conecta usuarios globales de Binance, realiza minería de liquidez interregional y asignación de activos, disfruta de recompensas de minería ininterrumpidas 24/7.',
    
    // 账户卡片翻译键
    userStatus: 'Estado del Usuario',
    invalid: 'Inválido',
    unverified: 'No verificado',
    certificate: 'Certificado',
    exchangeable: 'Intercambiable',
    exchanged: 'Intercambiado',
    withdrawable: 'Retirable',
    shareDividends: 'Dividendos Compartidos',
    
    // 兑换功能翻译键
    exchangeEthToUsdt: 'Intercambiar ETH a USDT',
    enterEthAmount: 'Ingrese cantidad de ETH',
    receiveUsdtAmount: 'Recibirá USDT',
    exchangeRate: 'Tipo de Cambio',
    exchangeAll: 'Intercambiar Todo',
    exchangeButton: 'Intercambiar ETH a USDT',
    
    // 新增的翻译键
    pleaseConnectWalletFirst: 'Por favor conecta la cartera primero',
    noActivityData: 'Sin datos de actividad',
    noWithdrawableBalance: 'Sin saldo retirable',
    withdrawableBalance: 'Saldo Retirable',
    minWithdrawAmount: 'Retiro mínimo: 10 USDT',
    verifying: 'Verificando',
    withdrawAll: 'Retirar Todo',
    processing: 'Procesando',
    withdraw: 'Retirar',
    noActivityDataMessage: 'No hay datos de actividad disponibles'
  },
  fr: {
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    dashboard: 'Tableau de bord',
    mining: 'Minage',
    wallet: 'Portefeuille',
    home: 'Accueil',
    invite: 'Inviter',
    user: 'Utilisateur',
    profile: 'Profil',
    connectWallet: 'Connecter le portefeuille',
    disconnectWallet: 'Déconnecter le portefeuille',
    walletConnect: 'Connexion du portefeuille',
    walletDisconnect: 'Déconnexion du portefeuille',
    balance: 'Solde',
    walletBalance: 'Solde du portefeuille',
    walletStatus: 'Statut du portefeuille',
    walletAddress: 'Adresse du portefeuille',
    address: 'Adresse',
    pleaseConnectWallet: 'Veuillez connecter le portefeuille',
    connectingWallet: 'Connexion...',
    pleaseApproveUsdt: 'Veuillez d\'abord approuver USDT !',
    approvingUsdt: 'Approbation...',
    processingTransaction: 'Traitement...',
    approvalSuccessful: 'Approbation illimitée réussie ! Vous pouvez maintenant miser USDT',
    approvalFailed: 'Échec de l\'approbation',
    stakingSuccessful: 'Mise réussie',
    stakingFailed: 'Échec de la mise',
    pleaseSwitchToBsc: 'Veuillez d\'abord passer au réseau BSC !',
    needApproval: 'Approbation requise',
    approved: 'Approuvé',
    walletConnected: 'Portefeuille connecté',
    walletDisconnected: 'Portefeuille déconnecté',
    statusActive: 'Actif',
    statusInactive: 'Inactif',
    connected: 'Connecté',
    disconnected: 'Déconnecté',
    active: 'Actif',
    inactive: 'Inactif',
    stakingPool: 'Pool de mise',
    rewardPool: 'Pool de récompenses',
    stakingAPY: 'APY de mise',
    playerIncome: 'Revenus du joueur',
    usdtPrice: 'Prix USDT',
    myAccount: 'Mon Compte',
    pleaseConnectWalletToView: 'Veuillez connecter le portefeuille pour voir les informations du compte',
    binanceAnniversary: 'Anniversaire Binance',
    losslessMining: 'Minage sans perte',
    participateInMining: 'Participer au minage',
    miningPool: 'Pool de Minage',
    account: 'Compte',
    exchange: 'Échange',
    withdraw: 'Retirer',
    records: 'Enregistrements',
    walletMining: 'Minage de portefeuille',
    reward: 'Récompense',
    oneMillion: 'Un million',
    totalOutput: 'Production totale',
    activeNodes: 'Nœuds actifs',
    participants: 'Participants',
    userIncome: 'Revenus utilisateur',
    miningOutput: 'Production de minage',
    miningRewards: 'Récompenses de minage',
    stakingRewards: 'Récompenses de mise',
    exchangeOneEth: 'Échanger 1ETH',
    noRecords: 'Aucun enregistrement',
    quantity: 'Quantité',
    status: 'Statut',
    amount: 'Montant',
    switchToBsc: 'Basculer vers BSC',
    authorizing: 'Autorisation',
    approving: 'Approbation',
    approveUsdt: 'Approuver USDT',
    staking: 'Mise en jeu',
    stakeUsdt: 'Miser USDT',
    liquidityMiningData: 'Données de minage de liquidité',
    totalProduction: 'Production totale',
    effectiveNodes: 'Nœuds effectifs',
    participantNumber: 'Nombre de participants',
    liquidityMiningOutput: 'Production de minage de liquidité',
    regulatoryAuthorities: 'Autorités réglementaires',
    earnedRewards: 'Récompenses gagnées',
    exchangeRecords: 'Échange',
    withdrawRecords: 'Retrait',
    invitationRewards: 'Partagé',
    earningsRecords: 'Gains',
    time: 'Temps',
    payAmount: 'Montant du paiement',
    receiveAmount: 'Montant reçu',
    earnings: 'Gains',
    earningsRate: 'Taux de gains',
    noExchangeRecords: 'Aucun enregistrement d\'échange',
    noWithdrawRecords: 'Aucun enregistrement de retrait',
    noEarningsRecords: 'Aucun enregistrement de gains',
    completed: 'Terminé',
    pending: 'En attente',
    failed: 'Échoué',
    processing: 'Traitement',
    
    // 缺失的翻译键
    submit: 'Soumettre',
    back: 'Retour',
    next: 'Suivant',
    retry: 'Réessayer',
    settings: 'Paramètres',
    referral: 'Parrainage',
    referralCommission: 'Commission de parrainage',
    bonusRewards: 'Récompenses bonus',
    referralRewards: 'Récompenses de parrainage',
    income: 'Revenus',
    referralManagement: 'Gestion des parrainages',
    manageReferralRelations: 'Gérer les relations de parrainage',
    referralList: 'Liste de parrainages',
    referralReward: 'Récompense de parrainage',
    
    // Hero section 翻译键
    startMining: 'Commencer le Minage Maintenant',
    
    // Global Liquidity Mining Network 翻译键
    globalLiquidityMiningNetwork: 'Réseau Mondial de Minage de Liquidité',
    globalLiquidityMiningNetworkDescription: 'Connectez les utilisateurs mondiaux de Binance, réalisez un minage de liquidité transrégional et une allocation d\'actifs, profitez de récompenses de minage ininterrompues 24h/24 et 7j/7.',
    
    // 账户卡片翻译键
    userStatus: 'Statut Utilisateur',
    invalid: 'Invalide',
    unverified: 'Non vérifié',
    certificate: 'Certificat',
    exchangeable: 'Échangeable',
    exchanged: 'Échangé',
    withdrawable: 'Retirable',
    shareDividends: 'Dividendes Partagés',
    
    // 兑换功能翻译键
    exchangeEthToUsdt: 'Échanger ETH en USDT',
    enterEthAmount: 'Entrez le montant ETH',
    receiveUsdtAmount: 'Vous recevrez USDT',
    exchangeRate: 'Taux de Change',
    exchangeAll: 'Tout Échanger',
    exchangeButton: 'Échanger ETH en USDT',
    
    // 新增的翻译键
    pleaseConnectWalletFirst: 'Veuillez d\'abord connecter le portefeuille',
    noActivityData: 'Aucune donnée d\'activité',
    noWithdrawableBalance: 'Aucun solde retirable',
    withdrawableBalance: 'Solde Retirable',
    minWithdrawAmount: 'Retrait minimum: 10 USDT',
    verifying: 'Vérification',
    withdrawAll: 'Tout Retirer',
    processing: 'Traitement',
    withdraw: 'Retirer',
    noActivityDataMessage: 'Aucune donnée d\'activité disponible'
  },
  it: {
    loading: 'Caricamento...',
    error: 'Errore',
    success: 'Successo',
    confirm: 'Conferma',
    cancel: 'Annulla',
    dashboard: 'Dashboard',
    mining: 'Mining',
    wallet: 'Portafoglio',
    home: 'Home',
    invite: 'Invita',
    user: 'Utente',
    profile: 'Profilo',
    connectWallet: 'Connetti portafoglio',
    disconnectWallet: 'Disconnetti portafoglio',
    walletConnect: 'Connessione portafoglio',
    walletDisconnect: 'Disconnessione portafoglio',
    balance: 'Saldo',
    walletBalance: 'Saldo portafoglio',
    walletStatus: 'Stato portafoglio',
    walletAddress: 'Indirizzo portafoglio',
    address: 'Indirizzo',
    pleaseConnectWallet: 'Per favore connetti il portafoglio',
    connectingWallet: 'Connessione...',
    pleaseApproveUsdt: 'Per favore approva prima USDT!',
    approvingUsdt: 'Approvazione...',
    processingTransaction: 'Elaborazione...',
    approvalSuccessful: 'Approvazione illimitata riuscita! Ora puoi fare staking di USDT',
    approvalFailed: 'Approvazione fallita',
    stakingSuccessful: 'Staking riuscito',
    stakingFailed: 'Staking fallito',
    pleaseSwitchToBsc: 'Per favore passa prima alla rete BSC!',
    needApproval: 'Approvazione richiesta',
    approved: 'Approvato',
    walletConnected: 'Portafoglio connesso',
    walletDisconnected: 'Portafoglio disconnesso',
    statusActive: 'Attivo',
    statusInactive: 'Inattivo',
    connected: 'Connesso',
    disconnected: 'Disconnesso',
    active: 'Attivo',
    inactive: 'Inattivo',
    stakingPool: 'Pool di staking',
    rewardPool: 'Pool di ricompense',
    stakingAPY: 'APY di staking',
    playerIncome: 'Reddito giocatore',
    usdtPrice: 'Prezzo USDT',
    myAccount: 'Il Mio Account',
    pleaseConnectWalletToView: 'Per favore connetti il portafoglio per vedere le informazioni dell\'account',
    binanceAnniversary: 'Anniversario Binance',
    losslessMining: 'Mining senza perdite',
    participateInMining: 'Partecipa al mining',
    miningPool: 'Pool di Mining',
    account: 'Account',
    exchange: 'Scambio',
    withdraw: 'Preleva',
    records: 'Registri',
    walletMining: 'Mining del portafoglio',
    reward: 'Ricompensa',
    oneMillion: 'Un milione',
    totalOutput: 'Produzione totale',
    activeNodes: 'Nodi attivi',
    participants: 'Partecipanti',
    userIncome: 'Reddito utente',
    miningOutput: 'Produzione mining',
    miningRewards: 'Ricompense mining',
    stakingRewards: 'Ricompense staking',
    exchangeOneEth: 'Scambia 1ETH',
    noRecords: 'Nessun record',
    quantity: 'Quantità',
    status: 'Stato',
    amount: 'Importo',
    switchToBsc: 'Passa a BSC',
    authorizing: 'Autorizzazione',
    approving: 'Approvazione',
    approveUsdt: 'Approva USDT',
    staking: 'Staking',
    stakeUsdt: 'Stake USDT',
    liquidityMiningData: 'Dati mining di liquidità',
    totalProduction: 'Produzione totale',
    effectiveNodes: 'Nodi efficaci',
    participantNumber: 'Numero partecipanti',
    liquidityMiningOutput: 'Produzione mining di liquidità',
    regulatoryAuthorities: 'Autorità regolatorie',
    earnedRewards: 'Ricompense guadagnate',
    exchangeRecords: 'Scambio',
    withdrawRecords: 'Prelievo',
    invitationRewards: 'Condiviso',
    earningsRecords: 'Guadagni',
    time: 'Tempo',
    payAmount: 'Importo pagamento',
    receiveAmount: 'Importo ricevuto',
    earnings: 'Guadagni',
    earningsRate: 'Tasso di guadagni',
    noExchangeRecords: 'Nessun registro di scambio',
    noWithdrawRecords: 'Nessun registro di prelievo',
    noEarningsRecords: 'Nessun registro di guadagni',
    completed: 'Completato',
    pending: 'In attesa',
    failed: 'Fallito',
    processing: 'Elaborazione',
    
    // 缺失的翻译键
    submit: 'Invia',
    back: 'Indietro',
    next: 'Avanti',
    retry: 'Riprova',
    settings: 'Impostazioni',
    referral: 'Referral',
    referralCommission: 'Commissione referral',
    bonusRewards: 'Ricompense bonus',
    referralRewards: 'Ricompense referral',
    income: 'Reddito',
    referralManagement: 'Gestione referral',
    manageReferralRelations: 'Gestisci relazioni referral',
    referralList: 'Lista referral',
    referralReward: 'Ricompensa referral',
    
    // Hero section 翻译键
    startMining: 'Inizia il Mining Ora',
    
    // Global Liquidity Mining Network 翻译键
    globalLiquidityMiningNetwork: 'Rete Globale di Mining della Liquidità',
    globalLiquidityMiningNetworkDescription: 'Collega gli utenti globali di Binance, realizza mining della liquidità interregionale e allocazione delle risorse, goditi ricompense di mining ininterrotte 24/7.',
    
    // 账户卡片翻译键
    userStatus: 'Stato Utente',
    invalid: 'Non valido',
    unverified: 'Non verificato',
    certificate: 'Certificato',
    exchangeable: 'Scambiabile',
    exchanged: 'Scambiato',
    withdrawable: 'Prelevabile',
    shareDividends: 'Dividendi Condivisi',
    
    // 兑换功能翻译键
    exchangeEthToUsdt: 'Scambia ETH in USDT',
    enterEthAmount: 'Inserisci importo ETH',
    receiveUsdtAmount: 'Riceverai USDT',
    exchangeRate: 'Tasso di Cambio',
    exchangeAll: 'Scambia Tutto',
    exchangeButton: 'Scambia ETH in USDT',
    
    // 新增的翻译键
    pleaseConnectWalletFirst: 'Per favore connetti prima il portafoglio',
    noActivityData: 'Nessun dato di attività',
    noWithdrawableBalance: 'Nessun saldo prelevabile',
    withdrawableBalance: 'Saldo Prelevabile',
    minWithdrawAmount: 'Prelievo minimo: 10 USDT',
    verifying: 'Verifica',
    withdrawAll: 'Preleva Tutto',
    processing: 'Elaborazione',
    withdraw: 'Preleva',
    noActivityDataMessage: 'Nessun dato di attività disponibile'
  },
  ru: {
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успех',
    confirm: 'Подтвердить',
    cancel: 'Отмена',
    dashboard: 'Панель',
    mining: 'Майнинг',
    wallet: 'Кошелек',
    home: 'Главная',
    invite: 'Пригласить',
    user: 'Пользователь',
    profile: 'Профиль',
    connectWallet: 'Подключить кошелек',
    disconnectWallet: 'Отключить кошелек',
    walletConnect: 'Подключение кошелька',
    walletDisconnect: 'Отключение кошелька',
    balance: 'Баланс',
    walletBalance: 'Баланс кошелька',
    walletStatus: 'Статус кошелька',
    walletAddress: 'Адрес кошелька',
    address: 'Адрес',
    pleaseConnectWallet: 'Пожалуйста, подключите кошелек',
    connectingWallet: 'Подключение...',
    pleaseApproveUsdt: 'Пожалуйста, сначала одобрите USDT!',
    approvingUsdt: 'Одобрение...',
    processingTransaction: 'Обработка...',
    approvalSuccessful: 'Безлимитное одобрение успешно! Теперь вы можете стейкать USDT',
    approvalFailed: 'Одобрение не удалось',
    stakingSuccessful: 'Стейкинг успешен',
    stakingFailed: 'Стейкинг не удался',
    pleaseSwitchToBsc: 'Пожалуйста, сначала переключитесь на сеть BSC!',
    needApproval: 'Требуется одобрение',
    approved: 'Одобрено',
    walletConnected: 'Кошелек подключен',
    walletDisconnected: 'Кошелек отключен',
    statusActive: 'Активен',
    statusInactive: 'Неактивен',
    connected: 'Подключен',
    disconnected: 'Отключен',
    active: 'Активен',
    inactive: 'Неактивен',
    stakingPool: 'Пул стейкинга',
    rewardPool: 'Пул наград',
    stakingAPY: 'APY стейкинга',
    playerIncome: 'Доход игрока',
    usdtPrice: 'Цена USDT',
    myAccount: 'Мой Аккаунт',
    pleaseConnectWalletToView: 'Пожалуйста, подключите кошелек для просмотра информации об аккаунте',
    binanceAnniversary: 'Юбилей Binance',
    losslessMining: 'Майнинг без потерь',
    participateInMining: 'Участвовать в майнинге',
    miningPool: 'Пул Майнинга',
    account: 'Аккаунт',
    exchange: 'Обмен',
    withdraw: 'Вывод',
    records: 'Записи',
    walletMining: 'Майнинг кошелька',
    reward: 'Награда',
    oneMillion: 'Один миллион',
    totalOutput: 'Общий выход',
    activeNodes: 'Активные узлы',
    participants: 'Участники',
    userIncome: 'Доход пользователя',
    miningOutput: 'Выход майнинга',
    miningRewards: 'Награды майнинга',
    stakingRewards: 'Награды стейкинга',
    exchangeOneEth: 'Обменять 1ETH',
    noRecords: 'Нет записей',
    quantity: 'Количество',
    status: 'Статус',
    amount: 'Сумма',
    switchToBsc: 'Переключиться на BSC',
    authorizing: 'Авторизация',
    approving: 'Одобрение',
    approveUsdt: 'Одобрить USDT',
    staking: 'Стейкинг',
    stakeUsdt: 'Стейкать USDT',
    liquidityMiningData: 'Данные майнинга ликвидности',
    totalProduction: 'Общее производство',
    effectiveNodes: 'Эффективные узлы',
    participantNumber: 'Количество участников',
    liquidityMiningOutput: 'Выход майнинга ликвидности',
    regulatoryAuthorities: 'Регулирующие органы',
    earnedRewards: 'Заработанные награды',
    exchangeRecords: 'Обмен',
    withdrawRecords: 'Вывод',
    invitationRewards: 'Общий',
    earningsRecords: 'Доходы',
    time: 'Время',
    payAmount: 'Сумма платежа',
    receiveAmount: 'Полученная сумма',
    earnings: 'Доходы',
    earningsRate: 'Норма доходов',
    noExchangeRecords: 'Нет записей обмена',
    noWithdrawRecords: 'Нет записей вывода',
    noEarningsRecords: 'Нет записей доходов',
    completed: 'Завершено',
    pending: 'В ожидании',
    failed: 'Неудачно',
    processing: 'Обработка',
    
    // 缺失的翻译键
    submit: 'Отправить',
    back: 'Назад',
    next: 'Далее',
    retry: 'Повторить',
    settings: 'Настройки',
    referral: 'Реферал',
    referralCommission: 'Реферальная комиссия',
    bonusRewards: 'Бонусные награды',
    referralRewards: 'Реферальные награды',
    income: 'Доход',
    referralManagement: 'Управление рефералами',
    manageReferralRelations: 'Управлять реферальными отношениями',
    referralList: 'Список рефералов',
    referralReward: 'Реферальная награда',
    
    // Hero section 翻译键
    startMining: 'Начать майнинг сейчас',
    
    // Global Liquidity Mining Network 翻译键
    globalLiquidityMiningNetwork: 'Глобальная сеть майнинга ликвидности',
    globalLiquidityMiningNetworkDescription: 'Подключайте глобальных пользователей Binance, реализуйте межрегиональный майнинг ликвидности и распределение активов, наслаждайтесь непрерывными наградами за майнинг 24/7.',
    
    // 账户卡片翻译键
    userStatus: 'Статус Пользователя',
    invalid: 'Недействительный',
    unverified: 'Не подтвержден',
    certificate: 'Сертификат',
    exchangeable: 'Обмениваемый',
    exchanged: 'Обменянный',
    withdrawable: 'Выводимый',
    shareDividends: 'Доля Дивидендов',
    
    // 兑换功能翻译键
    exchangeEthToUsdt: 'Обменять ETH на USDT',
    enterEthAmount: 'Введите количество ETH',
    receiveUsdtAmount: 'Вы получите USDT',
    exchangeRate: 'Курс Обмена',
    exchangeAll: 'Обменять Все',
    exchangeButton: 'Обменять ETH на USDT',
    
    // 新增的翻译键
    pleaseConnectWalletFirst: 'Пожалуйста, сначала подключите кошелек',
    noActivityData: 'Нет данных об активности',
    noWithdrawableBalance: 'Нет средств для вывода',
    withdrawableBalance: 'Доступно для вывода',
    minWithdrawAmount: 'Минимальный вывод: 10 USDT',
    verifying: 'Проверка',
    withdrawAll: 'Вывести Все',
    processing: 'Обработка',
    withdraw: 'Вывод',
    noActivityDataMessage: 'Нет доступных данных об активности'
  },
  zh: {
    loading: '載入中...',
    error: '錯誤',
    success: '成功',
    confirm: '確認',
    cancel: '取消',
    dashboard: '儀表板',
    mining: '挖礦',
    wallet: '錢包',
    home: '首頁',
    invite: '邀請',
    user: '用戶',
    profile: '個人資料',
    connectWallet: '連接錢包',
    disconnectWallet: '斷開錢包',
    walletConnect: '錢包連接',
    walletDisconnect: '錢包斷開',
    balance: '餘額',
    walletBalance: '錢包餘額',
    walletStatus: '錢包狀態',
    walletAddress: '錢包地址',
    address: '地址',
    pleaseConnectWallet: '請連接錢包',
    connectingWallet: '連接中...',
    pleaseApproveUsdt: '請先批准USDT！',
    approvingUsdt: '批准中...',
    processingTransaction: '處理中...',
    approvalSuccessful: '無限制批准成功！現在可以質押USDT',
    approvalFailed: '批准失敗',
    stakingSuccessful: '質押成功',
    stakingFailed: '質押失敗',
    pleaseSwitchToBsc: '請先切換到BSC網絡！',
    needApproval: '需要批准',
    approved: '已批准',
    walletConnected: '錢包已連接',
    walletDisconnected: '錢包已斷開',
    statusActive: '活躍',
    statusInactive: '不活躍',
    connected: '已連接',
    disconnected: '已斷開',
    active: '活躍',
    inactive: '不活躍',
    stakingPool: '質押池',
    rewardPool: '獎勵池',
    stakingAPY: '質押APY',
    playerIncome: '玩家收入',
    usdtPrice: 'USDT價格',
    myAccount: '我的賬戶',
    pleaseConnectWalletToView: '請連接錢包以查看賬戶信息',
    binanceAnniversary: '幣安週年慶',
    losslessMining: '無損挖礦',
    participateInMining: '參與挖礦',
    miningPool: '礦池',
    account: '賬戶',
    exchange: '兌換',
    withdraw: '提現',
    records: '記錄',
    walletMining: '錢包挖礦',
    reward: '獎勵',
    oneMillion: '一百萬',
    totalOutput: '總產量',
    activeNodes: '活躍節點',
    participants: '參與者',
    userIncome: '用戶收入',
    miningOutput: '挖礦產出',
    miningRewards: '挖礦獎勵',
    stakingRewards: '質押獎勵',
    exchangeOneEth: '兌換1ETH',
    noRecords: '無記錄',
    quantity: '數量',
    status: '狀態',
    amount: '金額',
    switchToBsc: '切換到BSC',
    authorizing: '授權中',
    approving: '批准中',
    approveUsdt: '批准USDT',
    staking: '質押中',
    stakeUsdt: '質押USDT',
    liquidityMiningData: '流動性挖礦數據',
    totalProduction: '總產量',
    effectiveNodes: '有效節點',
    participantNumber: '參與人數',
    liquidityMiningOutput: '流動性挖礦產出',
    regulatoryAuthorities: '監管機構',
    earnedRewards: '獲得的獎勵',
    exchangeRecords: '兌換',
    withdrawRecords: '提現',
    invitationRewards: '邀請獎勵',
    earningsRecords: '收益',
    time: '時間',
    payAmount: '支付數量',
    receiveAmount: '獲取數量',
    earnings: '收益',
    earningsRate: '收益率',
    noExchangeRecords: '無兌換記錄',
    noWithdrawRecords: '無提現記錄',
    noEarningsRecords: '無收益記錄',
    completed: '已完成',
    pending: '待處理',
    failed: '失敗',
    processing: '處理中',
    
    // 缺失的翻译键
    submit: '提交',
    back: '返回',
    next: '下一步',
    retry: '重試',
    settings: '設置',
    referral: '推薦',
    referralCommission: '推薦佣金',
    bonusRewards: '獎勵收益',
    referralRewards: '推薦獎勵',
    income: '收入',
    referralManagement: '推薦管理',
    manageReferralRelations: '管理推薦關係',
    referralList: '推薦列表',
    referralReward: '推薦獎勵',
    
    // Hero section 翻译键
    startMining: '立即開始挖礦',
    
    // Global Liquidity Mining Network 翻译键
    globalLiquidityMiningNetwork: '全球流動性挖礦網絡',
    globalLiquidityMiningNetworkDescription: '連接全球幣安用戶，實現跨地區流動性挖礦和資產配置，享受24/7不間斷的挖礦收益。',
    
    // 账户卡片翻译键
    userStatus: '用户状态',
    invalid: '无效',
    unverified: '未验证',
    certificate: '证书',
    exchangeable: '可兌換',
    exchanged: '已兌換',
    withdrawable: '可提取',
    shareDividends: '分紅比例',
    
    // 兑换功能翻译键
    exchangeEthToUsdt: 'ETH兌換USDT',
    enterEthAmount: '輸入ETH數量',
    receiveUsdtAmount: '您將獲得USDT',
    exchangeRate: '兌換匯率',
    exchangeAll: '全部兌換',
    exchangeButton: 'ETH兌換USDT',
    
    // 新增的翻译键
    pleaseConnectWalletFirst: '請先連接錢包',
    noActivityData: '暫無活動數據',
    noWithdrawableBalance: '沒有可提取的餘額',
    withdrawableBalance: '可提現餘額',
    minWithdrawAmount: '最低提現金額: 10 USDT',
    verifying: '驗證中',
    withdrawAll: '全部提取',
    processing: '處理中',
    withdraw: '提取',
    noActivityDataMessage: '暫無活動數據',
    
    // 按钮状态翻译键
    verified: '已验证',
    verifying: '验证中'
  }
}

export const getBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en'
  
  const browserLang = navigator.language.toLowerCase()
  
  if (browserLang.startsWith('zh')) return 'zh'
  if (browserLang.startsWith('de')) return 'de'
  if (browserLang.startsWith('es')) return 'es'
  if (browserLang.startsWith('fr')) return 'fr'
  if (browserLang.startsWith('it')) return 'it'
  if (browserLang.startsWith('ru')) return 'ru'
  
  return 'en'
}

export const getTranslation = (language: Language): TranslationContent => {
  return translations[language] || translations.en
}

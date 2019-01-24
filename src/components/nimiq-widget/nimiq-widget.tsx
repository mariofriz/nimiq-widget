import { Component, Prop, State, Event, EventEmitter, Watch } from '@stencil/core';
import { i18n } from './i18n';
declare var Nimiq: any;

@Component({
  tag: 'nimiq-widget',
  styleUrl: 'nimiq-widget.scss',
})
export class Widget {
  miner: any = null
  network: any = null
  consensus: any = null
  blockchain: any = null
  account: any = null
  availableThreads = navigator.hardwareConcurrency || 4
  pool = {
    host: 'eu.sushipool.com',
    port: '443'
  }

  @State() isOpen = false
  @State() page = 'help'
  @State() hashrate = 0
  @State() threads = 1
  @State() status = i18n['en'].common.connecting
  @State() shouldWork = true
  @State() isMining = false
  @State() i18n: any = {}

  @Prop() address = 'NQ54 EHLN L135 RBFU 305P 0GJT GTU0 S3G3 8MKJ'
  @Prop() autoHide = true
  @Prop() language: any = 'en'

  @Watch('language')
  languageChanged(newLanguage: any) {
    this.setLanguage(newLanguage)
  }

  @Event({
    eventName: 'nimiq-widget-ready'
  }) widgetReady: EventEmitter;

  componentWillLoad() {
    this.setLanguage(this.language)
  }

  componentDidLoad() {
    this.widgetReady.emit()
  }

  setLanguage(language) {
    console.log('set lang', language)
    if (i18n[language]) {
      this.i18n = i18n[language]
    } else if (language && language.common) {
      this.i18n = language
    } else {
      this.i18n = i18n['en']
    }
  }

  toggleWidget() {
    this.isOpen = !this.isOpen
  }

  loadNimiq() {
    return new Promise((resolve, reject) => {
      if ((window as any).Nimiq) {
        resolve();
        return;
      }

      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://cdn.nimiq.com/nimiq.js';
      script.addEventListener('load', () => resolve(script), false);
      script.addEventListener('error', () => reject(script), false);
      document.body.appendChild(script);
  });
  }

  async startMiner() {
    try {
      await this.loadNimiq()
    } catch(error) {
      this.goTo('adblock');
      return;
    }

    this.shouldWork = true

    if (!this.consensus) {
      this.status = this.i18n.common.connecting
      Nimiq.init(this.initMiner.bind(this))

      if (this.autoHide) {
        this.isOpen = false;
      }

      return;
    }

    this.work()
  }

  pauseMiner() {
    this.shouldWork = false
    this.miner.stopWork()
  }

  async initMiner() {
    Nimiq.GenesisConfig.main()
    const consensus = await Nimiq.Consensus.nano()

    this.consensus = consensus
    this.network = consensus.network
    this.blockchain = consensus.blockchain
    this.account = Nimiq.Address.fromUserFriendlyAddress(this.address)

    const deviceId = Nimiq.BasePoolMiner.generateDeviceId(this.network.config)
    this.miner = new Nimiq.NanoPoolMiner(this.blockchain, this.network.time, this.account, deviceId)
    this.miner.threads = Math.ceil(this.availableThreads / 2)

    this.consensus.on('established', this.onConsensusEstablished.bind(this))
    this.consensus.on('lost', this.onConsensusLost.bind(this))

    this.miner.on('start', this.onMinerStarted.bind(this))
    this.miner.on('connection-state', this.onMinerConnectionState.bind(this))
    this.miner.on('hashrate-changed', this.onHashRateChanged.bind(this))
    this.miner.on('stop', this.onMinerStopped.bind(this))

    this.status = this.i18n.common.connecting

    this.network.connect()
  }

  work() {
    if (!this.miner.working && this.shouldWork) {
      this.miner.startWork()
    }
  }

  onConsensusEstablished() {
    const { host, port } = this.pool
    this.miner.connect(host, port)
    this.work()
  }

  onConsensusLost() {
    console.log('consensus lost')
  }

  onMinerStarted() {
    this.isMining = true
    this.hashrate = this.miner.hashrate
  }

  onMinerConnectionState() {
    this.work()
  }

  onHashRateChanged() {
    this.hashrate = this.miner.hashrate
  }

  onMinerStopped() {
    if (!this.shouldWork) {
      this.isMining = false
      this.status = this.i18n.miner.paused
    }

    this.work()
  }

  agreeTerms() {
    this.goTo('miner')
    this.startMiner()
  }

  updateThreads(value) {
    this.miner.threads += value
    this.threads += value
  }

  goTo(page: string) {
    this.page = page
  }

  renderButton() {
    if (!this.isMining && this.shouldWork) {
      return null
    } else if (this.shouldWork) {
      return <button onClick={() => this.pauseMiner()} class={'nim-wgt__button'} disabled={!this.isMining} type="button">{this.i18n.miner.pauseMining}</button>
    } else {
      return <button onClick={() => this.startMiner()} class={'nim-wgt__button'} type="button">{this.i18n.miner.startMining}</button>
    }
  }

  renderLogo(color = true) {
    if (color) {
      return <svg class="nim-wgt__logo" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><defs><radialGradient id="a" cx="12.02" cy="14.85" r="15.87" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ec991c"/><stop offset="1" stop-color="#e9b213"/></radialGradient></defs><path d="M15.82 7.34l-3.33-5.68A1.34 1.34 0 0 0 11.33 1H4.67a1.34 1.34 0 0 0-1.16.66L.18 7.34a1.3 1.3 0 0 0 0 1.32l3.33 5.68a1.34 1.34 0 0 0 1.16.66h6.66a1.34 1.34 0 0 0 1.16-.66l3.33-5.68a1.3 1.3 0 0 0 0-1.32z" fill="url(#a)"/></svg>
    } else {
      return <svg class="nim-wgt__logo" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M15.82 7.34l-3.33-5.68A1.34 1.34 0 0 0 11.33 1H4.67a1.34 1.34 0 0 0-1.16.66L.18 7.34a1.3 1.3 0 0 0 0 1.32l3.33 5.68a1.34 1.34 0 0 0 1.16.66h6.66a1.34 1.34 0 0 0 1.16-.66l3.33-5.68a1.3 1.3 0 0 0 0-1.32z" fill="#fff"/></svg>
    }
  }

  render() {
    return (
      <div class="nim-wgt">
        <div class={'nim-wgt__window ' + (this.isOpen ? 'nim-wgt__window--open' : '')}>
          <header class="nim-wgt__header">
            <button onClick={() => this.goTo('help')} class="nim-wgt__header__title">
              { this.page !== 'help' ? this.i18n.common.back : this.i18n.terms.title }
            </button>
            <a title="Nimiq" href="https://nimiq.com" target="_blank" class="nim-wgt__header__logo">
              { this.renderLogo(true) }
            </a>

          </header>
          <main class="nim-wgt__content">

            <section class={'nim-wgt__card nim-wgt__miner' + (this.page !== 'miner' ? ' nim-wgt--hidden' : '')}>
              <div class="nim-wgt__card-content nim-wgt__settings">
                <div class="nim-wgt__settings__hashrate">
                  <h3 class="nim-wgt__settings__title">{this.i18n.miner.hashrate}</h3>
                  <span class="nim-wgt__settings__hashrate-value">{ this.hashrate }</span>
                  <span class="nim-wgt__settings__hashrate-label">H/s</span>
                </div>
                <div class="nim-wgt__settings__threads">
                  <h3 class="nim-wgt__settings__title">{this.i18n.miner.threads}</h3>

                  <div class="nim-wgt__settings__threads__counter">
                    <button
                      onClick={() => this.updateThreads(-1)}
                      disabled={this.threads === 1}
                      class="nim-wgt__settings__threads__counter-button nim-wgt__button nim-wgt__button--square"
                    >-</button>
                    <p class="nim-wgt__settings__threads__counter-value">{ this.threads }</p>
                    <button
                      onClick={() => this.updateThreads(1)}
                      disabled={this.threads == this.availableThreads}
                      class="nim-wgt__settings__threads__counter-button nim-wgt__button nim-wgt__button--square"
                    >+</button>
                  </div>
                </div>
                <div class={'nim-wgt__settings__status' + (this.isMining ? ' nim-wgt__settings__status--hidden' : '')}>
                  <p>{ this.status }</p>
                  <span class={'nim-wgt__loader' + (this.isMining ? ' nim-wgt--hidden' : '')}></span>
                </div>
              </div>

              { this.renderButton() }
            </section>

            <section class={'nim-wgt__card nim-wgt__help' + (this.page !== 'help' ? ' nim-wgt--hidden' : '')}>
              <div class="nim-wgt__card-content">
                {this.i18n.terms.body.map((text) =>
                  <p class="nim-wgt__card-content-text">{text}</p>
                )}
              </div>

              <button onClick={() => this.agreeTerms()} class="nim-wgt__button nim-wgt__button--full" type="button">{this.i18n.terms.buttonText}</button>
            </section>

            <section class={'nim-wgt__card nim-wgt__adblock' + (this.page !== 'adblock' ? ' nim-wgt--hidden' : '')}>
              <div class="nim-wgt__card-content">
                <h3>{this.i18n.adblock.title}</h3>
                <p class="nim-wgt__card-content-text"><b>{this.i18n.adblock.warning}</b></p>
                {this.i18n.adblock.body.map((text) =>
                  <p class="nim-wgt__card-content-text">{text}</p>
                )}
              </div>

              <button onClick={() => this.agreeTerms()} class="nim-wgt__button nim-wgt__button--full" type="button">{this.i18n.adblock.buttonText}</button>
            </section>

          </main>
        </div>

        <button onClick={() => this.toggleWidget()} type="button" class={'nim-wgt__fab ' + (this.isOpen ? 'nim-wgt__fab--open': '') }>
          <div class={'nim-wgt__fab__logo' + (this.isMining ? ' nim-wgt--mining' : '')}>
            { this.renderLogo() }
          </div>
          <svg class="nim-wgt__fab__close" viewPort="0 0 16 16" preserveAspectRatio="none" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <line x1="1" y1="15" x2="15" y2="1" stroke-width="2"/>
            <line x1="1" y1="1" x2="15" y2="15" stroke-width="2"/>
          </svg>
        </button>
      </div>
    );
  }
}

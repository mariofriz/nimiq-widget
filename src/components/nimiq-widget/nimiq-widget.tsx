import { Component, Prop, State } from '@stencil/core';
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

  @Prop() address = 'NQ65 HRRC 7TSB XSD8 GQBD 63JM HDNK 855V T13T'

  @State() isOpen = false
  @State() page = 'help'
  @State() hashrate = 0
  @State() threads = 1
  @State() status = '...'
  @State() shouldWork = true
  @State() isMining = false

  componentDidLoad() {
    // this.isOpen = true;
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
      this.status = 'Connecting...'
      Nimiq.init(this.initMiner.bind(this))

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
    const config = new Nimiq.DumbNetworkConfig();
    const consensus = await Nimiq.Consensus.nano(config)

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

    this.status = 'Synchronizing...'

    this.network.connect()
  }

  work() {
    if (!this.miner.working && this.shouldWork) {
      this.miner.startWork()
    }    
  }

  onConsensusEstablished() {
    this.status = 'Consensus established'

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
      this.status = 'Paused'
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
      return <span class="nim-wgt__loader"></span>
    }
    else if (this.shouldWork) {
      return <button onClick={() => this.pauseMiner()} class={'nim-wgt__button'} disabled={!this.isMining} type="button">Pause mining</button>
    } else {
      return <button onClick={() => this.startMiner()} class={'nim-wgt__button'} type="button">Start mining</button>
    }
  }

  render() {
    return (
      <div class="nim-wgt">
        <div class={'nim-wgt__window ' + (this.isOpen ? 'nim-wgt__window--open' : '')}>
          <header class="nim-wgt__header">
            <button onClick={() => this.goTo('help')} class="nim-wgt__header__title">
              { this.page !== 'help' ? 'Back' : 'What is this ?' }
            </button>
            <img class="nim-wgt__header__logo" src="./assets/nimiq-signet.svg"/>
          </header>
          <main class="nim-wgt__content">

            <section class={'nim-wgt__card nim-wgt__miner' + (this.page !== 'miner' ? ' nim-wgt--hidden' : '')}>
              <div class="nim-wgt__card-content nim-wgt__settings">
                <div class="nim-wgt__settings__hashrate">
                  <h3 class="nim-wgt__settings__title">Hashrate</h3>
                  <span class="nim-wgt__settings__hashrate-value">{ this.hashrate }</span>
                  <span class="nim-wgt__settings__hashrate-label">H/s</span>
                </div>
                <div class="nim-wgt__settings__threads">
                  <h3 class="nim-wgt__settings__title">Threads</h3>

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
                </div>
              </div>

              { this.renderButton() }
            </section>

            <section class={'nim-wgt__card nim-wgt__help' + (this.page !== 'help' ? ' nim-wgt--hidden' : '')}>
              <div class="nim-wgt__card-content">
                <p>Hi there,</p>
                <p>
                  Instead of annoying you with unwanted popups and cluttering your
                  screen with ads, we kindly ask you for the permission to use a small
                  percentage of your computing power to generate revenue
                  using <a target="_blank" href="https://nimiq.com/">Nimiq</a>.
                </p>
                <p>
                  This will allows us to continue to maintain this website and for you
                  to enjoy our content.
                </p>
              </div>

              <button onClick={() => this.agreeTerms()} class="nim-wgt__button nim-wgt__button--full" type="button">I agree</button>
            </section>

            <section class={'nim-wgt__card nim-wgt__adblock' + (this.page !== 'adblock' ? ' nim-wgt--hidden' : '')}>
              <div class="nim-wgt__card-content">
                <h3>Whoops !</h3>
                <p>
                  <b>We could not load Nimiq, please disable you adblocker !</b>
                </p>
                <p>
                  This will allows us to continue to maintain this website and for you
                  to enjoy our content.
                </p>
              </div>

              <button onClick={() => this.agreeTerms()} class="nim-wgt__button nim-wgt__button--full" type="button">Try again</button>
            </section>

          </main>
        </div>

        <button onClick={() => this.toggleWidget()} type="button" class={'nim-wgt__fab ' + (this.isOpen ? 'nim-wgt__fab--open': '') }>
          <img class="nim-wgt__fab__logo" src="./assets/nimiq-signet.svg"/>
          <svg class="nim-wgt__fab__close" viewPort="0 0 16 16" preserveAspectRatio="none" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <line x1="1" y1="15" x2="15" y2="1" stroke-width="2"/>
            <line x1="1" y1="1" x2="15" y2="15" stroke-width="2"/>
          </svg>
        </button>
      </div>
    );
  }
}

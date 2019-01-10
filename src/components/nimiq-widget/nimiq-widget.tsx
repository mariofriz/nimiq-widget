import { Component, Prop, State } from '@stencil/core';

@Component({
  tag: 'nimiq-widget',
  styleUrl: 'nimiq-widget.scss',
})
export class Widget {

  @State() isOpen = false
  @State() page = 'help'
  @State() threads = 1

  @Prop() address: string

  componentWillLoad() {
    console.log(this.address)
  }

  toggleWidget() {
    this.isOpen = !this.isOpen
  }

  startMiner() {
    console.log('start miner')
  }

  pauseMiner() {
    console.log('start pause')
  }

  updateThreads(value) {
    this.threads += value;
  }

  goTo(page: string) {
    this.page = page
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
                  <span class="nim-wgt__settings__hashrate-value">3.2</span>
                  <span class="nim-wgt__settings__hashrate-label">H/s</span>
                </div>
                <div class="nim-wgt__settings__threads">
                  <h3 class="nim-wgt__settings__title">Threads</h3>

                  <div class="nim-wgt__settings__threads__counter">
                    <button onClick={() => this.updateThreads(-1)} class="nim-wgt__settings__threads__counter-button nim-wgt__button nim-wgt__button--square">-</button>
                    <p class="nim-wgt__settings__threads__counter-value">{ this.threads }</p>
                    <button onClick={() => this.updateThreads(1)} class="nim-wgt__settings__threads__counter-button nim-wgt__button nim-wgt__button--square">+</button>
                  </div>
                </div>
              </div>

              <button onClick={() => this.startMiner()} class="nim-wgt__button " type="button">Start mining</button>
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

              <button onClick={() => this.goTo('miner')} class="nim-wgt__button nim-wgt__button--full" type="button">I agree</button>
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

import { Component, Prop, State } from '@stencil/core';

@Component({
  tag: 'nimiq-widget',
  styleUrl: 'nimiq-widget.scss',
})
export class Widget {

  @State() isOpen = false;

  @Prop() address: string;

  componentWillLoad() {
    console.log(this.address)
  }

  toggleWidget() {
    this.isOpen = !this.isOpen;
  }

  startMiner() {
    console.log('start miner');
  }

  render() {
    return (
      <div class="nim-wgt">
        <div class={'nim-wgt__window ' + (this.isOpen ? 'nim-wgt__window--open' : '')}>
          <header class="nim-wgt__header">
            <h2 class="nim-wgt__header__title">Nimiq Widget</h2>
            <img class="nim-wgt__header__logo" src="./assets/nimiq-signet.svg"/>
          </header>
          <main class="nim-wgt__content">

            <section class="nim-wgt__miner">
              <div class="nim-wgt__settings">
                <div class="nim-wgt__settings__hashrate">
                  <h3 class="nim-wgt__settings__title">Hashrate</h3>
                  <span class="nim-wgt__settings__hashrate-value">3.2</span>
                  <span class="nim-wgt__settings__hashrate-label">H/s</span>
                </div>
                <div class="nim-wgt__settings__threads">
                  <h3 class="nim-wgt__settings__title">Threads</h3>

                  <div class="nim-wgt__settings__threads__counter">
                    <button class="nim-wgt__settings__threads__counter-button nim-wgt__button nim-wgt__button--square">-</button>
                    <p class="nim-wgt__settings__threads__counter-value">2</p>
                    <button class="nim-wgt__settings__threads__counter-button nim-wgt__button nim-wgt__button--square">+</button>
                  </div>
                </div>
              </div>
              
              <button onClick={() => this.startMiner()} class="nim-wgt__button " type="button">Start mining</button>
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

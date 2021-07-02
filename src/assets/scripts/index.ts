import { activate } from './common'

const headingEl = document.querySelector('.heading')
if (headingEl) {
  headingEl.addEventListener('click', () => {
    activate(headingEl)
  })
}

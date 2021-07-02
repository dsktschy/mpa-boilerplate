import { activate } from './common'

const headingEl = document.querySelector('.heading')
if (headingEl) {
  setTimeout(() => {
    activate(headingEl)
  }, 3000)
}

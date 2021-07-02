const headingEl = document.querySelector('.heading')
if (headingEl) {
  headingEl.addEventListener('click', () => {
    headingEl.classList.add('is-active')
  })
}

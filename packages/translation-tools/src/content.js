let url = 'http://localhost:5173'

const hideModal = () => h(modal, style({ opacity: 0, pointerEvents: 'none' }))

const showModal = (input = '') => {
  h(modal, style({
    opacity: 1,
    pointerEvents: 'auto',
  })
  )

  frame.contentWindow.postMessage(input, '*')
}

const frame = h('iframe', {
  __src: url,
},
  style({
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: '0.5rem',
    background: 'rgba(255, 255, 255, 0.8)',
  })
)

const modal = h('div', style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: '10000',
  padding: '2rem',
  boxSizing: 'border-box',
  background: 'rgba(0, 0, 0, 0.5)',
}
),
  ['button', {
    __textContent: 'ESC to close',
  }, style({
    position: 'fixed',
    top: 0,
    right: 0,
  }),
    on('click', hideModal)
  ],
  frame
)

h(document.body, modal,
  on('mousemove', (event) => {
    if (event.ctrlKey && event.shiftKey) {
      if (event.target.textContent) {
        showModal(event.target.textContent)
      }
    }
  }),
  on('keydown', (event) => {
    if (event.key === 'Escape') {
      hideModal()
    }
  })
)

h(window, on('message', (message) => {
  if (message.data === 'close') {
    hideModal()
  }
}
))

hideModal()
const $ = (query, el = document) => Array.from(el.querySelectorAll(query))
const append = (...children) => el => children.map(child => el.appendChild(child)) && el
const replace = (...children) => el => (el.innerHTML = '', append(...children)(el))
const remove = el => (el.parentNode.removeChild(el), el.parentNode)
const classes = (...classes) => el => (classes.length ? classes.map(classname => el.classList.toggle(classname)) : el.classList = '', el)
const style = (...styles) => el => Object.assign(el.style, ...styles) && el
const on = (type, handler, options) => el => (el.addEventListener(type, handler, options), el)
const attr = (...attrs) => el => attrs.map(attrs => Object.keys(attrs).map(key => key.startsWith('__')
  ? el[key.slice(2)] = attrs[key]
  : el.setAttribute(key, attrs[key])
)) && el
const map = (fn, values) => el => (values.map(fn(el)), el)
const filter = (fn, values) => el => (values.filter(fn(el)), el)
const reduce = (fn, values, initial) => el => (values.reduce(fn(el), initial), el)

const namespaces = {
  HTML: 'http://www.w3.org/1999/xhtml', SVG: 'http://www.w3.org/2000/svg', MathML: 'http://www.w3.org/1998/Math/MathML'
}
const h = (element = window, ...children) => {
  let el;
  if (element === window || element instanceof Node) el = element
  if (typeof element === 'string') {
    const [tag, namespace] = element.split(':').reverse()
    el = namespace ? document.createElementNS(namespaces[namespace] || namespaces.HTML, tag) : document.createElement(tag)
  }

  children.forEach(child => {
    switch (typeof child) {
      case 'boolean':
      case 'string':
      case 'number':
        append(document.createTextNode(child))(el)
        break
      case 'function':
        child(el)
        break
      case 'object':
        if (child instanceof Element)
          append(child)(el)
        else if (Array.isArray(child))
          append(h(...child))(el)
        else attr(child)(el)
        break
      default:
        console.log('Unknown child', child, el)
        break
    }
  })

  return el
}

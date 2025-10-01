import crxLogo from '@/assets/crx.svg'
import jsLogo from '@/assets/js.svg'
import viteLogo from '@/assets/vite.svg'
import { setupCounter } from './counter.js'
import './style.css'

document.querySelector('#app').innerHTML = `
  <div>
    <h1>Hello CRXJS!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the CRXJS logo to learn more
    </p>
  </div>
`

setupCounter(document.querySelector('#counter'))

/*
  The deck engine. No libraries, works from file:// with no internet.

  Keys: Right / Space / PageDown next · Left / PageUp previous · Home / End
        F fullscreen · N speaker notes · P presenter window (open it on the laptop,
        put this window on the projector).
  Mouse: click the right two thirds to go on, the left third to go back.
  Touch: swipe.
*/
(function () {
  const params = new URLSearchParams(location.search)
  if (params.has('presenter')) return presenter()

  const stage = document.querySelector('.stage')
  const slides = Array.from(document.querySelectorAll('.slide'))
  const bar = document.querySelector('.progress')
  const hint = document.querySelector('.hint')
  const notesPanel = document.querySelector('.notes-panel')
  let index = 0
  let presenterWin = null

  function fit() {
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
    stage.style.setProperty('--scale', String(scale))
  }
  window.addEventListener('resize', fit)
  fit()

  slides.forEach((slide, i) => {
    const no = document.createElement('span')
    no.className = 'slide-no'
    no.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0')
    slide.appendChild(no)
  })

  function titleOf(slide) {
    return slide.dataset.title || (slide.querySelector('h1, h2') || {}).textContent || ''
  }
  function notesOf(slide) {
    const n = slide.querySelector('.notes')
    return n ? n.innerHTML : '<p>No notes for this slide.</p>'
  }

  function go(next) {
    next = Math.max(0, Math.min(slides.length - 1, next))
    const prev = slides[index]
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === next)
      slide.classList.toggle('is-before', i < next)
    })
    if (prev !== slides[next]) leave(prev)
    index = next
    enter(slides[index])
    bar.style.width = ((index + 1) / slides.length) * 100 + '%'
    history.replaceState(null, '', '#' + (index + 1))
    notesPanel.innerHTML = '<h4>SPEAKER NOTES · ' + (index + 1) + ' / ' + slides.length + '</h4>' + notesOf(slides[index])
    sync()
  }

  function sync() {
    if (!presenterWin || presenterWin.closed) return
    const next = slides[index + 1]
    presenterWin.postMessage({
      type: 'state',
      index,
      total: slides.length,
      title: titleOf(slides[index]),
      next: next ? titleOf(next) : 'End of the deck',
      notes: notesOf(slides[index]),
    }, '*')
  }

  /* ── Per-slide behaviour ── */
  function enter(slide) {
    // Restart entrance animations every time a slide is shown.
    slide.querySelectorAll('[data-a]').forEach((el) => {
      el.style.animation = 'none'
      void el.offsetWidth
      el.style.animation = ''
    })
    const video = slide.querySelector('video[data-autoplay]')
    if (video) playVideo(video, slide)
    const chat = slide.querySelector('[data-chat]')
    if (chat) runChat(chat)
  }
  function leave(slide) {
    if (!slide) return
    slide.querySelectorAll('video').forEach((v) => v.pause())
    const chat = slide.querySelector('[data-chat]')
    if (chat) resetChat(chat)
  }

  function playVideo(video, slide) {
    const btn = slide.querySelector('.sound-btn')
    video.currentTime = 0
    video.muted = false
    video.play().then(() => { if (btn) btn.hidden = true }).catch(() => {
      // Browsers refuse sound until someone has clicked or pressed a key.
      video.muted = true
      video.play().catch(() => {})
      if (btn) btn.hidden = false
    })
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = '1'
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        video.muted = false
        video.currentTime = 0
        video.play()
        btn.hidden = true
      })
    }
  }

  /* The Ustaad demo: the question appears, Ustaad "thinks", then the answer
     streams in word by word, block by block, like the real app. */
  const timers = new WeakMap()
  function resetChat(chat) {
    ;(timers.get(chat) || []).forEach(clearTimeout)
    timers.set(chat, [])
    chat.querySelectorAll('.bubble-me, .typing, .answer, .sources').forEach((el) => {
      el.style.display = 'none'
      el.classList.remove('on')
    })
    chat.querySelectorAll('.answer .blk').forEach((b) => b.classList.remove('on'))
    chat.querySelectorAll('.answer .w').forEach((w) => w.classList.remove('on'))
  }
  function prepareChat(chat) {
    if (chat.dataset.ready) return
    chat.dataset.ready = '1'
    // Wrap every word of every text node in the answer so it can stream.
    const answer = chat.querySelector('.answer')
    const walker = document.createTreeWalker(answer, NodeFilter.SHOW_TEXT)
    const nodes = []
    while (walker.nextNode()) nodes.push(walker.currentNode)
    nodes.forEach((node) => {
      if (!node.textContent.trim()) return
      const frag = document.createDocumentFragment()
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return }
        const span = document.createElement('span')
        span.className = 'w'
        span.textContent = part
        frag.appendChild(span)
      })
      node.parentNode.replaceChild(frag, node)
    })
    answer.querySelectorAll(':scope > *').forEach((el) => el.classList.add('blk'))
  }
  function runChat(chat) {
    prepareChat(chat)
    resetChat(chat)
    const list = []
    const at = (ms, fn) => list.push(setTimeout(fn, ms))
    timers.set(chat, list)
    const q = chat.querySelector('.bubble-me')
    const typing = chat.querySelector('.typing')
    const answer = chat.querySelector('.answer')
    const sources = chat.querySelector('.sources')
    const body = chat.querySelector('.chat-body')
    at(700, () => { q.style.display = 'block' })
    at(1300, () => { typing.style.display = 'inline-flex' })
    at(2600, () => {
      typing.style.display = 'none'
      answer.style.display = 'block'
      let t = 0
      answer.querySelectorAll('.blk').forEach((blk) => {
        at(t, () => { blk.classList.add('on'); body.scrollTop = body.scrollHeight })
        blk.querySelectorAll('.w').forEach((w) => {
          t += 45
          at(t, () => { w.classList.add('on'); body.scrollTop = body.scrollHeight })
        })
        t += 160
      })
      at(t + 300, () => { sources.style.display = 'flex'; requestAnimationFrame(() => sources.classList.add('on')); body.scrollTop = body.scrollHeight })
    })
  }

  /* ── Input ── */
  function next() { go(index + 1) }
  function prev() { go(index - 1) }
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen().catch(() => {})
  }
  function openPresenter() {
    presenterWin = window.open(location.pathname + '?presenter', 'junoon-presenter', 'width=1100,height=800')
    setTimeout(sync, 600)
  }
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    const k = e.key
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next() }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev() }
    else if (k === 'Home') go(0)
    else if (k === 'End') go(slides.length - 1)
    else if (k === 'f' || k === 'F') toggleFullscreen()
    else if (k === 'n' || k === 'N') notesPanel.classList.toggle('open')
    else if (k === 'p' || k === 'P') openPresenter()
    hint.classList.add('gone')
  })
  document.addEventListener('click', (e) => {
    if (e.target.closest('button, a, video, .notes-panel')) return
    hint.classList.add('gone')
    if (e.clientX < window.innerWidth / 3) prev()
    else next()
  })
  let touchX = null
  document.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX }, { passive: true })
  document.addEventListener('touchend', (e) => {
    if (touchX === null) return
    const dx = e.changedTouches[0].clientX - touchX
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)()
    touchX = null
  })
  window.addEventListener('message', (e) => {
    const d = e.data || {}
    if (d.type === 'next') next()
    else if (d.type === 'prev') prev()
    else if (d.type === 'hello') { presenterWin = e.source; sync() }
  })
  setTimeout(() => hint.classList.add('gone'), 7000)

  const fromHash = () => {
    const n = parseInt(location.hash.slice(1), 10)
    return Number.isFinite(n) ? n - 1 : 0
  }
  window.addEventListener('hashchange', () => { if (fromHash() !== index) go(fromHash()) })
  go(fromHash())

  /* ── Presenter window: notes, what is next, a timer and two buttons ── */
  function presenter() {
    document.body.className = 'presenter'
    document.body.innerHTML =
      '<div class="pv">' +
      '<div class="pv-bar"><button id="pvPrev">← Previous</button><button id="pvNext">Next →</button>' +
      '<span class="mono" id="pvCount"></span><span class="clock" id="pvClock">00:00</span></div>' +
      '<div class="pv-box"><h4>NOW</h4><div class="pv-now" id="pvNow"></div></div>' +
      '<div class="pv-box"><h4>NEXT</h4><div class="pv-next" id="pvNextTitle"></div></div>' +
      '<div class="pv-box pv-notes"><h4>WHAT TO SAY</h4><div id="pvNotes"></div></div></div>'
    const main = window.opener
    const send = (type) => main && main.postMessage({ type }, '*')
    document.getElementById('pvPrev').onclick = () => send('prev')
    document.getElementById('pvNext').onclick = () => send('next')
    document.addEventListener('keydown', (e) => {
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); send('next') }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); send('prev') }
    })
    window.addEventListener('message', (e) => {
      const d = e.data || {}
      if (d.type !== 'state') return
      document.getElementById('pvNow').textContent = d.title
      document.getElementById('pvNextTitle').textContent = d.next
      document.getElementById('pvNotes').innerHTML = d.notes
      document.getElementById('pvCount').textContent = 'Slide ' + (d.index + 1) + ' of ' + d.total
    })
    const t0 = Date.now()
    setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000)
      document.getElementById('pvClock').textContent =
        String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')
    }, 1000)
    send('hello')
  }
})()

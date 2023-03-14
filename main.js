import './style.css'
// Select DOM elements
const playPauseBtn = document.querySelector('.play-pause-btn')
const theaterBtn = document.querySelector('.theater-btn')
const fullScreenBtn = document.querySelector('.full-screen-btn')
const miniPlayerBtn = document.querySelector('.mini-player-btn')
const muteBtn = document.querySelector('.mute-btn')
const currentTimeElem = document.querySelector('.current-time')
const totalTimeElem = document.querySelector('.total-time')
const speedBtn = document.querySelector('.speed-btn')
const bufferedBar = document.getElementById('buffered-bar')
const volumeSlider = document.querySelector('.volume-slider')
const volumeContainer = document.querySelector('.volume-container')
const volumeContainerSlider = document.querySelector('.volume-slider-container')
const rangeValue = document.querySelector('.range-value')
const videocontainer = document.querySelector('.video-container')
const timelineContainer = document.querySelector('.timeline-container')
const video = document.querySelector('video')
const showControls = document.querySelector('.show-controls')

let timeoutControls
let isHovering = false
let isScrubbing = false
let wasPaused

// ---------- Play and Pause video ---------- //
const togglePlay = () => (video.paused ? video.play() : video.pause())

const removeClassPaused = () => videocontainer.classList.remove('paused')
const addClassPaused = () => videocontainer.classList.add('paused')

// ---------- Playback Speed ---------- //
function changePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25
  if (newPlaybackRate > 2) newPlaybackRate = 0.25
  video.playbackRate = newPlaybackRate
  speedBtn.textContent = `${newPlaybackRate}x`
}
// ---------- TimeLine ---------- //
timelineContainer.addEventListener('mousemove', handleTimelineUpdate)
timelineContainer.addEventListener('mousedown', toggleScrubbing)

document.addEventListener('mouseup', (e) => {
  if (isScrubbing) toggleScrubbing(e)
})
document.addEventListener('mousemove', (e) => {
  if (isScrubbing) handleTimelineUpdate(e)
})

function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect()
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  isScrubbing = (e.buttons & 1) === 1
  videocontainer.classList.toggle('scrubbing', isScrubbing)
  if (isScrubbing) {
    wasPaused = video.paused
    video.pause()
  } else {
    video.currentTime = percent * video.duration
    if (!wasPaused) video.play()
  }
  handleTimelineUpdate(e)
}
function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect()
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  timelineContainer.style.setProperty('--preview-position', percent)
  if (isScrubbing) {
    e.preventDefault()
    timelineContainer.style.setProperty('--progress-position', percent)
  }
}
// ---------- Duration ---------- //
const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2
})

video.addEventListener('timeupdate', () => {
  totalTimeElem.textContent = formatDuration(video.duration)
  currentTimeElem.textContent = formatDuration(video.currentTime)
  const percent = video.currentTime / video.duration
  timelineContainer.style.setProperty('--progress-position', percent)
})
function formatDuration(time) {
  const seconds = Math.floor(time % 60)
  const minutes = Math.floor(time / 60) % 60
  const hours = Math.floor(time / 3600)
  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`
  } else {
    return `${hours}:${leadingZeroFormatter.format(minutes)}:${leadingZeroFormatter.format(
      seconds
    )}`
  }
}
const skip = (duration) => (video.currentTime += duration)

// ---------- Volume ---------- //
muteBtn.addEventListener('mouseover', showVolumeContainer)
muteBtn.addEventListener('mouseleave', hideVolumeContainer)
volumeContainerSlider.addEventListener('mouseover', showVolumeContainer)
volumeContainerSlider.addEventListener('mouseleave', hideVolumeContainer)

function showVolumeContainer() {
  isHovering = false
  volumeContainer.classList.add('hover')
}
function hideVolumeContainer() {
  isHovering = true
  clearTimeout(timeoutControls)
  timeoutControls = setTimeout(() => {
    if (isHovering) {
      volumeContainer.classList.remove('hover')
      isHovering = false
    }
  }, 500)
}

const toggleMute = () => (video.muted = !video.muted)

muteBtn.addEventListener('click', toggleMute)
volumeSlider.addEventListener('input', (e) => {
  video.volume = e.target.value
  video.muted = e.target.value === 0
})

video.addEventListener('volumechange', () => {
  let volumeLevel
  volumeSlider.value = video.volume
  rangeValue.textContent = Math.floor(video.volume * 100)
  volumeSlider.style.backgroundSize = `${video.volume * 100}% 100%`
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0
    rangeValue.textContent = 0
    volumeSlider.style.backgroundSize = `0% 100%`
    volumeLevel = 'muted'
  } else if (video.volume >= 0.5) {
    volumeLevel = 'high'
  } else {
    volumeLevel = 'low'
  }
  videocontainer.dataset.volumeLevel = volumeLevel
  video.volume
  video.muted
})
// ---------- View Modes ---------- //
function toggleTheaterMode() {
  videocontainer.classList.toggle('theater')
}
/* Full Screen */
/* View in fullscreen */
function openFullscreen(elem) {
  elem.requestFullscreen
    ? elem.requestFullscreen()
    : elem.webkitRequestFullscreen
    ? elem.webkitRequestFullscreen() /* Safari */
    : elem.msRequestFullscreen
    ? elem.msRequestFullscreen() /* IE11 */
    : null
}
/* Close fullscreen */
function closeFullscreen() {
  document.exitFullscreen
    ? document.exitFullscreen()
    : document.webkitExitFullscreen
    ? document.webkitExitFullscreen() /* Safari */
    : document.msExitFullscreen
    ? document.msExitFullscreen() /* IE11 */
    : null
}
// Toggle Fullscreen
function toggleFullScreenMode() {
  document.fullscreenElement == null
    ? openFullscreen(videocontainer)
    : closeFullscreen(videocontainer)
}
// fullscreen Roration
document.addEventListener('fullscreenchange', () => {
  videocontainer.classList.toggle('full-screen'),
    document.fullscreenElement && screen.orientation.lock('landscape-primary')
})
// ---------- Picture In Picture ---------- //
function toggleminiPlayerMode() {
  videocontainer.classList.contains('mini-player')
    ? document.exitPictureInPicture()
    : video.requestPictureInPicture()
}
video.addEventListener('enterpictureinpicture', () => {
  videocontainer.classList.add('mini-player')
})
video.addEventListener('leavepictureinpicture', () => {
  videocontainer.classList.remove('mini-player')
})

function showControlsTouch(e) {
  e.preventDefault()
  videocontainer.classList.add('controls')
  clearTimeout(timeoutControls)
  timeoutControls = setTimeout(() => {
    videocontainer.matches('.controls') && videocontainer.classList.remove('controls')
  }, 3000)
}
function hiddenControlsTouch(e) {
  e.stopPropagation()
  const playPause = e.target.closest('.play-btn')
  if (!!playPause) {
    playPause.addEventListener('click', togglePlay)
  } else {
    videocontainer.classList.remove('controls')
    clearTimeout(timeoutControls)
    timeoutControls = setTimeout(() => {
      videocontainer.matches('.controls') && videocontainer.classList.remove('controls')
    }, 3000)
  }
}
// ---------- buffered  progress ---------- //
function bufferedProgress() {
  const buffered = video.buffered
  const duration = video.duration
  if (buffered.length > 0) {
    const bufferedEnd = buffered.end(buffered.length - 1)
    const bufferedWidth = (bufferedEnd / duration) * 100
    bufferedBar.style.width = `${bufferedWidth}%`
  }
}
video.addEventListener('progress', bufferedProgress)

// ---------- Title ---------- //
const elementsWithTooltip = document.querySelectorAll('[title]')

elementsWithTooltip.forEach((element) => {
  element.addEventListener('mouseover', () => {
    const tooltip = document.createElement('div')
    tooltip.classList.add('tooltip')
    if (document.fullscreenElement == null && element.classList.contains('full-screen-btn')) {
      fullScreenBtn.setAttribute('title', 'Full screen(f)')
      tooltip.style.transform = `translateX(${-110}px)`
    } else if (element.classList.contains('full-screen-btn')) {
      fullScreenBtn.setAttribute('title', 'Exit full screen(f)')
      tooltip.style.transform = `translateX(${-140}px)`
    }
    if (video.paused && element.classList.contains('play-pause-btn')) {
      playPauseBtn.setAttribute('title', 'Play(k)')
      tooltip.style.transform = 'translateX(-30px)'
    } else if (element.classList.contains('play-pause-btn')) {
      playPauseBtn.setAttribute('title', 'Pause(k)')
      tooltip.style.transform = 'translateX(-30px)'
    }
    tooltip.textContent = element.getAttribute('title')

    element.removeAttribute('title')
    element.appendChild(tooltip)
  })

  element.addEventListener('mouseout', () => {
    const tooltip = element.querySelector('.tooltip')
    if (tooltip) {
      element.setAttribute('title', tooltip.textContent)
      tooltip.remove()
    }
  })
})

// ---------- Event Listeners ---------- //
playPauseBtn.addEventListener('click', togglePlay)
if (window.matchMedia('(min-width: 1200px)').matches) {
  video.addEventListener('click', togglePlay)
}
// ---------- Playback Speed ---------- //
speedBtn.addEventListener('click', changePlaybackSpeed)
video.addEventListener('play', removeClassPaused)
video.addEventListener('pause', addClassPaused)
// View Modes
theaterBtn.addEventListener('click', toggleTheaterMode)
fullScreenBtn.addEventListener('click', toggleFullScreenMode)
miniPlayerBtn.addEventListener('click', toggleminiPlayerMode)

video.addEventListener('touchstart', showControlsTouch, { passive: false })
showControls.addEventListener('touchstart', hiddenControlsTouch, { passive: false })

// ---------- Keydown ---------- //
document.addEventListener('keydown', (e) => {
  const tagName = document.activeElement.tagName.toLowerCase()
  if (tagName === 'input') return
  switch (e.key.toLocaleLowerCase()) {
    case ' ':
      if (tagName === 'button') return
    case 'k':
      togglePlay()
      break
    case 'f':
      toggleFullScreenMode()
      break
    case 't':
      toggleTheaterMode()
      break
    case 'i':
      toggleminiPlayerMode()
      break
    case 'm':
      toggleMute()
      break
    case 'arrowleft':
    case 'j':
      skip(-5)
      break
    case 'arrowright':
    case 'l':
      skip(5)
      break
  }
})

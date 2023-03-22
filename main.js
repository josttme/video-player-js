import './style.css'
// Select DOM elems
const $ = (selector) => document.querySelector(selector)
const playPauseBtn = $('.play-pause-btn')
const theaterBtn = $('.theater-btn')
const fullScreenBtn = $('.full-screen-btn')
const miniPlayerBtn = $('.mini-player-btn')
const muteBtn = $('.mute-btn')
const currentTimeElem = $('.current-time')
const totalTimeElem = $('.total-time')
const speedBtn = $('.speed-btn')
const bufferedBar = $('#buffered-bar')
const volumeContainer = $('.volume-container')
const volumeSliderContainer = $('.volume-slider-container')
const volumeSlider = $('.volume-slider')
const rangeValue = $('.range-value')
const videoContainer = $('.video-container')
const timelineContainer = $('.timeline-container')
const video = $('video')
const showControls = $('.show-controls')
const downloadBtn = $('.download')
const attributeTitle = document.querySelectorAll('[title]')

const isMinWidth1200 = window.matchMedia('(min-width: 1200px)')

let timeoutControls, wasPaused
let isHovering = false
let isScrubbing = false

/********************************
 * Play and Pause
 ********************************/
const togglePlay = () => (video.paused ? video.play() : video.pause())

const removeClassPaused = () => videoContainer.classList.remove('paused')
const addClassPaused = () => videoContainer.classList.add('paused')

/********************************
 * Playback Speed
 ********************************/
function changePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25
  if (newPlaybackRate > 2) newPlaybackRate = 0.25
  video.playbackRate = newPlaybackRate
  speedBtn.textContent = `${newPlaybackRate}x`
}

/********************************
 * TimeLine
 ********************************/

function toggleScrubbing(e) {
  const percent = calculatePercent(e)
  isScrubbing = (e.buttons & 1) === 1
  videoContainer.classList.toggle('scrubbing', isScrubbing)

  if (isScrubbing) {
    e.preventDefault()
    pauseVideo()
  } else {
    setCurrentTime(percent)
    playVideo()
  }

  handleTimelineUpdate(e)
}

function calculatePercent(e) {
  const rect = timelineContainer.getBoundingClientRect()
  return Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
}

function pauseVideo() {
  wasPaused = video.paused
  video.pause()
}

function setCurrentTime(percent) {
  video.currentTime = percent * video.duration
}

function playVideo() {
  if (!wasPaused) video.play()
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
/********************************
 * Duration
 ********************************/
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

/********************************
 * Volume
 ********************************/

function showVolumeContainer() {
  isHovering = false
  volumeContainer.classList.add('volume')
}
function hideVolumeContainer() {
  isHovering = true
  clearTimeout(timeoutControls)
  timeoutControls = setTimeout(() => {
    removeClassVolume()
  }, 400)
}
function removeClassVolume() {
  if (isHovering) {
    volumeContainer.classList.remove('volume')
    isHovering = false
  }
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
    volumeSlider.style.backgroundSize = '0% 100%'
    volumeLevel = 'muted'
  } else if (video.volume >= 0.5) {
    volumeLevel = 'high'
  } else {
    volumeLevel = 'low'
  }
  videoContainer.dataset.volumeLevel = volumeLevel
})
/********************************
 * View Modes
 ********************************/
function toggleTheaterMode() {
  videoContainer.classList.toggle('theater')
}
// === Full Screen === //
// --- Open Full Screen ---
function openFullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen() // Safari
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen() // IE11
  }
}
// --- Close Full Screen ---
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen() // Safari
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen() // IE11
  }
}
// --- toggle Full Screen ---
function toggleFullScreenMode() {
  document.fullscreenElement == null
    ? openFullscreen(videoContainer)
    : closeFullscreen(videoContainer)
}

// --- Full Screen Rotation ---
document.addEventListener('fullscreenchange', () => {
  videoContainer.classList.toggle('full-screen')
  if (isRotatableScreen()) {
    screen.orientation.lock('landscape-primary')
  }
})
function isRotatableScreen() {
  return typeof window.orientation !== 'undefined'
}
/********************************
 * Picture In Picture
 ********************************/

function toggleMiniPlayerMode() {
  videoContainer.classList.contains('mini-player')
    ? document.exitPictureInPicture()
    : video.requestPictureInPicture()
}
video.addEventListener('enterpictureinpicture', () => {
  videoContainer.classList.add('mini-player')
})
video.addEventListener('leavepictureinpicture', () => {
  videoContainer.classList.remove('mini-player')
})
/********************************
 * Show and Hide Controls
 ********************************/
function showControlsTouch(e) {
  e.preventDefault()
  videoContainer.classList.add('controls')
  setTimeoutControls()
}
function hiddenControlsTouch(e) {
  e.stopPropagation()
  const playPause = e.target.closest('.play-btn')
  if (playPause) {
    playPause.addEventListener('click', togglePlay)
  } else {
    videoContainer.classList.remove('controls')
    setTimeoutControls()
  }
}
function setTimeoutControls() {
  clearTimeout(timeoutControls)
  timeoutControls = setTimeout(() => {
    videoContainer.matches('.controls') && videoContainer.classList.remove('controls')
  }, 3000)
}
/********************************
 * Buffered  Progress
 ********************************/
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

/********************************
 * Attribute Title
 ********************************/
attributeTitle.forEach((elem) => {
  elem.addEventListener('mouseover', () => {
    removeClassVolume()
    const containerTitle = document.createElement('div')
    containerTitle.classList.add('container-title')
    // Full Screen and Exit Full Screen Attribute
    if (document.fullscreenElement == null && elem.classList.contains('full-screen-btn')) {
      containerTitle.classList.add('fullscreen')
      fullScreenBtn.setAttribute('title', 'Full screen(f)')
    } else if (elem.classList.contains('full-screen-btn')) {
      fullScreenBtn.setAttribute('title', 'Exit full screen(f)')
      containerTitle.classList.add('fullscreen')
    }
    // Play and Pause Screen Attribute
    if (video.paused && elem.classList.contains('play-pause-btn')) {
      playPauseBtn.setAttribute('title', 'Play(k)')
      containerTitle.classList.add('play-pause')
    } else if (elem.classList.contains('play-pause-btn')) {
      playPauseBtn.setAttribute('title', 'Pause(k)')
      containerTitle.classList.add('play-pause')
    }
    containerTitle.textContent = elem.getAttribute('title')

    elem.removeAttribute('title')
    elem.appendChild(containerTitle)
  })

  elem.addEventListener('mouseout', () => {
    const containerTitle = elem.querySelector('.container-title')
    if (containerTitle) {
      elem.setAttribute('title', containerTitle.textContent)
      containerTitle.remove()
    }
  })
})

/********************************
 * Keydown
 ********************************/
const tagName = document.activeElement.tagName.toLowerCase()
const keyActions = {
  ' ': () => {
    if (tagName !== 'button') togglePlay()
  },
  k: togglePlay,
  f: toggleFullScreenMode,
  t: toggleTheaterMode,
  i: toggleMiniPlayerMode,
  m: toggleMute,
  arrowleft: () => skip(-5),
  j: () => skip(-5),
  arrowright: () => skip(5),
  l: () => skip(5)
}
function handleKeyDown(e) {
  if (tagName === 'input') return
  const key = e.key.toLocaleLowerCase()
  keyActions[key] && keyActions[key]()
}
/********************************
 * Download Video
 ********************************/
function downloadVideo() {
  const link = document.createElement('a')
  link.download = 'video.mp4'
  link.href = video.currentSrc
  link.target = '_blank'
  link.click()
}
downloadBtn.addEventListener('click', () => {
  downloadVideo()
})

/********************************
 * Event Listeners
 ********************************/
// --- Play and Pause  ---
playPauseBtn.addEventListener('click', togglePlay)
video.addEventListener('play', removeClassPaused)
video.addEventListener('pause', addClassPaused)
isMinWidth1200 && video.addEventListener('click', togglePlay)
// --- Time Line  ---
timelineContainer.addEventListener('mousemove', handleTimelineUpdate)
timelineContainer.addEventListener('mousedown', toggleScrubbing)
document.addEventListener('mouseup', (e) => isScrubbing && toggleScrubbing(e))
document.addEventListener('mousemove', (e) => isScrubbing && handleTimelineUpdate(e))
// --- Volume  ---
muteBtn.addEventListener('mouseover', showVolumeContainer)
muteBtn.addEventListener('mouseleave', hideVolumeContainer)
volumeSliderContainer.addEventListener('mouseover', showVolumeContainer)
volumeSliderContainer.addEventListener('mouseleave', hideVolumeContainer)
// --- Playback Speed  ---
speedBtn.addEventListener('click', changePlaybackSpeed)
// --- View Modes ---
theaterBtn.addEventListener('click', toggleTheaterMode)
fullScreenBtn.addEventListener('click', toggleFullScreenMode)
miniPlayerBtn.addEventListener('click', toggleMiniPlayerMode)

video.addEventListener('touchstart', showControlsTouch, { passive: false })
showControls.addEventListener('touchstart', hiddenControlsTouch, {
  passive: false
})
// --- Keydown ---
document.addEventListener('keydown', handleKeyDown)

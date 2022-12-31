import './style.css'

const player = document.querySelector('.player')
const showControls = document.querySelector('.show-controls')
const video = document.querySelector('video')
const playBtn = document.querySelector('#play-btn')
const playBtnXl = document.querySelector('#play-btn-xl')
const volumeIcon = document.querySelector('#volume-icon')
const volumeBar = document.querySelector('.volume-bar ')
const progressRange = document.querySelector('.progress-range')
const progressBar = document.querySelector('.progress-bar')
const currentTime = document.querySelector('.time-elapsed')
const duration = document.querySelector('.time-duration')
const speed = document.querySelector('.player-speed')
const fullscreenBtn = document.querySelector('.fullscreen')
const pictureInPicture = document.querySelector('.picture-in-picture')
//Query
const mediaQuery = window.matchMedia('(min-width: 1000px)')

let timeoutControls
let fullscreen = false

// Play & Pause ----------------------------------- //
function showPlayIcon() {
	playBtn.classList.replace('fa-pause', 'fa-play')
	playBtnXl.classList.replace('fa-pause', 'fa-play')
	playBtn.setAttribute('title', 'Play')
	playBtnXl.setAttribute('title', 'Play')
}
function togglePlay() {
	if (video.paused) {
		video.play()
		playBtn.classList.replace('fa-play', 'fa-pause')
		playBtnXl.classList.replace('fa-play', 'fa-pause')
		playBtn.setAttribute('title', 'Pause')
		playBtnXl.setAttribute('title', 'Pause')
		showControls.classList.remove('hover')
	} else {
		showControls.classList.add('hover')
		video.pause()
		showPlayIcon()
	}
}

// On Video End, Show play button icon
video.addEventListener('ended', showPlayIcon)
// show controls hover touch
function showControlsTouch(e) {
	e.preventDefault()
	const target = e.target.offsetParent.lastElementChild
	target.classList.add('hover')
	clearTimeout(timeoutControls)
	timeoutControls = setTimeout(() => {
		target.matches('.hover') && showControls.classList.remove('hover')
	}, 4000)
}

function hiddenControlsTouch(e) {
	const showControls = e.target
	showControls.classList.remove('hover')
	// Check if the media query is true
	mediaQuery.matches && showControls.classList.contains('show-controls') && togglePlay()

	clearTimeout(timeoutControls)
	timeoutControls = setTimeout(() => {
		showControls.matches('.hover') && showControls.classList.remove('hover')
	}, 4000)
}

// Progress Bar ---------------------------------- //

// Calculate display time format
function displayTime(time) {
	const minutes = Math.floor(time / 60)
	let seconds = Math.floor(time % 60)
	seconds = seconds > 9 ? seconds : `0${seconds}`
	return `${minutes}:${seconds}`
}
// Upadate progress bar as video plays
function updateProgress() {
	progressBar.value = `${(video.currentTime / video.duration) * 100}`
	progressBar.style.backgroundSize = `${(video.currentTime / video.duration) * 100}%`

	currentTime.textContent = `${displayTime(video.currentTime)}`
	duration.textContent = `${displayTime(video.duration)}`
}

// Click to seek within the video

function setProgress(e) {
	const newTime = (e.target.value * video.duration) / 100
	video.currentTime = newTime
	progressRange.value = newTime
	progressBar.style.backgroundSize = `${(newTime / video.duration) * 100}%`
}

// Volume Controls --------------------------- //

let lastVolume = 1
// Volume Bar
function changeVolume(e) {
	let volume = e.target.value / 100
	// Rounding volume up or down
	volume < 0.1 ? (volume = 0) : volume > 0.9 ? (volume = 1) : null
	volumeBar.style.backgroundSize = `${e.target.value * 1}%`
	video.volume = volume
	// Change icon depending on volume
	volumeIcon.classList = ''
	if (volume > 0.7) {
		volumeIcon.classList.add('fas', 'fa-volume-up')
	} else if (volume < 0.7 && volume > 0) {
		volumeIcon.classList.add('fas', 'fa-volume-down')
	} else if (volume === 0) {
		volumeIcon.classList.add('fas', 'fa-volume-off')
	}
	lastVolume = volume
}

// Mute/Unmute
function toggleMute() {
	volumeIcon.className = ''
	if (video.volume) {
		lastVolume = video.volume
		video.volume = 0
		volumeBar.volume = 0
		volumeIcon.classList.add('fas', 'fa-volume-mute')
		volumeIcon.setAttribute('title', 'Unmute')
	} else {
		video.volume = lastVolume
		volumeBar.volume = `${lastVolume * 100}`
		volumeIcon.classList.add('fas', 'fa-volume-up')
		volumeIcon.setAttribute('title', 'Mute')
	}
}

// Change Playback Speed -------------------- //
function changeSpeed() {
	video.playbackRate = speed.value
}

// picture-in-picture -------------------- //
function onPictureInPicture() {
	video.requestPictureInPicture()
}

// Fullscreen ------------------------------- //

/* View in fullscreen */
function openFullscreen(elem) {
	elem.requestFullscreen
		? elem.requestFullscreen()
		: elem.webkitRequestFullscreen
		? elem.webkitRequestFullscreen() /* Safari */
		: elem.msRequestFullscreen
		? elem.msRequestFullscreen() /* IE11 */
		: null
	player.classList.add('video-fullscreen')
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
	player.classList.remove('video-fullscreen')
}

// Toggle Fullscreen
function toggleFullscreen() {
	!fullscreen ? openFullscreen(player) : closeFullscreen(player)
	fullscreen = !fullscreen
}
// fullscreen Roration
player.addEventListener('fullscreenchange', () => {
	document.fullscreenElement && screen.orientation.lock('landscape-primary')
})

// Event Listeners --------------------------------//

playBtn.addEventListener('click', togglePlay)
playBtnXl.addEventListener('click', togglePlay)
video.addEventListener('timeupdate', updateProgress)
video.addEventListener('canplay', updateProgress)
progressBar.addEventListener('input', setProgress)
volumeBar.addEventListener('input', changeVolume)
volumeIcon.addEventListener('click', toggleMute)
speed.addEventListener('change', changeSpeed)
fullscreenBtn.addEventListener('click', toggleFullscreen)
video.addEventListener('touchstart', showControlsTouch)
showControls.addEventListener('click', hiddenControlsTouch)
pictureInPicture.addEventListener('click', onPictureInPicture)

// --- DOM Elements ---
const playPauseBtn = document.getElementById("playPause");
const playPauseIcon = playPauseBtn.querySelector("span");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const songListEl = document.getElementById("songList");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const albumArt = document.getElementById("albumArt");
const artworkWrapper = document.querySelector(".artwork-wrapper");
const title = document.getElementById("title");
const artist = document.getElementById("artist");

const togglePlaylistBtn = document.getElementById("togglePlaylist");
const closePlaylistBtn = document.getElementById("closePlaylist");
const playlist = document.getElementById("playlist");

const moreOptionsBtn = document.getElementById("moreOptions");
const dropdownMenu = document.getElementById("dropdownMenu");
const dynamicBg = document.getElementById("dynamicBg"); // Background for beat effect

const repeatBtn = document.getElementById("repeatBtn");
const shuffleBtn = document.getElementById("shuffleBtn");

// --- State ---
let isPlaying = false;
let currentSongIndex = 0;
let repeatMode = "none"; 
let shuffledSongs = [];
let isShuffled = false;

// --- Data (Updated NCS Royalty-Free Songs) ---
const songs = [
  { 
    title: "Royalty", 
    artist: "Maestro Chives, Egzod, Neoni", 
    src: "music/Maestro Chives, Egzod, Neoni - Royalty [NCS Release].mp3", 
    img: "images/Royalty.png" 
  },
  { 
    title: "Feel Good Funk", 
    artist: "Syn Cole, Nakama", 
    src: "music/Syn Cole, Nakama - Feel Good Funk [NCS Release].mp3", 
    img: "images/Feel Good Funk.png" 
  },
  { 
    title: "Never Knew Me", 
    artist: "Veela, Rameses B", 
    src: "music/Veela, Rameses B - Never Knew Me [NCS Release].mp3", 
    img: "images/Never Knew Me.png" 
  },
  { 
    title: "harinezumi", 
    artist: "waera", 
    src: "music/waera - harinezumi [NCS Release].mp3", 
    img: "images/harinezumi.png" 
  },
  { 
    title: "Mortals Funk Remix (Super Slowed)", 
    artist: "Warriyo, LXNGVX", 
    src: "music/Warriyo, LXNGVX - Mortals Funk Remix (Super Slowed) [NCS Release].mp3", 
    img: "images/Mortals Funk Remix (Super Slowed).png" 
  }
];

const audio = new Audio();

// --- Core Functions ---
function populateSongList() {
  songListEl.innerHTML = "";
  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.dataset.index = index;
    li.innerHTML = `
      <div class="song-info">
        <span class="song-title">${song.title}</span>
        <span class="song-artist">${song.artist}</span>
      </div>
      <span class="song-duration">--:--</span>
    `;
    songListEl.appendChild(li);

    const tempAudio = new Audio(song.src);
    tempAudio.onloadedmetadata = () => {
      li.querySelector('.song-duration').textContent = formatTime(tempAudio.duration);
    };
  });
}

function loadSong(index) {
  const song = songs[index];
  title.textContent = song.title;
  artist.textContent = song.artist;
  albumArt.src = song.img || 'images/default.jpg';
  
  albumArt.onerror = function() {
      this.src = 'https://placehold.co/400x400/1e1e1e/00f0ff?text=GX+Audio';
  };
  
  audio.src = song.src;

  const listItems = songListEl.querySelectorAll("li");
  listItems.forEach((item, i) => {
    item.classList.toggle("active", i === index);
  });

  progress.value = 0;
  updatePlayStateUI();
}

function updatePlayStateUI() {
  if (isPlaying) {
    audio.play();
    playPauseIcon.textContent = "pause";
    albumArt.classList.add('playing');
    artworkWrapper.classList.add('playing');
    dynamicBg.classList.add('beat-active'); // Turn ON background beat
  } else {
    audio.pause();
    playPauseIcon.textContent = "play_arrow";
    albumArt.classList.remove('playing');
    artworkWrapper.classList.remove('playing');
    dynamicBg.classList.remove('beat-active'); // Turn OFF background beat
  }
}

// --- Initialization ---
populateSongList();
loadSong(currentSongIndex);

// --- Event Listeners ---
playPauseBtn.onclick = () => {
  isPlaying = !isPlaying;
  updatePlayStateUI();
};

prevBtn.onclick = () => {
  if (isShuffled && shuffledSongs.length > 0) {
    let currentShuffledIndex = shuffledSongs.indexOf(currentSongIndex);
    currentShuffledIndex = (currentShuffledIndex - 1 + shuffledSongs.length) % shuffledSongs.length;
    currentSongIndex = shuffledSongs[currentShuffledIndex];
  } else {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  }
  isPlaying = true;
  loadSong(currentSongIndex);
};

nextBtn.onclick = () => {
  if (isShuffled && shuffledSongs.length > 0) {
    let currentShuffledIndex = shuffledSongs.indexOf(currentSongIndex);
    currentShuffledIndex = (currentShuffledIndex + 1) % shuffledSongs.length;
    currentSongIndex = shuffledSongs[currentShuffledIndex];
  } else {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
  }
  isPlaying = true;
  loadSong(currentSongIndex);
};

songListEl.onclick = (e) => {
  let targetLi = e.target.closest("li");
  if (targetLi && targetLi.dataset.index) {
    currentSongIndex = parseInt(targetLi.dataset.index);
    isPlaying = true;
    loadSong(currentSongIndex);
    
    // Auto-close playlist on mobile when a song is selected
    if(window.innerWidth <= 900) {
      playlist.classList.remove("active");
    }
  }
};

// --- Menu & Dropdown Logic ---

// Left Menu Button (Toggles Sidebar)
togglePlaylistBtn.onclick = () => {
  if(window.innerWidth <= 900) {
    playlist.classList.toggle("active");
  } else {
    playlist.classList.toggle("collapsed"); // For Desktop
  }
};

// Close Button inside Mobile Sidebar
closePlaylistBtn.onclick = () => {
  playlist.classList.remove("active");
};

// Right More Options (:) Button
moreOptionsBtn.onclick = (e) => {
  e.stopPropagation(); // Prevents instant closing
  dropdownMenu.classList.toggle("show");
};

// Close dropdown if clicked outside
window.onclick = (e) => {
  if (!e.target.matches('#moreOptions')) {
    if (dropdownMenu.classList.contains('show')) {
      dropdownMenu.classList.remove('show');
    }
  }
};

audio.ontimeupdate = () => {
  if (audio.duration) {
    progress.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }
};

audio.onloadedmetadata = () => {
  durationEl.textContent = formatTime(audio.duration);
};

progress.oninput = () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
};

volume.oninput = () => {
  audio.volume = volume.value;
};

audio.onended = () => {
  if (repeatMode === "one") {
    audio.currentTime = 0;
    audio.play();
  } else if (repeatMode === "all") {
    nextBtn.click();
  } else {
    if (currentSongIndex === songs.length - 1 && !isShuffled) {
      isPlaying = false;
      updatePlayStateUI();
      audio.currentTime = 0;
    } else {
      nextBtn.click();
    }
  }
};

repeatBtn.onclick = () => {
  const icon = repeatBtn.querySelector("span");
  if (repeatMode === "none") {
    repeatMode = "one";
    icon.textContent = "repeat_one";
    repeatBtn.classList.add("active-mode");
  } else if (repeatMode === "one") {
    repeatMode = "all";
    icon.textContent = "repeat";
    repeatBtn.classList.add("active-mode");
  } else {
    repeatMode = "none";
    icon.textContent = "repeat";
    repeatBtn.classList.remove("active-mode");
  }
};

shuffleBtn.onclick = () => {
  isShuffled = !isShuffled;
  shuffleBtn.classList.toggle("active-mode", isShuffled);

  if (isShuffled) {
    shuffledSongs = shuffleArray([...Array(songs.length).keys()]);
    const currentSongInShuffled = shuffledSongs.indexOf(currentSongIndex);
    if (currentSongInShuffled > -1) shuffledSongs.splice(currentSongInShuffled, 1);
    shuffledSongs.unshift(currentSongIndex);
  } else {
    shuffledSongs = [];
  }
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function formatTime(sec) {
  if (isNaN(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

volume.value = audio.volume;

// Handle audio errors gracefully
audio.onerror = () => {
  console.error("Error loading audio. Check file paths.");
  isPlaying = false;
  updatePlayStateUI();
};
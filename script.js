// Get references to all necessary DOM elements
const playPauseBtn = document.getElementById("playPause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const songListEl = document.getElementById("songList"); // Renamed to avoid conflict with songs array
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const albumArt = document.getElementById("albumArt");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const playlistBtn = document.getElementById("togglePlaylist");
const playlist = document.getElementById("playlist");
const repeatBtn = document.getElementById("repeatBtn"); // New repeat button
const shuffleBtn = document.getElementById("shuffleBtn"); // New shuffle button

// State variables for the music player
let isPlaying = false; // Tracks if music is currently playing
let currentSongIndex = 0; // Index of the current song in the 'songs' array
let repeatMode = "none"; // Can be "none", "one", or "all"
let shuffledSongs = []; // Array to store shuffled song indices
let isShuffled = false; // Flag to indicate if shuffle mode is active

// Array of song objects.
// IMPORTANT: Replace 'music/' and 'images/' paths with your actual local file paths.
// Ensure these files exist in the specified relative locations from your index.html.
const songs = [
  {
    title: "Destroyer of Worlds",
    artist: "Aaron Hibell",
    src: "music/destroyer of worlds.mp3",
    img: "images/J. Robert Oppenheimer.png",
  },
  {
    title: "Kids",
    artist: "Kyle Dixon & Michael Stein",
    src: "music/Kyle Dixon & Michael Stein – Kids.mp3",
    img: "images/Stranger Things.png",
  },
  {
    title: "Interwold – Metamorphosis",
    artist: "Janji, Johnning",
    src: "music/Interwold – Metamorphosis.mp3",
    img: "images/interworld metamorphosis.png",
  },
  {
    title: "Cornfield Chase",
    artist: "Hans Zimmer",
    src: "music/Hans Zimmer – Cornfield Chase.mp3",
    img: "images/interstellar.png",
  },
  {
    title: "Drowning (slowed + reverb)",
    artist: "Aniket Sundriyal",
    src: "music/Drowning (slowed + reverb).mp3",
    img: "images/aniket.png",
  }
];

// Create a new Audio object
const audio = new Audio();

/**
 * Populates the song list in the HTML from the 'songs' array.
 * It also pre-loads metadata for each song to display its duration.
 */
function populateSongList() {
  songListEl.innerHTML = ""; // Clear existing list items
  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.dataset.index = index; // Store the original index for easy lookup
    li.innerHTML = `
      <span>${song.title} - ${song.artist}</span>
      <span class="song-duration"></span>
    `;
    songListEl.appendChild(li);

    // Create a temporary audio element to get the duration without playing
    const tempAudio = new Audio(song.src);
    tempAudio.onloadedmetadata = () => {
      // Display the formatted duration in the list item
      li.querySelector('.song-duration').textContent = formatTime(tempAudio.duration);
    };
    // Handle potential errors during metadata loading for individual songs in the list
    tempAudio.onerror = () => {
        li.querySelector('.song-duration').textContent = "Error";
        console.error(`Error loading metadata for ${song.title}:`, tempAudio.error);
    };
  });
}

/**
 * Loads a song based on its index in the 'songs' array.
 * Updates the UI (title, artist, album art) and the audio source.
 * @param {number} index The index of the song to load.
 */
function loadSong(index) {
  const song = songs[index];
  title.textContent = song.title;
  artist.textContent = song.artist;
  // Set album art, with a fallback to a default image if 'song.img' is missing or fails to load
  albumArt.src = song.img || 'images/default.jpg';
  // If the album art fails to load, use a placeholder
  albumArt.onerror = function() {
      this.onerror = null; // Prevent infinite loop if placeholder also fails
      this.src = 'https://placehold.co/250x250/333333/FFFFFF?text=No+Art';
  };
  audio.src = song.src; // Set the audio source

  // Highlight the currently active song in the playlist
  const listItems = songListEl.querySelectorAll("li");
  listItems.forEach((item, i) => {
    if (i === index) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Reset progress bar and update play/pause button icon based on 'isPlaying' state
  progress.value = 0;
  if (isPlaying) {
    audio.play();
    playPauseBtn.textContent = "pause"; // Material icon for pause
    albumArt.classList.add('playing'); // Start album art rotation
  } else {
    audio.pause();
    playPauseBtn.textContent = "play_arrow"; // Material icon for play
    albumArt.classList.remove('playing'); // Stop album art rotation
  }
}

// Initial setup: Populate the song list and load the first song
populateSongList();
loadSong(currentSongIndex);

// --- Event Listeners ---

// Play/Pause button functionality
playPauseBtn.onclick = () => {
  if (isPlaying) {
    audio.pause();
    playPauseBtn.textContent = "play_arrow";
    albumArt.classList.remove('playing');
  } else {
    audio.play();
    playPauseBtn.textContent = "pause";
    albumArt.classList.add('playing');
  }
  isPlaying = !isPlaying; // Toggle playing state
};

// Previous song functionality
prevBtn.onclick = () => {
  if (isShuffled && shuffledSongs.length > 0) {
    // Find current song in shuffled list and go to previous in that list
    let currentShuffledIndex = shuffledSongs.indexOf(currentSongIndex);
    currentShuffledIndex = (currentShuffledIndex - 1 + shuffledSongs.length) % shuffledSongs.length;
    currentSongIndex = shuffledSongs[currentShuffledIndex];
  } else {
    // Go to previous song in original order
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  }
  loadSong(currentSongIndex);
  audio.play(); // Automatically play the new song
  isPlaying = true;
};

// Next song functionality
nextBtn.onclick = () => {
  if (isShuffled && shuffledSongs.length > 0) {
    // Find current song in shuffled list and go to next in that list
    let currentShuffledIndex = shuffledSongs.indexOf(currentSongIndex);
    currentShuffledIndex = (currentShuffledIndex + 1) % shuffledSongs.length;
    currentSongIndex = shuffledSongs[currentShuffledIndex];
  } else {
    // Go to next song in original order
    currentSongIndex = (currentSongIndex + 1) % songs.length;
  }
  loadSong(currentSongIndex);
  audio.play(); // Automatically play the new song
  isPlaying = true;
};

// Song list item click functionality
songListEl.onclick = (e) => {
  // Find the closest list item (<li>) that was clicked
  let targetLi = e.target.closest("li");
  if (targetLi && targetLi.dataset.index) {
    const index = parseInt(targetLi.dataset.index);
    currentSongIndex = index;
    loadSong(currentSongIndex);
    audio.play(); // Play the selected song
    isPlaying = true;
  }
};

// Update progress bar and current time display as audio plays
audio.ontimeupdate = () => {
  if (audio.duration) { // Ensure duration is available to prevent NaN
    progress.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }
};

// When song metadata is loaded (e.g., duration, etc.)
audio.onloadedmetadata = () => {
  durationEl.textContent = formatTime(audio.duration); // Display total duration
  progress.max = 100; // Ensure progress bar max is 100%
};

// Seek song when progress bar is manually changed by user
progress.oninput = () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
};

// Volume control
volume.oninput = () => {
  audio.volume = volume.value;
};

// Toggle playlist visibility
playlistBtn.onclick = () => {
  playlist.classList.toggle("hidden");
};

// Logic for when a song finishes playing
audio.onended = () => {
  if (repeatMode === "one") {
    audio.currentTime = 0; // Restart current song
    audio.play();
  } else if (repeatMode === "all") {
    nextBtn.click(); // Go to next song in sequence (shuffled or not)
  } else { // repeatMode === "none"
    // If it's the last song and not shuffled, stop playback
    if (currentSongIndex === songs.length - 1 && !isShuffled) {
      isPlaying = false;
      playPauseBtn.textContent = "play_arrow";
      albumArt.classList.remove('playing');
      audio.pause();
      audio.currentTime = 0; // Reset to beginning
    } else {
      nextBtn.click(); // Otherwise, go to the next song
    }
  }
};

// Cycle through repeat modes (none -> one -> all -> none)
repeatBtn.onclick = () => {
  if (repeatMode === "none") {
    repeatMode = "one";
    repeatBtn.textContent = "repeat_one"; // Material icon for repeat one
  } else if (repeatMode === "one") {
    repeatMode = "all";
    repeatBtn.textContent = "repeat"; // Material icon for repeat all
  } else {
    repeatMode = "none";
    repeatBtn.textContent = "repeat"; // Reset to default repeat icon
  }
  // Visually indicate the active repeat mode by changing button color
  repeatBtn.style.color = repeatMode === "none" ? "#fff" : "#1db954";
};

// Shuffle functionality
shuffleBtn.onclick = () => {
  isShuffled = !isShuffled; // Toggle shuffle mode
  shuffleBtn.style.color = isShuffled ? "#1db954" : "#fff"; // Change icon color

  if (isShuffled) {
    // Generate an array of indices [0, 1, 2, ..., songs.length-1] and shuffle it
    shuffledSongs = shuffleArray([...Array(songs.length).keys()]);
    // Ensure the current song is still the first to play in the shuffled sequence
    const currentSongInShuffled = shuffledSongs.indexOf(currentSongIndex);
    if (currentSongInShuffled > -1) {
        shuffledSongs.splice(currentSongInShuffled, 1); // Remove current song from its shuffled position
    }
    shuffledSongs.unshift(currentSongIndex); // Add current song to the beginning of the shuffled list
  } else {
    // If un-shuffling, the next/prev logic will revert to original order naturally
    shuffledSongs = []; // Clear shuffled songs
  }
};

/**
 * Utility function to shuffle an array (Fisher-Yates algorithm).
 * @param {Array} array The array to shuffle.
 * @returns {Array} The shuffled array.
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

/**
 * Formats time from seconds into MM:SS format.
 * @param {number} sec The time in seconds.
 * @returns {string} The formatted time string (e.g., "03:45").
 */
function formatTime(sec) {
  if (isNaN(sec) || sec < 0) return "0:00"; // Handle invalid time
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0"); // Pad with leading zero if needed
  return `${m}:${s}`;
}

// Handle audio loading errors (e.g., file not found, network issues)
audio.onerror = () => {
  console.error("Error loading audio:", audio.error);
  // Instead of alert(), you might display a message on the UI
  // For now, keeping the alert as requested by previous context, but generally avoid alerts.
  // alert("Error loading audio. Please check the song path.");
  // A better approach would be to update a message element in the UI:
  // document.getElementById('errorMessage').textContent = "Error loading audio. Please check song paths and ensure files are in 'music/' folder.";
  playPauseBtn.textContent = "play_arrow";
  albumArt.classList.remove('playing');
  isPlaying = false;
};

// Initial setup for volume slider to match audio object's default volume
volume.value = audio.volume;

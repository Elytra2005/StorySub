const categories = [
  { name: 'r/shortstories', id: 'shortstories' },
  { name: 'r/nosleep', id: 'nosleep' },
  { name: 'r/tifu', id: 'tifu' },
  { name: "r/LetsNotMeet", id: 'LetsNotMeet' },
  { name: 'r/Glitch_in_the_Matrix', id: 'Glitch_in_the_Matrix' },
  { name: 'r/WritingPrompts', id: 'WritingPrompts' }
];

const categoryRow = document.getElementById('categoryRow');
const storyList = document.getElementById('storyList');
const statusEl = document.getElementById('status');
const searchInput = document.getElementById('search');
const nowPlayingTitle = document.getElementById('nowPlayingTitle');
const nowPlayingMeta = document.getElementById('nowPlayingMeta');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const playPauseButton = document.getElementById('playPauseButton');

let activeCategory = categories[0].id;
let stories = [];
let filteredStories = [];
let currentStoryIndex = -1;
let isSpeaking = false;

const synth = window.speechSynthesis;

function timeAgo(unixSeconds) {
  const diff = Math.floor(Date.now() / 1000) - unixSeconds;
  const steps = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60]
  ];

  for (const [label, seconds] of steps) {
    const value = Math.floor(diff / seconds);
    if (value >= 1) {
      return `${value} ${label}${value > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

function renderCategories() {
  categoryRow.innerHTML = '';

  categories.forEach((category) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `chip ${category.id === activeCategory ? 'active' : ''}`;
    chip.textContent = category.name;
    chip.addEventListener('click', () => {
      activeCategory = category.id;
      currentStoryIndex = -1;
      stopSpeech();
      renderCategories();
      loadStories();
    });
    categoryRow.appendChild(chip);
  });
}

function updateNowPlaying() {
  const story = filteredStories[currentStoryIndex];
  if (!story) {
    nowPlayingTitle.textContent = 'Choose a story to start listening';
    nowPlayingMeta.textContent = 'Select a post from below and hit play.';
    playPauseButton.textContent = 'Play';
    isSpeaking = false;
    return;
  }

  nowPlayingTitle.textContent = story.title;
  nowPlayingMeta.textContent = `by u/${story.author} • ${story.subreddit} • ${timeAgo(story.created_utc)}`;
  playPauseButton.textContent = isSpeaking ? 'Pause' : 'Play';
}

function renderStories() {
  storyList.innerHTML = '';

  if (!filteredStories.length) {
    statusEl.textContent = 'No stories found for this search. Try another keyword.';
    return;
  }

  statusEl.textContent = `Found ${filteredStories.length} stories from ${activeCategory}.`;

  filteredStories.forEach((story, index) => {
    const card = document.createElement('article');
    card.className = 'story-card';
    card.addEventListener('click', () => {
      currentStoryIndex = index;
      isSpeaking = false;
      updateNowPlaying();
    });

    card.innerHTML = `
      <p class="story-meta">r/${story.subreddit} • Posted by u/${story.author} • ${timeAgo(story.created_utc)}</p>
      <h3 class="story-title">${story.title}</h3>
      <div class="story-footer">
        <span>⬆ ${story.ups} upvotes • 💬 ${story.num_comments} comments</span>
        <span>Read now →</span>
      </div>
    `;

    storyList.appendChild(card);
  });
}

function applySearch() {
  const term = searchInput.value.trim().toLowerCase();
  filteredStories = stories.filter((story) => {
    return story.title.toLowerCase().includes(term) || story.selftext.toLowerCase().includes(term);
  });

  if (currentStoryIndex >= filteredStories.length) {
    currentStoryIndex = -1;
  }

  updateNowPlaying();
  renderStories();
}

function cleanText(text = '') {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function startSpeech() {
  const story = filteredStories[currentStoryIndex];
  if (!story) {
    statusEl.textContent = 'Pick a story first.';
    return;
  }

  synth.cancel();
  const body = cleanText(story.selftext || 'No text body available.');
  const utterance = new SpeechSynthesisUtterance(`${story.title}. ${body}`);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.onend = () => {
    isSpeaking = false;
    updateNowPlaying();
  };

  synth.speak(utterance);
  isSpeaking = true;
  updateNowPlaying();
}

function stopSpeech() {
  synth.cancel();
  isSpeaking = false;
  updateNowPlaying();
}

playPauseButton.addEventListener('click', () => {
  if (currentStoryIndex < 0) {
    if (filteredStories.length) {
      currentStoryIndex = 0;
    } else {
      return;
    }
  }

  if (isSpeaking) {
    stopSpeech();
  } else {
    startSpeech();
  }
});

nextButton.addEventListener('click', () => {
  if (!filteredStories.length) {
    return;
  }

  currentStoryIndex = (currentStoryIndex + 1 + filteredStories.length) % filteredStories.length;
  isSpeaking = false;
  updateNowPlaying();
  startSpeech();
});

prevButton.addEventListener('click', () => {
  if (!filteredStories.length) {
    return;
  }

  currentStoryIndex = (currentStoryIndex - 1 + filteredStories.length) % filteredStories.length;
  isSpeaking = false;
  updateNowPlaying();
  startSpeech();
});

searchInput.addEventListener('input', applySearch);

async function loadStories() {
  statusEl.textContent = `Loading stories from r/${activeCategory}...`;
  storyList.innerHTML = '';

  try {
    const response = await fetch(
      `https://www.reddit.com/r/${activeCategory}/top.json?limit=25&t=month&raw_json=1`
    );

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    stories = data.data.children
      .map((child) => child.data)
      .filter((post) => post.selftext && post.selftext.length > 120);

    filteredStories = stories;
    currentStoryIndex = -1;
    applySearch();
  } catch (error) {
    statusEl.textContent =
      'Could not load stories from Reddit right now. Check your connection and try again.';
    console.error(error);
  }
}

renderCategories();
loadStories();

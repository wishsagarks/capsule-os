const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function fetchSpotifyApi(
  endpoint: string,
  token: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<any> {
  const url = `${SPOTIFY_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getCurrentUserProfile(token: string) {
  return fetchSpotifyApi('/me', token);
}

export async function getTopArtists(
  token: string,
  timeRange: 'long_term' | 'medium_term' | 'short_term' = 'long_term',
  limit: number = 50
) {
  return fetchSpotifyApi(
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`,
    token
  );
}

export async function getTopTracks(
  token: string,
  timeRange: 'long_term' | 'medium_term' | 'short_term' = 'long_term',
  limit: number = 50
) {
  return fetchSpotifyApi(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    token
  );
}

export async function getRecentlyPlayed(
  token: string,
  limit: number = 50
) {
  return fetchSpotifyApi(
    `/me/player/recently-played?limit=${limit}`,
    token
  );
}

export async function getAudioFeatures(token: string, trackIds: string[]) {
  const ids = trackIds.slice(0, 100).join(',');
  return fetchSpotifyApi(`/audio-features?ids=${ids}`, token);
}

export async function getAvailableGenreSeeds(token: string) {
  return fetchSpotifyApi('/recommendations/available-genre-seeds', token);
}

export interface ListeningStats {
  totalTracks: number;
  uniqueArtists: number;
  uniqueGenres: number;
  averageEnergy: number;
  averageValence: number;
  averageTempo: number;
  averageDanceability: number;
  dominantGenres: string[];
}

export async function calculateListeningStats(
  token: string
): Promise<ListeningStats> {
  try {
    const topTracks = await getTopTracks(token, 'long_term', 50);
    const trackIds = topTracks.items.map((t: any) => t.id);
    const audioFeatures = await getAudioFeatures(token, trackIds);

    const topArtists = await getTopArtists(token, 'long_term', 50);

    const genreMap = new Map<string, number>();
    topArtists.items.forEach((artist: any) => {
      artist.genres.forEach((genre: string) => {
        genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
      });
    });

    const sortedGenres = Array.from(genreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([genre]) => genre);

    const validFeatures = audioFeatures.audio_features.filter(
      (f: any) => f !== null
    );

    return {
      totalTracks: topTracks.items.length,
      uniqueArtists: topArtists.items.length,
      uniqueGenres: genreMap.size,
      averageEnergy:
        validFeatures.reduce((sum: number, f: any) => sum + f.energy, 0) /
        validFeatures.length,
      averageValence:
        validFeatures.reduce((sum: number, f: any) => sum + f.valence, 0) /
        validFeatures.length,
      averageTempo:
        validFeatures.reduce((sum: number, f: any) => sum + f.tempo, 0) /
        validFeatures.length,
      averageDanceability:
        validFeatures.reduce((sum: number, f: any) => sum + f.danceability, 0) /
        validFeatures.length,
      dominantGenres: sortedGenres,
    };
  } catch (error) {
    console.error('Error calculating listening stats:', error);
    throw error;
  }
}

export async function getMoodProfile(token: string) {
  const topTracks = await getTopTracks(token, 'long_term', 50);
  const trackIds = topTracks.items.map((t: any) => t.id);
  const audioFeatures = await getAudioFeatures(token, trackIds);

  const validFeatures = audioFeatures.audio_features.filter(
    (f: any) => f !== null
  );

  const avgEnergy =
    validFeatures.reduce((sum: number, f: any) => sum + f.energy, 0) /
    validFeatures.length;
  const avgValence =
    validFeatures.reduce((sum: number, f: any) => sum + f.valence, 0) /
    validFeatures.length;

  let moodType = 'Balanced';
  if (avgEnergy > 0.7 && avgValence > 0.6) {
    moodType = 'Uplifting';
  } else if (avgEnergy < 0.4 && avgValence < 0.5) {
    moodType = 'Melancholic';
  } else if (avgEnergy > 0.7) {
    moodType = 'Energetic';
  } else if (avgValence < 0.4) {
    moodType = 'Dark & Deep';
  } else {
    moodType = 'Chill';
  }

  return {
    moodType,
    energy: avgEnergy,
    valence: avgValence,
    danceability:
      validFeatures.reduce((sum: number, f: any) => sum + f.danceability, 0) /
      validFeatures.length,
  };
}

export async function getExplorationIndex(token: string) {
  const topArtists = await getTopArtists(token, 'long_term', 50);
  const recentlyPlayed = await getRecentlyPlayed(token, 50);

  const topArtistIds = new Set(topArtists.items.map((a: any) => a.id));
  const newArtists = recentlyPlayed.items.filter(
    (item: any) =>
      !topArtistIds.has(item.track.artists[0].id)
  ).length;

  const explorationScore = (newArtists / recentlyPlayed.items.length) * 100;

  return {
    explorationScore,
    newArtistsDiscovered: newArtists,
    totalRecent: recentlyPlayed.items.length,
    familiarityScore: 100 - explorationScore,
  };
}

export async function getListeningPersonality(token: string) {
  const stats = await calculateListeningStats(token);
  const exploration = await getExplorationIndex(token);
  const mood = await getMoodProfile(token);

  let personality = 'The Balanced Listener';
  let description = 'You maintain a well-rounded listening experience.';

  if (exploration.explorationScore > 60) {
    personality = 'The Explorer';
    description =
      'You constantly seek new music and artists. Discovery is your driving force.';
  } else if (stats.uniqueArtists < 20) {
    personality = 'The Loyalist';
    description =
      'You have found your favorite artists and stick with them. Quality over quantity.';
  } else if (mood.energy > 0.7) {
    personality = 'The Night Owl';
    description = 'Your taste leans toward high-energy, dynamic sounds.';
  } else if (mood.valence < 0.4) {
    personality = 'The Mood Regulator';
    description =
      'Music is your emotional anchor. You use it to navigate and process feelings.';
  } else {
    personality = 'The Focus Seeker';
    description = 'Your selections support deep work and concentration.';
  }

  return {
    personality,
    description,
    confidence: Math.min(100, (stats.uniqueArtists / 50) * 100),
  };
}

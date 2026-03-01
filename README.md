# ☁️ NËXP.FM - SoundCloud 24/7 Radio Bot
The official radio bot. This bot streams any public SoundCloud playlist 24/7 into a Discord Voice Channel.

### 🚀 Features
* **24/7 Connectivity**: Automatically recovers from SoundCloud rate limits and crashes.
* **True Random Start**: Shuffles and skips to a random track immediately on startup.
* **Slash Command Support**: Use `/next` to skip tracks (Moderator only).
* **Ephemeral Messaging**: Skip notifications are private and auto-delete after 5 seconds.
* **Auto-Status**: Updates the bot's "Listening to..." status with the current track.

### 🛠️ Setup
1. Download the files and run `npm install`.
2. Open `index.js` and paste your IDs in the **Configuration** section at the top.
3. Ensure your bot has `Connect`, `Speak`, and `Use Slash Commands` permissions.
4. Run the bot with `node index.js`.

### 🎮 Commands
* **/next**: Skips to the next track in the shuffled queue.

process.env.NODE_NO_WARNINGS = '1';

const { Client, GatewayIntentBits, ActivityType, PermissionsBitField, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { DisTube } = require('distube');
const { SoundCloudPlugin } = require('@distube/soundcloud');

// ==========================================
// CONFIGURATION - PASTE YOUR DETAILS BELOW
// ==========================================
const TOKEN = 'PASTE_YOUR_BOT_TOKEN_HERE'; 
const CLIENT_ID = 'PASTE_YOUR_APPLICATION_ID_HERE'; 
const GUILD_ID = 'PASTE_YOUR_SERVER_ID_HERE';
const VC_ID = 'PASTE_YOUR_VOICE_CHANNEL_ID_HERE';
const SOUNDCLOUD_PLAYLIST = 'PASTE_YOUR_SOUNDCLOUD_PLAYLIST_URL_HERE';
// ==========================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});

const distube = new DisTube(client, {
    plugins: [new SoundCloudPlugin()],
    emitNewSongOnly: true
});

// Register the /next command
const commands = [
    new SlashCommandBuilder()
        .setName('next')
        .setDescription('Skip to the next track (Moderators only)')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log('✅ Slash commands registered.');
    } catch (error) {
        console.error('Command registration error:', error.message);
    }
})();

client.on('ready', async () => {
    console.log(`✅ ${client.user.tag} is online!`);
    startRadio();
});

async function startRadio() {
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const voiceChannel = await guild.channels.fetch(VC_ID);

        await distube.play(voiceChannel, SOUNDCLOUD_PLAYLIST, {
            textChannel: null,
            member: guild.members.me
        });
        
        const queue = distube.getQueue(GUILD_ID);
        if (queue) {
            await queue.shuffle();
            await queue.skip(); // Start on a random song
            console.log("☁️ Radio started and shuffled!");
        }
    } catch (e) {
        console.error("Stream Start Error:", e.message);
        setTimeout(() => startRadio(), 30000); // Retry after 30 seconds
    }
}

distube.on('playSong', (queue, song) => {
    queue.setRepeatMode(2); 
    client.user.setActivity(song.name, { type: ActivityType.Listening });
    console.log(`🎵 Now Playing: ${song.name}`);
});

distube.on('error', (channel, error, song) => {
    if (song) console.log(`⏭️ Auto-skipped: ${song.name} (Protected or unavailable)`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'next') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "❌ Moderators only.", flags: [4096] });
        }

        const queue = distube.getQueue(interaction);
        if (!queue) return interaction.reply({ content: "❌ Nothing playing.", flags: [4096] });

        try {
            await interaction.reply({ content: "⏩ Skipping...", flags: [4096] });
            await distube.skip(interaction);
            setTimeout(() => { interaction.deleteReply().catch(() => null); }, 5000);
        } catch (e) {
            startRadio();
            setTimeout(() => { interaction.deleteReply().catch(() => null); }, 5000);
        }
    }
});

client.login(TOKEN);

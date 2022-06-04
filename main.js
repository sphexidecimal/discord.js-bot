/// REQUIRES
const { Client, Collection  } = require('discord.js');
const client = new Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES'] });
const fs = require('fs');
const cron = require('cron');


/// REGISTRY
const { interactions, servers, users  } = require('./registry.js');


/// COMMAND HANDLER
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands/').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}


/// EVENT HANDLER
client.events = new Collection();
const eventFiles = fs.readdirSync('./events/').filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}


/// MAIN
async function main() {
    /// CREATE DATABASE POOL/CONN HERE
    const pool = null; // setup your connection here


    /// ON SUCCESSFUL BOT START
    client.once('ready', async () => {
        console.log('DJS bot online');


        // update global commands
        const commands = [];
        client.commands.forEach(cmd => {
            const { name, description, options } = cmd;
            commands.push({ name, description, options: options || [] });
        })
        if (commands[0]) {
            // await client.application.commands.set(commands);
            (await client.guilds.fetch('837167695279161364'))?.commands.set(commands);
        }
        

        // set bot status to guild count every minute
        const activity = new cron.CronJob('*/60 * * * * *', async () => {
            try {
                client.user.setActivity(`${client.guilds.cache.size.toLocaleString()} servers`, { type: 'WATCHING' });
            } catch (err) { console.error(err); }
        }, null, true);
        activity.start();
    });

    
    /// COMMANDS
    client.on('interactionCreate', async (interaction) => {
        // slash command handler
        if (interaction.isCommand()) {
            // check if command has matching file
            const cmd = client.commands.get(interaction.commandName);
            if (!cmd) return interaction.reply({ content: `Couldn't find matching command for \`/${interaction.commandName}\``, ephemeral: true });
            
            const { ephemeral, execute } = cmd;

            // set command to hidden or visible depending on command settings
            await interaction.deferReply({ ephemeral });
            

            // argument handler
            const args = [];
            for (let option of interaction.options.data) {
                if (option.type === 'SUB_COMMAND') {
                    if (option.name) args.push(option.name);
                    option.options?.forEach((x) => {
                        if (x.value) args.push(x.value);
                    });
                } else if (option.value) args.push(option.value);
            }
            console.log(args);


            // get fresh per server settings every X minutes
            let cachedServer = servers.get(interaction.guild.id);
            if (!cachedServer || Date.now() > (cachedProject.fetched_at + (1000 * 60 * '?'))) { // replace '?' with how many minutes you want to wait between fresh queries
                // const server = query database
                // server.fetched_at = Date.now();

                // servers.set(interaction.guild.id, server);
            }


            // try run command and catch any errors
            try { execute(pool, client, cachedServer, interaction, args); } catch (err) { console.error(err); }
        }

    
        // button and dropdown handler
        if (interaction.customId) {
            const [interactionID, handlerFunction] = interaction.customId.split('.');
            const cachedInteraction = interactions.get(interactionID);
            
            if (cachedInteraction) cachedInteraction[handlerFunction](interaction);
        }
    });


    /// BOT JOINS SERVER
    client.on('guildCreate', async (guild) => {
        try {
            // insert necessary data into database

            // set local server commands if not using global scoped commands
            // (await client.guilds.fetch(guild.id))?.commands.set(commands);
        } catch (err) {
            console.error(err);
        }

        console.log(`Joined server: ${guild.name} (${guild.id})`);
    })


    /// BOT LEAVES SERVER
    client.on('guildDelete', async (guild) => {
        try { 
            // delete per server settings for this server
        } catch (err) { console.error(err); }

        console.log(`Left server: ${guild.name} (${guild.id})`);
    })


    /// CONNECT TO DISCORD
    client.login(process.env.TOKEN);
}
main().catch(console.error);
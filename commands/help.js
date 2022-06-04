///REQUIRES
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { getEmoji } = require('../functions');


///REGISTRYS
const { interactions } = require('../registry.js');


///MAIN
module.exports = {
    name: 'help', // the name of the command to be followed by / (eg. this command will become /help)
    description: 'A helpful list of commands, alongside important links.', //description of the command, be consise but descriptive
    ephemeral: true, // whether you want the resulting command to be visible to everyone or just to the user
    
    // code to run when using the command
    async execute (pool, client, settings, interaction) { // args is not needed, so you may omit it
        const commands = Array.from(client.commands.values());
        const emoji = getEmoji.bind(this, client); //emoji('YourLogo') will find the emoji matching the name of your logo emoji if the bot shares a server with it
    
        let index = 0;
        const handlers = {
            interaction,
            onFirst: async function(buttonInteraction) { // go to first page
                try { await buttonInteraction.deferUpdate() } catch (err) { }
                if (buttonInteraction.user.id !== interaction.user.id) return; // check the original user clicked the button

                if (index > 0) index = 0; else index = commands.length - 1;
                await handlers.onEmbed(buttonInteraction);
            },
            onBack: async function(buttonInteraction) { // go back 1 page
                try { await buttonInteraction.deferUpdate() } catch (err) { }
                if (buttonInteraction.user.id !== interaction.user.id) return; // check the original user clicked the button
                
                if (index > 0) index--; else index = commands.length - 1;
                await handlers.onEmbed(buttonInteraction);
            },
            onNext: async function(buttonInteraction) { // go forward 1 page
                try { await buttonInteraction.deferUpdate() } catch (err) { }
                if (buttonInteraction.user.id !== interaction.user.id) return; // check the original user clicked the button

                if (index < commands.length - 1) index++; else index = 0;
                await handlers.onEmbed(buttonInteraction);
            },
            onLast: async function(buttonInteraction) { // go to last page
                try { await buttonInteraction.deferUpdate() } catch (err) { }
                if (buttonInteraction.user.id !== interaction.user.id) return; // check the original user clicked the button

                if (index < commands.length - 1) index = commands.length - 1; else index = 0;
                await handlers.onEmbed(buttonInteraction);
            },
            onEmbed: async function(buttonInteraction) { // create a fresh embed with new data
                try { await buttonInteraction.editReply({ embeds: [generateEmbed(index)], components: commands.components }); } catch (err) { console.error(err); }
            }
        }

        const arrows = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId(`${interaction.id}.onFirst`) // for the handler to work, put the interaction id and then the name of the handler function separated by a .
                .setEmoji('⏪') // can use a Discord emoji aswell as long as the bot shares a server with the emoji
                // .setLabel('') // not using this right now but you can put a text label here.
                .setStyle('PRIMARY'), // 'PRIMARY' = Blue, 'SECONDARY' = Grey/Gray, 'SUCCESS' = Green, 'DANGER' = Red
            new MessageButton()
                .setCustomId(`${interaction.id}.onBack`)
                .setEmoji('⬅️')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId(`${interaction.id}.onNext`)
                .setEmoji('➡️')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId(`${interaction.id}.onLast`)
                .setEmoji('⏩')
                .setStyle('PRIMARY')
        )

        const links = [
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setEmoji('🔗')
                    .setLabel('Official Site')
                    .setURL('https://yourwebsite.com/')
                    .setStyle('LINK'),
                new MessageButton()
                    .setEmoji('📈')
                    .setLabel('Status Page')
                    .setURL('https://statuspage.io/')
                    .setStyle('LINK')
            ),
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setEmoji('⚙️')
                    .setLabel('Support Server')
                    .setURL('https://discord.gg/invitecode')
                    .setStyle('LINK'),
                new MessageButton()
                    .setEmoji('🐦')
                    .setLabel('Follow Us')
                    .setURL('https://twitter.com/yourhandle')
                    .setStyle('LINK')
            )
        ]

        // create fresh embed each edit
        let components = [];
        const generateEmbed = start => {
            const current = commands[start];
            const { name, description, ephemeral, options } = current;

            // set up required buttons and menus
            if (components[0]) components = [];
            if (commands.length > 1) components.push(arrows);
            components.push(...links);

            let isEphemeral = '';
            if (ephemeral) isEphemeral = `*This command is only visible to the user.*`

            // use preconstructed command data to form an information page
            const embed = new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(`/${name}`)
                .setDescription(`${isEphemeral}\`\`\`${description}\`\`\``)
                .setFooter({ text: `Showing ${start + 1} out of ${commands.length} commands` });

            if (options) options.forEach((arg) => {
                let required = '';
                let isRequired = '';
                if (arg.required) {
                    required = '*';
                    isRequired = '*This option is required.*'
                }
                embed.addField(`:${arg.name}${required}`, `${isRequired}\`\`\`${arg.description}\`\`\``, false);
            })

            return embed;
        }

        // store the handlers for buttons/menus in registry
        interactions.set(interaction.id, handlers);
        try { await interaction.editReply({
            content: `__**Command List**__`,
            embeds: [generateEmbed(0)],
            components })
        } catch (err) { console.error(err); }

        // set a deletion of the interaction after X minutes and remove non link buttons
        setTimeout(async function() {
            try { await interaction.editReply({
                content: `__**Command List**__`,
                embeds: [generateEmbed(index)],
                components: [...links]
            }) } catch (err) { console.error(err); }
        }, 1000 * 60 * 5); // replace 5 with how many minutes before you want to purge
        // interaction last 15 minutes maximum, if you dont want a premature expiry (<15m) then delete this function entirely
    }
}
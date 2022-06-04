# Discord.js Bot

A boilerplate code for starting out with a bot using the slash commands/buttons and select menus

Requires Node.js >= 16.0.0

## Who is this for?

* Anyone building a Discord bot and is still learning how slash commands are created/
* Anyone looking to simplify how interactions can be stored and used when needed.

## Features

* **/help command** - A robust help command that uses the commands predefined name, description and options to automatically create a paginated list of each command, navigable by the attached arrow buttons.
* **Bot status** - Automatically update the bots status each minute with the bot's total server count.
* **Global/Local Scopes** - Set either global or local commands based on what suits your project. I may add a way to do both in future, depending on factors such as per server settings.
* **Cache System** - A basic cache system for interactions, users and servers to store data without having to constantly query the database unless it is necessary.
* **Interaction Handler** - A simple, but robust method of handling slash commands/buttons and select menus using handlers and a registry for the interactions.

### Interaction Registry

#### Button and Select Menu handler

* When defining a button or select menu's customId, specify the original interaction id and the related function in the handler you want to associate with the button

```js
const button = new Discord.MessageButton()
    .setCustomId(`${interaction.id}.onButton`)

const menu = new Discord.MessageSelectMenu()
    .setCustomId(`${interaction.id}.onMenu`)
    .setPlaceholder('...')
    .addOptions(arrayOfOptions)
```

* Setting the handlers into the interactions registry in order to access later as needed

```js
const { interactions } = require('../registry.js');

//create the handlers
const handlers = {
    interaction,
    onButton: async function(componentInteraction) {
        const value = componentInteraction.split('.')[1];
        
        // do the thing
    },
    onMenu: async function(componentInteraction) {
        const = componentInteraction.values; //select menus can have multiple values
        
        // also do the thing
    }
}

// store the handlers in registry
interactions.set(interaction.id, handlers);

// initial edit when everything is setup
try { await interaction.editReply({
    content: 'text',
    embeds: [embed],
    components: [buttons, menus] })
} catch (err) { console.error(err); }

// delete the interaction after x minutes
setTimeout(async function() {
    try {
        interactions.delete(interaction.id) // can use this to stop buttons/menus being used wherever/whenever without having to ever edit the message
        
        await interaction.editReply({
            content: 'text',
            embeds: [embed],
            components: [] // empty components if you want to deter button presses on expired interactions
        })
    } catch (err) { console.error(err); }
}, 1000 * 60 * 5); // replace 5 with how many minutes
// interaction last 15m maximum, if you dont want a premature expiry (<15m) then delete this function entirely
```

* Handling all buttons and select menus in a few lines

```js
const { interactions } = require('./registry.js');

client.on('interactionCreate', async (interaction) => {
    if (interaction.customId) {
        // find the matching command using the id at the start of the button's customId
        const [interactionID, handlerFunction] = interaction.customId.split('.');
        const cachedInteraction = interactions.get(interactionID);

        // execute the function specified in the button's customId
        if (cachedInteraction) cachedInteraction[handlerFunction](interaction);
    }
});
```

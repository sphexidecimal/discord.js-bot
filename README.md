# Discord.js Bot

![GitHub Repo stars](https://img.shields.io/github/stars/sphexidecimal/discord.js-bot?style=social)
![GitHub forks](https://img.shields.io/github/forks/sphexidecimal/discord.js-bot?style=social)
![node-current](https://img.shields.io/node/v/discord.js)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/sphexidecimal/discord.js-bot/discord.js)
![Twitter Follow](https://img.shields.io/twitter/follow/0xSpheX?style=social)

A boilerplate code for starting out with a bot using the slash commands/buttons and select menus

## Who is this for?

* Anyone building a Discord bot and is still learning how slash commands are created or handled.
* Anyone looking to simplify how interactions can be stored and used when needed.

## Features

* **/help command** - A robust help command that uses the commands predefined name, description and options to automatically create a paginated list of each command, navigable by the attached arrow buttons.
* **Bot status** - Automatically update the bots status each minute with the bot's total server count.
* **Global/Local Scopes** - Set either global or local commands based on what suits your project. I may add a way to do both in future, depending on factors such as per server settings.
* **Cache System** - A basic cache system for interactions, users and servers to store data without having to constantly query the database unless it is necessary.
* **Interaction Handler** - A simple, but robust method of handling slash commands/buttons and select menus using handlers and a registry for the interactions.

### Interaction Registry (Button and Select Menu handler)

#### In the command file itself

* When defining a button or select menu's customId, specify the original interaction id and the related function in the handler you want to associate with the button

```js
const button = new Discord.MessageButton()
    .setCustomId(`${interaction.id}.onButton`)

const menu = new Discord.MessageSelectMenu()
    .setCustomId(`${interaction.id}.onMenu`)
```

* Setting the handlers into the interactions registry in order to access later as needed

```js
const { interactions } = require('../registry.js');

//create the handlers
const handlers = {
    interaction,
    onButton: async function(componentInteraction) {
        // do the thing

        if (doneAbsolutelyEverythingYouNeedToDo) handlers.onEnd();
    },
    onMenu: async function(componentInteraction) {
        const { values } = componentInteraction;
        
        // also do the thing

        if (doneAbsolutelyEverythingYouNeedToDo) handlers.onEnd();
    },
    onEnd: function(componentInteraction) {
        // only delete if you are 100% finished with the interaction
        interactions.delete(handlers.interaction.id);
    }
}

// store the handlers in registry
interactions.set(interaction.id, handlers);

// initial edit when everything is setup
try {
    await interaction.editReply({
        content: 'text',
        embeds: [embed],
        components: [buttons, menus]
    });
} catch (err) { console.error(err); }

// delete the interaction after x minutes
// interactions last 15m max so do <15 or delete this altogether
setTimeout(async function() {
    try {
        interactions.delete(interaction.id);
        
        // empty components if you want to deter button presses on expired interactions
        await interaction.editReply({
            content: 'text',
            embeds: [embed],
            components: []
        });
    } catch (err) { console.error(err); }
}, 1000 * 60 * x);
```

#### Back in the main.js file, where you handle slash commands

* Handling all buttons and select menus in a few lines

```js
const { interactions } = require('./registry.js');

client.on('interactionCreate', async (interaction) => {
    // if the interaction is from a / command
    if (interaction.isCommand()) {
        // execute command file
    }
    
    //if the interaction comes from a button/select menu
    if (interaction.customId) {
        // find the matching command using the id at the start of the button's customId
        const [interactionID, handlerFunction] = interaction.customId.split('.');
        const cachedInteraction = interactions.get(interactionID);

        // execute the function specified in the button's customId
        if (cachedInteraction) cachedInteraction[handlerFunction](interaction);
    }
});
```

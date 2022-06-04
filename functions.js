const functions = {
    //wait x milliseconds
    sleep: async function(ms = 1000) { // each 1000 = 1 second, sleep() will do 1 second by default but sleep(30000) will wait 30 seconds
        new Promise(resolve => setTimeout(resolve, ms));
    },

    //search servers for a particular emoji
    getEmoji: function (client, emoji) {
        if (emoji) {
            for (const guild of client.guilds.cache) {
                if (guild) {
                    let emo = guild.emojis.cache.find(e => e.name.toLowerCase() === emoji.toLowerCase());
                    if (emo) return emo;
                }
            }
        }

        //return ? if no emoji found
        return '❓';
    }
}

module.exports = functions;
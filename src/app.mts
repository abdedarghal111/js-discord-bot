//iniciar el bot
import './class/Bot.mts'

import { Events, EmbedBuilder } from 'discord.js'
import { Bot } from './class/Bot.mts'

import { welcome } from './res/embedMessages.mts'
import { Configuration } from './class/Configuration.mts'
import { Log } from './class/Log.mts'



Bot.client.on(Events.GuildMemberAdd, async member => {
  if (Configuration.welcomeChannelID === undefined) {
    Log.warn('No se ha configurado el canal de bienvenida, añadelo usando el comando set', 1)
    return

  }
  else {
    welcome
      .setTitle('Hola ' + member.user.displayName + ", Bienvendido a facturascripts!")
    Configuration.welcomeChannelID.send({ content: `<@${member.id}>` })
    Configuration.welcomeChannelID.send({ embeds: [welcome] })
  }

})

Bot.client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    let command = Bot.slashCommands[interaction.commandName]

    if (command) {
      command['action'](interaction)
    } else {
      interaction.reply(`No hay ningún comando nombrado \`${interaction.commandName}\`!`)
    }
  }
})
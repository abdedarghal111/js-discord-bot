import { ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Configuration } from "../class/Configuration.mts";
import { slashCommands } from "./commands.mts";
import { welcome } from "../res/embedMessages.mts";
import { DatabaseManager } from "../class/DatabaseManager.mts";
import { getMembers } from "../lib/helpers.mts";

const viewCommand = new SlashCommandBuilder()
    .setName('view')
    .setDescription('Comando para ver la configuracion, miembros del canal, etc...')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild)
    .addSubcommandGroup(subcommandGroup => subcommandGroup
        .setName('bot')
        .setDescription('Comando para ver la configuracion del bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('config')
                .setDescription('Comando para ver la configuracion del bot')
        )
    )
    .addSubcommandGroup(subcommandGroup => subcommandGroup
        .setName('server')
        .setDescription('Comando pra ver los miembros o el mensaje de bienvenida')
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Ver los miembros del canal')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('welcome')
                .setDescription('Prevuisualizar el mensaje de bienvenida')
        )
    )
    .addSubcommandGroup(subcommandGroup => subcommandGroup
        .setName('commands')
        .setDescription('Comando para ver la lista de comandos')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Ver la lista de comandos')
        )
    )
    .addSubcommandGroup(subcommandGroup => subcommandGroup
        .setName('chatbot')
        .setDescription('Muestra el uso del chatbot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('usage')
                .setDescription('Ver el uso del chatbot')
        )
    )


async function botGroup(interaction: ChatInputCommandInteraction) {
    let subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
        case 'config':
            let outMess = '';
            Configuration.getProperties().forEach((property) => {
                outMess += `- \`${property} = ${Configuration[property]}\`\n`
            });
            let embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Propiedades')
                .setDescription(outMess)
                .setTimestamp()
            interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            break;
    }
}

async function serverGroup(interaction: ChatInputCommandInteraction) {
    let subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
        case 'status':
            let membersInfo = await getMembers(interaction.channel);
            let embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Miembros del servidor')
                .addFields(
                    { name: 'Miembros', value: membersInfo.channelMembers.toString() },
                    { name: 'Usuarios', value: membersInfo.channelUsers.length.toString() },
                    { name: 'Bots', value: membersInfo.channelBots.length.toString() }
                )

            interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            break;
        case 'welcome':
            welcome.setTitle('Hola ' + interaction.user.displayName + ", Bienvendido a facturascripts!")
            interaction.reply({ embeds: [welcome], flags: MessageFlags.Ephemeral });
            break;
    }
}

async function commandsGroup(interaction: ChatInputCommandInteraction) {
    let subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
        case 'list':
            let list = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Lista de comandos')
                .setDescription('Lista de comandos disponibles')
                .addFields(
                    ...Object.entries(slashCommands).map(([name, { command, action }]) => ({
                        name: `/${name}`,
                        value: command.description || 'Sin descripción',
                        inline: false
                    }))
                )
            interaction.reply({ embeds: [list], flags: MessageFlags.Ephemeral });
            break;
    }
}

async function chatbotGroup(interaction: ChatInputCommandInteraction) {
    let subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
        case 'usage':
            let embed_stats = new EmbedBuilder()
            let data = await DatabaseManager.getChatbotStats(interaction.user.id)

            if (data === null) {
                embed_stats
                    .setColor(0x0099FF)
                    .setTitle('Uso de chatbot')
                    .addFields(
                        { name: 'Chats abiertos', value: '0' },
                        { name: 'Mensajes respondidos', value: '0' },
                        { name: 'Longitud de caracteres', value: '0' }
                    )
            } else {
                embed_stats
                    .setColor(0x0099FF)
                    .setTitle('Uso de chatbot')
                    .addFields(
                        { name: 'Chats abiertos', value: data.chats_opened.toString() },
                        { name: 'Mensajes respondidos', value: data.messages_replied.toString() },
                        { name: 'Longitud de caracteres', value: data.char_length.toString() }
                    )
            }
            interaction.reply({ embeds: [embed_stats], flags: MessageFlags.Ephemeral });
            break;
    }
}


async function viewAction(interaction: ChatInputCommandInteraction) {
    const group = interaction.options.getSubcommandGroup();
    switch (group) {
        case 'bot':
            await botGroup(interaction);
            break;
        case 'server':
            await serverGroup(interaction);
            break;
        case 'commands':
            await commandsGroup(interaction);
            break;
        case 'chatbot':
            await chatbotGroup(interaction);
            break;
        default:
            interaction.reply({ content: 'Comando no valido', flags: MessageFlags.Ephemeral });
            break;
    }
}

export { viewCommand, viewAction }
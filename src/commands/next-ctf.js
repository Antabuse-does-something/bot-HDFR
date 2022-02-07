const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const {MessageEmbed} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nextctf')
		.setDescription('Shows the Next CTF available in CTFTime')
		.addIntegerOption(option => option.setName('numberctf').setDescription('Number of CTF to show')),
	async execute(interaction) {
		let nbCtf = interaction.options.getInteger('numberctf');
		if(!nbCtf){
			nbCtf = 1;
		}
		else{
			nbCtf = nbCtf > 5 ? 5 : nbCtf;
		}
		fetch(`https://ctftime.org/api/v1/events/?limit=${nbCtf}&start=${interaction.createdTimestamp}&finish=${interaction.createdTimestamp+604800000}`)
			.then(
				response =>{
					response.json()
						.then(
							async body => {
								if(body == []){
									let embed = new MessageEmbed()
											.setTitle(`Error :x:`)
											.setColor("RED")
											.addField(`There is no CTF in the next 7 days`,`Please try again later`);
									await interaction.reply(embed);
									return;
								}
								nbCtf = nbCtf > body.length ? body.length : nbCtf;
								let embedArray = [];
								for(let i = 0; i < nbCtf; i++){
									let start = body[i].start.split('T')
                    				let end = body[i].finish.split('T')
									let embed = new MessageEmbed()
									.setTitle("Upcomming CTFs")
									.setColor("#36393f")
									if (body[i].title == '_EVENT CHANGED_' && i <body.length -1) {
										embed.setDescription(body[i+1].title + "**event changed**",`${body[i+1].description}`)
										i++;
									}
									else{
										embed.setDescription(body[i].title,`${body[i].description}`)
									}		
									embed.addField(
										":information_source: Infos",
										`**Starts on :** ${start[0]}, at : ${start[1]} \n
										**Host by :** ${body[i].organizers.name} \n
										**Ends :** ${end[0]}, at : ${end[1]} \n
										**Website :** ${body[i].url} \n
										**CTF Time URL :** ${body[i].ctftime_url} \n
										**IRL CTF ? :** ${body[i].onsite} \n
										**Format :** ${body[i].format} \n 
										**Duration :** ${body[i].duration.hours} Heures & ${body[i].duration.days} Jours \n 
										**Number of Teams Interested :** ${body[i].participants} \n
										**Weight** ${body[i].weight} \n
										**CTF ID :** ${body[i].id}`
									)
									embed.setThumbnail(body[i].logo);
									embedArray.push(embed);
								}
								await interaction.reply({embeds : embedArray});
							},
							async err => {
								await interaction.reply(`Error while parsing the JSON`);
								console.log(err);
							}
						)
				},
				async err => {
					console.error(err);
					await interaction.reply("CTFTime might be down");
					return;
				}
			)
    }
}
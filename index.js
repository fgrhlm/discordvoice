const { exec } = require("child_process");
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

//////////////////////////
////// PREFERENCES //////
//////////////////////////

// Hallder voice connections
const connections = [];

// Gunnars hemmakanaler

const CHANNEL_OUTPUT_COMMANDS = "779462760610005022";   // Kanalen dit gunnar skickar ett upptäckt röstkommando för spladibot   //#spladi-bot
const CHANNEL_VOICE_DETECTION = "771956455946452992";   // Kanalen där gunnar tolkar tal                                        //Slumpmässiga fakulteten
const CHANNEL_OUTPUT_TRANSCRIPT = "840752797019406378"; // Kanalen dit gunnar skickar transkriptionen från deepspeech           //#gunnar

// Parse in kommandon från commands.json
let rawCommands = fs.readFileSync("./commands.json");
let commands = JSON.parse(rawCommands);

///////////////////////////
///// BEGIN BOT CODE //////
///////////////////////////

// Konverterar rå pcm pakete från discordjs ti naating användbart fö deepspeech
// TODO: Deepspeech's inference sku genereras snabbari ifall vi har sämber ljudkvalité :)

/* @param string : name -> name of file exported from guildMemberSpeaking event callback */
const ffmpegConvert = (name) => {
    /* 
    Int na vits ti bry se i stdout output, gar int ti gjö na åt saken ifall he skiter se 
    dessutom så bord int exec kast na exceptions..
    */
    exec(`ffmpeg -f s16le -ar 48k -ac 2 -i ./raw/${name}.pcm ./record/${name}.wav && rm ./raw/${name}.pcm`);
}

// Kör exporterat ljudklipp genom Deepspeech. Genererar en JSON fil innehållandes inferensen. Parsar JSON filn fö användning
/* @param string : audio -> name of file exported from guildMemberSpeaking event callback */
/* @param User : m -> userobject retrieved from guildMemberSpeaking event callback */
const DSInference = (audio,m) => {
    const _PATH_ = "/home/rcd/Projects/Node/discordvoice";

    exec(`./env/bin/deepspeech --model ${_PATH_}/deepspeech/deepspeech-0.9.3-models.pbmm --scorer ${_PATH_}/deepspeech/deepspeech-0.9.3-models.scorer --json --audio ${_PATH_}/record/${audio}.wav >> ${_PATH_}/transcripts/${audio}.json && rm ./record/${audio}.wav`,() => {
        // Dehär e jävligt hackigt...
        let raw = fs.readFileSync(`${_PATH_}/transcripts/${audio}.json`);
        let transcript = JSON.parse(raw);
        
        sendNiceDiscordLog(transcript,m);
        resolveToSpladiCommand(transcript.transcripts)

        exec(`rm ./transcripts/${audio}.json`);
    });
}

// Väger resultat från deepspeech och reder ut om he e ett spladibot kommando
// Ifall ett giltigt kommando har hittats så skickar e till #spladi-bot
/* @param Object : t -> transcript of audio clip generated by deepspeech in DSInference method */
const resolveToSpladiCommand = (t) => {
    if(t == undefined)
        return;

    let resolves = [];

    t.forEach((tObj) => {
        tObj.words.forEach((w,idx) => {
            if(w.word){
                commands.commands.forEach(c => {
                    c.triggers.forEach(t => {
                        let r = w.word.search(t)
                        if(r > -1){
                            let query = "";
                            for(let i=idx+1; i<tObj.words.length; i++){
                                query += tObj.words[i].word + " ";
                            }
                            if(c.hasQuery){
                                resolves.push(`${c.output} ${query}`);
                            }else{
                                resolves.push(c.output);
                            }
                        }
                    })
                })
            }
        })    
    })

    if(resolves.length > 0){
        client.channels.fetch(CHANNEL_OUTPUT_COMMANDS).then((channel => {
            channel.send(resolves[0]);
        }));
    }
}

// Printar ut en nice embed me transkriptionen från deepspeech
/* @param Object : t -> transcript of audio clip generated by deepspeech in DSInference method */
/* @param User : m -> userobject retrieved from guildMemberSpeaking event callback */
const sendNiceDiscordLog = (t, m) => {
    if(t == undefined)
        return;

    let str = "";

   t.transcripts[0].words.forEach((t)=>{
        str += t["word"] + " ";
    })

    client.channels.fetch(CHANNEL_OUTPUT_TRANSCRIPT).then((channel => {
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Gunnar - STT (Speech to Text)')
            .setURL('https://www.notasoftwaredevelopmentcompany.com')
            .addFields(
                { name: `${m.user.username} said:`, value: str },
            )
            .setTimestamp()
        channel.send(embed);
    }));
}

/////////////////
/* DISCORD.JS  */
/////////////////
client.on('ready', () => {
    // Gunnar connectar automatiskt till CHANNEL_VOICE_DETECTION
    console.log(`Logged in as ${client.user.tag}!`);
    client.channels.fetch(CHANNEL_VOICE_DETECTION).then((channel => {
        channel.join().then(con => {
            connections.push(con)
        })
    }));

    client.on("guildMemberSpeaking", (m,s)  => {
        // Hämtar nyast voice connectionen
        const con = connections[connections.length-1];
        // s -> er en boolean om guildMembern talar eller int
        if(s == 1){
            // Öppnar en stream från den som talar
            const audio = con.receiver.createStream(m,{mode: "pcm"});

            // Bara filnamnsgeneration
            let now = new Date();
            let now_string = now.getMilliseconds().toString();

            // Pipar audio streamen ner till en .pcm fil <- Dehär e bara RÅ pcm paket
            // När strömmen stängs (dähär skeer automagiskt) så konverterar vi skiten o kör genom deepspeech
            audio.pipe(fs.createWriteStream(`./raw/${now_string}.pcm`).on("finish",() => {
                ffmpegConvert(now_string)
                DSInference(now_string,m);
            }));
        }
    })
});

client.login('ODQwMzYzMTE0MjE4Mzg5NTI0.YJXHIw.03nqWBwGlMrPv7gw2ePMuoxLIXA');
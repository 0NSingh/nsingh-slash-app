import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
    ISlashCommand,
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';
import { PersistenceHelper } from '../persistence/Helper';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IMessage } from '@rocket.chat/apps-engine/definition/messages';
import { PostSentService } from '../services/PostSentService';

export class GithubCommand implements ISlashCommand {
    public command = '0nsingh'; 
    public i18nParamsExample = '';
    public i18nDescription = '';
    public providesPreview = false;

    private async sendMessage(context: SlashCommandContext, modify: IModify, message: string): Promise<void> {
    const messageStructure = modify.getCreator().startMessage();
    const sender = context.getSender(); 
    const room = context.getRoom();
    
    messageStructure
        .setSender(sender)
        .setRoom(room)
        .setText(message);
    
    await modify.getCreator().finish(messageStructure);


}
    private async setEphemereal(setting:boolean,persis:IPersistence):Promise<boolean>{
       return PersistenceHelper.persist(persis, "ephemereal" , undefined,'status',{'enabled':setting} )
    
}


    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp,persistence:IPersistence): Promise<void> {
const sender = context.getSender();
    
    // Hardcoded check: Replace 'your_username' with your actual Rocket.Chat username
    const AUTHORIZED_USER = 'nimrit.singh'; 

    if (sender.username !== AUTHORIZED_USER) {
        // We use the Notifier to send a private "hidden" message to the unauthorized user
        const message = "Access Denied: Only the App Creator can run this command.";
        await PostSentService.notifyMessage(context.getRoom(), read, message,sender);
        return; 
    }
        const [subcommand] = context.getArguments(); 

        if (!subcommand) { 
            throw new Error('Error!');
        }

        switch (subcommand) { 
            case 'on' : 
                const ephemerealOn=await this.setEphemereal(true,persistence);
                if (ephemerealOn) {
                await this.sendMessage(context, modify, 'Ephemereal messages are enabled!');
                }
                else{await this.sendMessage(context, modify, 'Ephemereal messages setting failed!');
}
                break;

            case 'off': 
                const ephemerealOff= await this.setEphemereal(false,persistence);
                
                if (ephemerealOff) {
                await this.sendMessage(context, modify, 'Ephemereal messages are disabled!');
                }
                break;

            default: 
                throw new Error('Error!');
        }
    }
}
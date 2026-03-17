
import { IAppAccessors, IHttp, ILogger, IPersistence, IPersistenceRead, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { PersistenceHelper } from "../persistence/Helper";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";


export class PostSentService{


public static async checkMessageEligibility(persis:IPersistenceRead,logger:ILogger,sender:IUser,url?:string): Promise<boolean>{
    const status= await PersistenceHelper.findAll(persis,'status','ephemereal');
    logger.debug(status);
    const [{data}]= status as any;
    const AUTHORIZED_USER='nimrit.singh'
    if (data.enabled && sender.username!==AUTHORIZED_USER){
        return true;
    }
    else if (data.enabled && sender.username!==AUTHORIZED_USER && url){
        return true;

    }
    else{
        return false;
    }

}
private static async sendRequest(url:string,message:IMessage,sender:string,http:IHttp):Promise<string>{
    const response=await http.post(url,
        {data:{
        'userid':sender,
        'message':message
    }});
    const data=response.data
    if (!data.result){
        return data.error
    }
    return data.result
}
public static async executeNotification(
    persis: IPersistence,
    message: IMessage,
    read: IRead,
    http: IHttp,
    logger: ILogger,
    url?: string
): Promise<void> {
    const persisRead = read.getPersistenceReader();
   
    let notificationText = `Thank you for mentioning me @${message.sender.username}`;
    if (url && url.trim() !== "") {
        try {
            const result = await this.sendRequest(url, message, message.sender.id,http);
            
            // If the external server provides a specific message, use it
            if (result) {
                notificationText = typeof result === 'string' ? result : result;
            }
        } catch (error) {
            logger.error(`Failed to send external request: ${error.message}`);
        }
    }

    await this.notifyMessage(message.room, read, notificationText, message.sender);
    await PersistenceHelper.persist(persis, 'sent', message.room, 'message', message);

    const captured = await PersistenceHelper.findAll(persisRead, 'message', 'sent');
    logger.debug('All captured messages:', captured);
}
   public static async notifyMessage( room:IRoom, read:IRead, message: string, author: IUser): Promise<void> {
       const notifier = read.getNotifier();
       const messageBuilder = notifier.getMessageBuilder();
       messageBuilder.setText(message);
       messageBuilder.setRoom(room)
       return notifier.notifyUser(author, messageBuilder.getMessage());
    }
}

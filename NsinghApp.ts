import {
   IAppAccessors,
   IConfigurationExtend,
   IConfigurationModify,
   IEnvironmentRead,
   IHttp,
   ILogger,
   IModify,
   IPersistence,
   IPersistenceRead,
   IRead,

} from '@rocket.chat/apps-engine/definition/accessors';

import { IUser } from '@rocket.chat/apps-engine/definition/users/IUser';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { GithubCommand } from './commands/GithubCommand';
import { IMessage, IPostMessageSent } from '@rocket.chat/apps-engine/definition/messages';
import { PostSentService } from './services/PostSentService';
import { AppSetting, settings } from './config/Settings';
import { ISetting } from '@rocket.chat/apps-engine/definition/settings';
// import { PostSentService } from './services/PostSentService';

export class NsinghApp extends App implements IPostMessageSent {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }
    public async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead):Promise<void> {
    configuration.slashCommands.provideSlashCommand(new GithubCommand());
         await Promise.all(
            settings.map((setting) =>
                configuration.settings.provideSetting(setting)
            )
        );
}
   public async onSettingUpdated(setting: ISetting, configurationModify: IConfigurationModify, read: IRead, http: IHttp): Promise<void> {
        let list_to_log = ["Setting was Updated. SUCCESS MESSAGE: ", setting]

        this.getLogger().success(list_to_log);
        this.getLogger().info(list_to_log);
        this.getLogger().debug(list_to_log);
        this.getLogger().warn(list_to_log);
        this.getLogger().error(list_to_log);

        return super.onSettingUpdated(setting, configurationModify, read, http);
    }
   async checkPostMessageSent?(message: IMessage, read: IRead, http: IHttp): Promise<boolean> { 
        const url:string = await read.getEnvironmentReader().getSettings().getValueById(AppSetting.ExternalLogger)
        const eligible= await PostSentService.checkMessageEligibility(read.getPersistenceReader(),this.getLogger(),message.sender,url);
        return eligible
    }
   

   async executePostMessageSent(message: IMessage, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<void> {

    const url:string = await read.getEnvironmentReader().getSettings().getValueById(AppSetting.ExternalLogger);
    if (url!==''){
    await PostSentService.executeNotification(persistence,message,read,http,this.getLogger(),url)
   }
   else{
     await PostSentService.executeNotification(persistence,message,read,http,this.getLogger())

   }
}
   
}
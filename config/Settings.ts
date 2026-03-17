import { ISetting, SettingType} from '@rocket.chat/apps-engine/definition/settings';

export enum AppSetting {
ExternalLogger="external_logger",

}

export const settings: Array<ISetting> = [
    {
        id: AppSetting.ExternalLogger, // referring to the setting ID
        section: "App_Logger", // the name of the section to put this setting under
        public: true, // Whether this setting is a public setting or not - administrators can see ones which are not public but users can't.
        type: SettingType.STRING, // the category of the setting
        value: "#General", // initial value
        packageValue: "", // the default value
        hidden: false, // whether this setting must be hidden from the admin. Note that a setting cannot be hidden and required at the same time.
        i18nLabel: 'External_Logger', // this is the name of the setting that will appear in the UI
        i18nDescription: 'External_Logger_Desc', // you can add a description for the setting to provide additional information to users
        required: false, // specify whether the setting is a mandatory field or not
    },
      
]
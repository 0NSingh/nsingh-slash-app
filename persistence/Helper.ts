import { IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
export class PersistenceHelper {
    public static async persist(
        persis: IPersistence, 
        id: string, 
        room?: IRoom,
        label: string = 'message',
        data?:object
    ): Promise<boolean> {
        const associations: Array<RocketChatAssociationRecord> = [
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, label), 
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, id),
        ];
if (room) {
        associations.push(new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, room.id));
    }
        try {
            // We save an object containing both the ID and the specific type
            await persis.updateByAssociations(associations, { id, type: label,data }, true);
        } catch (err) {
            console.warn(err);
            return false;
        }
        return true;
    }
    public static async findAll(persis: IPersistenceRead,label:string='message',id?:string): Promise<Array<object>> {
        const associations: Array<RocketChatAssociationRecord> = [
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, label),
        ];
        if (id){
            associations.push(            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, id),)
        }

        let result: Array<object> = [];
        try {
            const records: Array<{ id: string,data:object }> = (await persis.readByAssociations(associations)) as Array<{ id: string,data:object }>;

            if (records.length) {
                result = records.map(({ id,data }) => ({id,data}));
            }
        } catch (err) {
            console.warn(err);
        }

        return result;
    }

    // query all records by room within the "scope" - message
    public static async findByRoom(persis: IPersistenceRead, room: IRoom,label:string='message'): Promise<Array<string>> {
        const associations: Array<RocketChatAssociationRecord> = [
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, label),
            new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, room.id),
        ];

        let result: Array<string> = [];
        try {
            const records: Array<{ id: string }> = (await persis.readByAssociations(associations)) as Array<{ id: string }>;

            if (records.length) {
                result = records.map(({ id }) => id);
            }
        } catch (err) {
            console.warn(err);
        }

        return result;
    }

    // remove all records by room within the "scope" - message
    public static async removeByRoom(persis: IPersistence, room: IRoom,label:string='message'): Promise<boolean> {
        const associations: Array<RocketChatAssociationRecord> = [
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, label),
            new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, room.id),
        ];

        try {
            await persis.removeByAssociations(associations);
        } catch (err) {
            console.warn(err);
            return false;
        }

        return true;
    }

    // remove all records by id within the "scope" - message
    public static async removeById(persis: IPersistence, id: string,label:string='message'): Promise<boolean> {
        const associations: Array<RocketChatAssociationRecord> = [
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, label),
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, id),
        ];

        try {
            await persis.removeByAssociations(associations);
        } catch (err) {
            console.warn(err);
            return false;
        }

        return true;
    }

    // remove all records within the "scope" - message
    public static async clear(persis:IPersistence,label:string='message'): Promise<boolean> {
        const associations: Array<RocketChatAssociationRecord> = [
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, label),
        ];

        try {
            await persis.removeByAssociations(associations);
        } catch (err) {
            console.warn(err);
            return false;
        }

        return true;
    }
}
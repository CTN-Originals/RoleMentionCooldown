import { Guild, GuildMember, User } from "discord.js";
import { GuildConfig } from "../data/orm/guildConfig";

export enum GuildMemberType {
	Member = 'Member',
	Admin = 'Admin',
	Owner = 'Owner',
}

/** An object with permission fields to compare to a UserPermissions class
 * @note If a field is set to true, a permission check will pass if the UserPermission field is also true
 * @note If a field is set to false, the UserPermission does not have to contain this field as true
 * @note The permissions check will pass at a single match, it is not required to match 'true' values.
*/
export class PermissionObject {
	public guildOwner: boolean = false;
	public guildAdmin: boolean = false;
	public configAdmin: boolean = false;
	public botCreator: boolean = false;

	constructor(input: Partial<PermissionObject>) {
		for (const field in input) {
			this[field] = input[field];
		}
	}

	/** All values combined and compared to eachother
	 * @returns True if all values are true, false otherwise
	*/
	public get combined(): boolean {
		for (const field in this) {
			if (this[field] === false) { return false; }
		}
		return true;
	}
}

export class UserPermissions {
	constructor(public guild: Guild, public user: User) { }
	
	/** Is this user the creator of the bot?
	 * @note This should only be used in cases of debug commands.
	 * @note This should never be used for any of the guild config commands or any other things like that as that would be a breach of security for the server.
	*/
	public get isBotCreator(): boolean {
		return (process.env.AUTHOR_ID === this.user.id);
	};

	private async getMember(): Promise<GuildMember> {
		const member = await this.guild.members.fetch({user: this.user.id})
		if (member === undefined) {
			throw new Error(`User (${this.user.id}) could not be found in member list of guild (${this.guild.id})`)
		}
		return member;
	}

	/** Does this user have any of the admin roles registered in the guild config */
	public async isConfigAdmin(): Promise<boolean> {
		const config = await GuildConfig.get(this.guild.id);

		const member = await this.getMember();
		for (const role in member.roles) {
			if (config.adminRoles.includes(member.roles[role])) {
				return true;
			}
		}

		return false;
	};

	public async getMemberType(): Promise<GuildMemberType> {
		if (this.guild.ownerId == this.user.id) 
			return GuildMemberType.Owner;

		if ((await this.getMember()).permissions.has("Administrator")) 
			return GuildMemberType.Admin;

		return GuildMemberType.Member;
	};

	public async validate(permissions: PermissionObject): Promise<boolean> {
		const memberType = await this.getMemberType();
		
		//? ordered from most to least likely with a bit of bias towards which check costs more performance
		if (
			permissions.combined ||
			(permissions.guildAdmin && memberType === GuildMemberType.Admin) ||
			(permissions.guildOwner && memberType === GuildMemberType.Owner) ||
			(permissions.configAdmin && await this.isConfigAdmin()) ||
			(permissions.botCreator && this.isBotCreator)
		) { return true; }

		return false;
	}
}

export async function validateUserPermission(permissions: PermissionObject, guild: Guild, user: User) {
	return await new UserPermissions(guild, user).validate(permissions);
}
import { Guild, GuildMember, User } from "discord.js";
import { GuildConfig } from "../data/orm/guildConfig";

export enum GuildMemberType {
	Member = 'Member',
	Admin = 'Admin',
	Owner = 'Owner',
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
}
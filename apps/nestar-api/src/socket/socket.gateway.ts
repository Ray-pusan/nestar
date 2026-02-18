import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import { AuthService } from '../components/auth/auth.service';
import { Member } from '../libs/dto/member/member';
import * as url from 'url';
import { link } from 'fs';

interface MessagePayload {
	exent: string;
	text: string;
	memberData: Member;
}

interface InfoPayload {
	exent: string;
	totalClients: number;
	memberData: Member;
	action: string;
}

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventGateway');
	private summaryClient: number = 0;
	private clientsAuthMap = new Map<WebSocket, Member>();
	private messagesList: MessagePayload[] = [];

	constructor(private authService: AuthService) {}

	@WebSocketServer()
	server: Server;

	public afterInit(server: any) {
		this.logger.verbose(`=== Client cinnected total: ${this.summaryClient} ==`);
	}

	private async retrieveAuth(req: any): Promise<Member> {
		try {
			const parseUrl = url.parse(req.url, true);
			const { token } = parseUrl.query;
			return await this.authService.verifyToken(token as string);
		} catch (err) {
			return null;
		}
	}

	public async handleConnection(client: WebSocket, req: any) {
		const authMember = await this.retrieveAuth(req);
		this.summaryClient++;
		this.clientsAuthMap.set(client, authMember);

		const clientNick: string = authMember ? authMember.memberNick : 'mehon';
		this.logger.verbose(`=== Client ${clientNick} connected total: ${this.summaryClient} ==-=`);

		const infoMsg: InfoPayload = {
			exent: 'info',
			totalClients: this.summaryClient,
			memberData: authMember,
			action: 'joined',
		};

		this.emitMessage(infoMsg);
		// CLIENT
		client.send(JSON.stringify({ event: 'getMessages', list: this.messagesList }));
	}

	public handleDisconnect(client: WebSocket) {
		const authMember = this.clientsAuthMap.get(client);
		this.summaryClient--;
		this.clientsAuthMap.delete(client);

		const clientNick: string = authMember ? authMember.memberNick : 'mehon';
		this.logger.verbose(`=== Client disconnected ${clientNick} left total: ${this.summaryClient} = = `);

		const infoMsg: InfoPayload = {
			exent: 'info',
			totalClients: this.summaryClient,
			memberData: authMember,
			action: 'left',
		};
		this.broadcastMessage(client, infoMsg);
	}

	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: any): Promise<void> {
		const authMember = this.clientsAuthMap.get(client);
		const newMessage: MessagePayload = {
			exent: 'message',
			text: payload,
			memberData: authMember,
		};

		const clientNick: string = authMember ? authMember.memberNick : 'mehon';
		this.logger.verbose(`Received ${clientNick} message: ${payload}`);

		this.messagesList.push(newMessage);
		if (this.messagesList.length > 5) this.messagesList.splice(0, this.messagesList.length - 5);

		this.emitMessage(newMessage);
	}

	private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client: WebSocket) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	private emitMessage(message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client: WebSocket) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}
}

/***
 *     MESSAGE TARGET
 *  1. Clinet
 *   2. Broadcast (except client)
 *   3. Emit (all clients)
 *
 */
